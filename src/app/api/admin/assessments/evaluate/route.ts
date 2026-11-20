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
    return { isAuthorized: false, adminEmail: null, name: null };
  }
  return { isAuthorized: true, adminEmail, name: session?.name || "Faculty Evaluator" };
}

export async function POST(req: NextRequest) {
  try {
    const { isAuthorized, name } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Teacher/Admin evaluation permissions required." }, { status: 403 });
    }

    const body = await req.json();
    const { attemptId, questionId, awardedMarks, feedback, evaluatorName } = body;

    if (!attemptId || !questionId) {
      return NextResponse.json({ error: "Attempt ID and Question ID are required." }, { status: 400 });
    }

    if (typeof awardedMarks !== "number" || awardedMarks < 0) {
      return NextResponse.json({ error: "Valid non-negative awarded marks are required." }, { status: 400 });
    }

    const updated = assessmentStore.evaluateSubjectiveQuestion({
      attemptId,
      questionId,
      awardedMarks,
      feedback: feedback || "",
      evaluatorName: evaluatorName || name || "Faculty Instructor",
    });

    if (!updated) {
      return NextResponse.json({ error: "Attempt or question evaluation not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Evaluation saved for question ${questionId}. New total score: ${updated.score}/${updated.total_marks} (${updated.percentage}%).`,
      attempt: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record evaluation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
