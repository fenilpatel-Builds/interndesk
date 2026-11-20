import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { assessmentStore } from "@/lib/assessments/assessment-store";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const headerEmail = req.headers.get("x-user-email");
    const searchParams = req.nextUrl.searchParams;

    const sessionId = searchParams.get("sessionId");
    const assessmentId = searchParams.get("assessmentId");
    const studentEmail = (searchParams.get("email") || session?.email || headerEmail || "").toLowerCase().trim();

    if (!sessionId && (!assessmentId || !studentEmail)) {
      return NextResponse.json({ error: "Session ID or (Assessment ID and Email) is required." }, { status: 400 });
    }

    let examSession = null;
    if (sessionId) {
      examSession = assessmentStore.getSession(sessionId);
    } else if (assessmentId && studentEmail) {
      examSession = assessmentStore.getActiveSessionForStudent(assessmentId, studentEmail);
    }

    if (!examSession) {
      return NextResponse.json({ error: "No active session found or session has ended." }, { status: 404 });
    }

    const now = Date.now();
    const expiryMs = new Date(examSession.expires_at).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiryMs - now) / 1000));
    const isExpired = remainingSeconds <= 0;

    return NextResponse.json({
      success: true,
      session: examSession,
      sessionId: examSession.session_id,
      remainingSeconds,
      isExpired,
      savedAnswers: examSession.saved_answers,
      markedForReview: examSession.marked_for_review,
      visitedQuestions: examSession.visited_questions,
      tabSwitchCount: examSession.tab_switch_count,
      fullscreenExitCount: examSession.fullscreen_exit_count,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
