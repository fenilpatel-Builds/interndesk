import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
import { assessmentStore } from "@/lib/assessments/assessment-store";

async function verifyAdminAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    req.cookies.get("interndesk_user")?.value ||
    req.cookies.get("akash_user")?.value ||
    cookieStore.get("interndesk_user")?.value ||
    cookieStore.get("akash_user")?.value;

  const session = safeParseSession(token);
  const headerEmail = req.headers.get("x-user-email");
  const adminEmail = session?.email || headerEmail;

  const roleStr = String(session?.role || "");
  const isAdmin =
    isUserAdmin(adminEmail) ||
    roleStr === "ORG_ADMIN" ||
    roleStr === "SUPER_ADMIN" ||
    roleStr === "ADMIN";

  if (!adminEmail || !isAdmin) {
    return { isAuthorized: false, adminEmail: null };
  }
  return { isAuthorized: true, adminEmail };
}

export async function GET(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const showAll = req.nextUrl.searchParams.get("all") === "true";
    const targetSessions = showAll ? assessmentStore.getAllSessions() : assessmentStore.getAllActiveSessions();
    const now = Date.now();

    const formatted = targetSessions.map((s) => {
      const expiryMs = new Date(s.expires_at).getTime();
      const remainingSeconds = Math.max(0, Math.floor((expiryMs - now) / 1000));
      return {
        ...s,
        remaining_seconds: remainingSeconds,
        answered_count: Object.keys(s.saved_answers || {}).length,
      };
    });

    return NextResponse.json({
      success: true,
      sessions: formatted,
      count: formatted.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch active sessions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, sessionId, additionalMinutes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }

    if (action === "EXTEND_TIME") {
      const minutes = Number(additionalMinutes) || 5;
      const updated = assessmentStore.extendSessionTime(sessionId, minutes);
      if (!updated) {
        return NextResponse.json({ error: "Session not found or cannot be extended." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Granted +${minutes} minutes extension to candidate session.`,
        session: updated,
      });
    }

    if (action === "FORCE_SUBMIT") {
      const updated = assessmentStore.forceSubmitSession(sessionId);
      if (!updated) {
        return NextResponse.json({ error: "Session not found." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Exam session force-submitted by proctor.",
        session: updated,
      });
    }

    return NextResponse.json({ error: "Unknown action specified." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Monitoring action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
