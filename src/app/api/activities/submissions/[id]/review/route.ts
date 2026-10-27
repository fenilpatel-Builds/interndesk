import { NextRequest, NextResponse } from "next/server";
import { activityStore } from "@/lib/institute/activity-store";
import { safeParseSession } from "@/lib/auth/session-token";
import { sendOtpEmail } from "@/lib/auth/email-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await context.params;
    const sessionCookie = req.cookies.get("interndesk_user")?.value;
    const session = safeParseSession(sessionCookie);

    // Enforce Admin / Reviewer Authorization
    if (
      !session ||
      (session.role !== "ORG_ADMIN" &&
        session.role !== "SUPER_ADMIN" &&
        session.role !== "TRAINER_MENTOR")
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Reviewer or administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status, feedback, score } = body;

    if (!status || !["APPROVED", "REJECTED", "NEEDS_REVISION"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Valid status (APPROVED, REJECTED, NEEDS_REVISION) is required." },
        { status: 400 }
      );
    }

    if ((status === "REJECTED" || status === "NEEDS_REVISION") && (!feedback || String(feedback).trim().length < 5)) {
      return NextResponse.json(
        { success: false, message: "Detailed feedback is required when rejecting or requesting revision." },
        { status: 400 }
      );
    }

    const updated = activityStore.reviewSubmission(submissionId, {
      status,
      feedback: feedback ? String(feedback).trim() : "Reviewed and approved by academic coordinator.",
      score: score !== undefined ? Number(score) : undefined,
      reviewerName: session.name || "Akash Padhiyar (CEO)",
      reviewerId: session.id,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Submission marked as ${status}. Student notified.`,
      submission: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Review action failed.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
