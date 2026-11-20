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
    const body = await req.json();

    const studentEmail = (body.email || session?.email || headerEmail || "").toLowerCase().trim();
    const studentName = body.studentName || session?.name || "Student Intern";
    const {
      assessmentId,
      answers,
      tabSwitchCount,
      fullscreenExitCount,
      timeSpentSeconds,
      startedAt,
      sessionId,
    } = body;

    if (!studentEmail) {
      return NextResponse.json({ error: "Authentication required to submit assessment." }, { status: 401 });
    }

    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required." }, { status: 400 });
    }

    const check = assessmentStore.canStudentStartExam(assessmentId, studentEmail);
    // Allow submission if student is submitting an in-progress session even if attempt limit reached
    if (!check.canStart && check.attemptsUsed > check.maxAttempts && !sessionId) {
      return NextResponse.json({ error: check.error || "Attempt limit reached." }, { status: 403 });
    }

    const attempt = assessmentStore.submitAttempt({
      assessmentId,
      studentEmail,
      studentName,
      answers: answers || {},
      tabSwitchCount: Number(tabSwitchCount) || 0,
      fullscreenExitCount: Number(fullscreenExitCount) || 0,
      timeSpentSeconds: Number(timeSpentSeconds) || 60,
      startedAt,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      message: attempt.passed
        ? `Assessment Passed! Score: ${attempt.score}/${attempt.total_marks} (${attempt.percentage}%)`
        : `Assessment Completed. Score: ${attempt.score}/${attempt.total_marks} (${attempt.percentage}%)`,
      attempt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to grade and submit assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
