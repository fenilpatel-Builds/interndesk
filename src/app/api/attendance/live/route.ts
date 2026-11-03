import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { liveAttendanceStore } from "@/lib/attendance/live-attendance-store";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";

export async function GET(req: NextRequest) {
  try {
    const list = liveAttendanceStore.getAll();

    const summary = {
      total: list.length,
      working: list.filter((s) => s.status === "WORKING").length,
      onBreak: list.filter((s) => s.status === "ON_BREAK").length,
      completed: list.filter((s) => s.status === "COMPLETED").length,
      notCheckedIn: list.filter((s) => s.status === "NOT_CHECKED_IN").length,
    };

    return NextResponse.json({
      success: true,
      summary,
      students: list,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load live attendance";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const body = await req.json();

    const email = body.email || session?.email;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updated = liveAttendanceStore.updateStudentStatus(email, {
      status: body.status,
      clockInTime: body.clockInTime,
      clockOutTime: body.clockOutTime,
      currentBreak: body.currentBreak,
      breakDurationMinutes: body.breakDurationMinutes,
      workedMinutes: body.workedMinutes,
      location: body.location,
    });

    return NextResponse.json({
      success: true,
      attendance: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update live attendance";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

