import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BreakType } from "@/types/database";
import { resolveAuthenticatedUser } from "@/lib/multitenant/auth-guard";

const ALLOWED_ACTIONS = new Set(["CLOCK_IN", "TAKE_BREAK", "RESUME", "CLOCK_OUT"]);
const ALLOWED_BREAKS = new Set(["LUNCH", "SHORT_BREAK", "PERSONAL"]);

export async function POST(request: Request) {
  try {
    const user = await resolveAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to perform attendance actions." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, studentId, breakType = "LUNCH" } = body;

    if (!studentId || !action || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: "Valid studentId and recognized action are required" },
        { status: 400 }
      );
    }

    const safeBreakType = ALLOWED_BREAKS.has(breakType) ? breakType : "LUNCH";
    const adminClient = createAdminClient();

    // IDOR Protection: Students/Interns can only mutate their own attendance record
    const isPrivilegedManager = [
      "SUPER_ADMIN",
      "ORG_ADMIN",
      "ADMIN",
      "MANAGER_SUPERVISOR",
      "HR_COORDINATOR",
      "ORG_OWNER",
    ].includes(user.role);

    if (!isPrivilegedManager) {
      let isOwner = user.userId === studentId;
      if (!isOwner) {
        const { data: ownSp } = await adminClient
          .from("student_profiles")
          .select("id")
          .eq("user_id", user.userId)
          .eq("id", studentId)
          .maybeSingle();

        if (ownSp) {
          isOwner = true;
        }
      }

      if (!isOwner) {
        return NextResponse.json(
          {
            error: "Access Denied: Insecure Direct Object Reference detected. You cannot modify attendance for another student.",
          },
          { status: 403 }
        );
      }
    }
    const todayStr = new Date().toISOString().split("T")[0];

    // Check for today's active work session
    const { data: existingSession } = await adminClient
      .from("work_sessions")
      .select("*, work_breaks(*)")
      .eq("student_id", studentId)
      .eq("work_date", todayStr)
      .single();

    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    // 1. CLOCK IN
    if (action === "CLOCK_IN") {
      if (existingSession) {
        if (existingSession.status === "COMPLETED") {
          return NextResponse.json(
            { error: "You have already completed your work session for today." },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { error: "You already have an active work session today." },
          { status: 400 }
        );
      }

      const { data: newSession, error: insertErr } = await adminClient
        .from("work_sessions")
        .insert({
          student_id: studentId,
          work_date: todayStr,
          clock_in_at: nowIso,
          status: "WORKING",
          total_seconds: 0,
          productive_seconds: 0,
        })
        .select()
        .single();

      if (insertErr || !newSession) {
        throw new Error(insertErr?.message || "Failed to start work session");
      }

      // Audit Log
      await adminClient.from("audit_logs").insert({
        actor_user_id: studentId,
        actor_role: "STUDENT",
        action: "ATTENDANCE_CLOCK_IN",
        entity_type: "WORK_SESSION",
        entity_id: newSession.id,
        new_status: "WORKING",
        metadata: { clock_in_at: nowIso },
      });

      return NextResponse.json({
        success: true,
        session: newSession,
        message: "Clock-in successful. Productive session started.",
      });
    }

    // 2. TAKE BREAK
    if (action === "TAKE_BREAK") {
      if (!existingSession || existingSession.status !== "WORKING") {
        return NextResponse.json(
          { error: "No active working session found to pause." },
          { status: 400 }
        );
      }

      // Create new break record
      const { error: breakErr } = await adminClient
        .from("work_breaks")
        .insert({
          work_session_id: existingSession.id,
          break_type: safeBreakType as BreakType,
          started_at: nowIso,
          duration_seconds: 0,
        })
        .select()
        .single();

      if (breakErr) throw new Error(breakErr.message);

      // Update session status to ON_BREAK
      await adminClient
        .from("work_sessions")
        .update({ status: "ON_BREAK" })
        .eq("id", existingSession.id);

      // Audit Log
      await adminClient.from("audit_logs").insert({
        actor_user_id: studentId,
        actor_role: "STUDENT",
        action: "ATTENDANCE_BREAK_START",
        entity_type: "WORK_SESSION",
        entity_id: existingSession.id,
        new_status: "ON_BREAK",
        metadata: { break_type: safeBreakType, started_at: nowIso },
      });

      return NextResponse.json({
        success: true,
        message: `Break (${safeBreakType}) started.`,
      });
    }

    // 3. RESUME WORK
    if (action === "RESUME") {
      if (!existingSession || existingSession.status !== "ON_BREAK") {
        return NextResponse.json(
          { error: "You are not currently on a break." },
          { status: 400 }
        );
      }

      // Find the open break record
      const openBreak = existingSession.work_breaks?.find(
        (b: { ended_at?: string }) => !b.ended_at
      );
      if (openBreak) {
        const breakStartMs = new Date(openBreak.started_at).getTime();
        const durationSec = Math.max(0, Math.floor((nowMs - breakStartMs) / 1000));

        await adminClient
          .from("work_breaks")
          .update({
            ended_at: nowIso,
            duration_seconds: durationSec,
          })
          .eq("id", openBreak.id);
      }

      // Set session status to WORKING
      await adminClient
        .from("work_sessions")
        .update({ status: "WORKING" })
        .eq("id", existingSession.id);

      // Audit Log
      await adminClient.from("audit_logs").insert({
        actor_user_id: studentId,
        actor_role: "STUDENT",
        action: "ATTENDANCE_RESUME_WORK",
        entity_type: "WORK_SESSION",
        entity_id: existingSession.id,
        new_status: "WORKING",
        metadata: { resumed_at: nowIso },
      });

      return NextResponse.json({
        success: true,
        message: "Resumed work session.",
      });
    }

    // 4. CLOCK OUT
    if (action === "CLOCK_OUT") {
      if (!existingSession || existingSession.status === "COMPLETED") {
        return NextResponse.json(
          { error: "No active session available to clock out." },
          { status: 400 }
        );
      }

      // Close open break if any
      const finalBreaks = (existingSession.work_breaks || []) as Array<{
        id: string;
        started_at: string;
        ended_at?: string;
        duration_seconds: number;
      }>;
      const openBreak = finalBreaks.find((b) => !b.ended_at);
      if (openBreak) {
        const breakStartMs = new Date(openBreak.started_at).getTime();
        const durSec = Math.max(0, Math.floor((nowMs - breakStartMs) / 1000));
        await adminClient
          .from("work_breaks")
          .update({ ended_at: nowIso, duration_seconds: durSec })
          .eq("id", openBreak.id);
        openBreak.duration_seconds = durSec;
      }

      // Calculate total duration & productive duration on the server!
      const clockInMs = new Date(existingSession.clock_in_at).getTime();
      const totalSeconds = Math.max(0, Math.floor((nowMs - clockInMs) / 1000));
      const totalBreakSeconds = finalBreaks.reduce(
        (sum: number, b) => sum + (b.duration_seconds || 0),
        0
      );
      const productiveSeconds = Math.max(0, totalSeconds - totalBreakSeconds);

      const { data: closedSession, error: closeErr } = await adminClient
        .from("work_sessions")
        .update({
          clock_out_at: nowIso,
          status: "COMPLETED",
          total_seconds: totalSeconds,
          productive_seconds: productiveSeconds,
        })
        .eq("id", existingSession.id)
        .select()
        .single();

      if (closeErr) throw new Error(closeErr.message);

      // Audit Log
      await adminClient.from("audit_logs").insert({
        actor_user_id: studentId,
        actor_role: "STUDENT",
        action: "ATTENDANCE_CLOCK_OUT",
        entity_type: "WORK_SESSION",
        entity_id: existingSession.id,
        new_status: "COMPLETED",
        metadata: {
          clock_out_at: nowIso,
          total_seconds: totalSeconds,
          productive_seconds: productiveSeconds,
        },
      });

      return NextResponse.json({
        success: true,
        session: closedSession,
        message: "Work session completed and logged successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Attendance operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
