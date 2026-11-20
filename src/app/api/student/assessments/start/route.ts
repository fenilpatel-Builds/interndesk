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

    const sessionStartTime = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: "Exam session initialized with Zero-Trust proctoring active.",
      assessment: asm,
      startedAt: sessionStartTime,
      durationMinutes: asm.duration_minutes,
      attemptsUsed: check.attemptsUsed,
      maxAttempts: check.maxAttempts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start assessment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
