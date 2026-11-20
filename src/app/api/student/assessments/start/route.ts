import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { assessmentStore } from "@/lib/assessments/assessment-store";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      req.cookies.get("interndesk_user")?.value ||
      req.cookies.get("akash_user")?.value ||
      cookieStore.get("interndesk_user")?.value ||
      cookieStore.get("akash_user")?.value;

    const session = safeParseSession(token);
    const headerEmail = req.headers.get("x-user-email");
    const body = await req.json().catch(() => ({}));

    const studentEmail = (body.email || session?.email || headerEmail || "").toLowerCase().trim();
    const studentName = body.studentName || session?.name || "Student Intern";
    const assessmentId = body.assessmentId;

    if (!studentEmail) {
      return NextResponse.json({ error: "Authentication required to start exam." }, { status: 401 });
    }

    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required." }, { status: 400 });
    }

    const check = assessmentStore.canStudentStartExam(assessmentId, studentEmail);
    if (!check.canStart) {
      return NextResponse.json({ error: check.error || "Cannot start assessment." }, { status: 403 });
    }

    const asm = assessmentStore.getById(assessmentId, false); // Sanitized: answers stripped
    if (!asm) {
      return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    }

    // Start or resume server-authoritative exam session
    const { session: examSession, isResumed } = assessmentStore.startSession({
      assessmentId,
      studentEmail,
      studentName,
    });

    return NextResponse.json({
      success: true,
      message: isResumed
        ? "Active examination session resumed."
        : "Exam session initialized with Zero-Trust proctoring active.",
      assessment: asm,
      session: examSession,
      sessionId: examSession.session_id,
      isResumed,
      startedAt: examSession.started_at,
      expiresAt: examSession.expires_at,
      durationMinutes: examSession.duration_minutes,
      savedAnswers: examSession.saved_answers || {},
      markedForReview: examSession.marked_for_review || [],
      visitedQuestions: examSession.visited_questions || [],
      tabSwitchCount: examSession.tab_switch_count || 0,
      fullscreenExitCount: examSession.fullscreen_exit_count || 0,
      attemptsUsed: check.attemptsUsed,
      maxAttempts: check.maxAttempts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
