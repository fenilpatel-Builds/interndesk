import { NextRequest, NextResponse } from "next/server";
import { activityStore } from "@/lib/institute/activity-store";
import { safeParseSession } from "@/lib/auth/session-token";
import { sendOtpEmail } from "@/lib/auth/email-service";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await context.params;
    const sessionCookie = req.cookies.get("interndesk_user")?.value;
    const session = safeParseSession(sessionCookie);

    const body = await req.json();
    const { reportContent, attachmentUrl, studentId, studentName, studentEmail } = body;

    const email = (session?.email || studentEmail || "").toLowerCase().trim();
    const name = session?.name || studentName || "Student Intern";
    const rollNo = studentId || "AKT-STUDENT";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Valid student email is required for submission." },
        { status: 400 }
      );
    }

    if (!reportContent || String(reportContent).trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Please provide a detailed report of at least 10 characters." },
        { status: 400 }
      );
    }

    const activity = activityStore.getActivityById(activityId);
    if (!activity) {
      return NextResponse.json(
        { success: false, message: "Activity not found." },
        { status: 404 }
      );
    }

    if (activity.status === "CLOSED") {
      return NextResponse.json(
        { success: false, message: "This activity is closed for new submissions." },
        { status: 400 }
      );
    }

    const submission = activityStore.createSubmission({
      activityId,
      studentId: rollNo,
      studentName: name,
      studentEmail: email,
      reportContent: String(reportContent).trim(),
      attachmentUrl: attachmentUrl ? String(attachmentUrl).trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Activity submission received successfully for "${activity.title}".`,
      submission,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record activity submission.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
