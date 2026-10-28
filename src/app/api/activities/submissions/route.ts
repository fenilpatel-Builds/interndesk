import { NextRequest, NextResponse } from "next/server";
import { activityStore } from "@/lib/institute/activity-store";
import { safeParseSession } from "@/lib/auth/session-token";
import { SubmissionStatus } from "@/types/activity";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activityId") || undefined;
    const status = (searchParams.get("status") as SubmissionStatus) || undefined;
    const departmentId = searchParams.get("departmentId") || undefined;
    let studentEmail = searchParams.get("studentEmail") || undefined;

    // Check session cookie for authentication & role
    const sessionCookie = req.cookies.get("interndesk_user")?.value || req.cookies.get("akash_user")?.value;
    const session = safeParseSession(sessionCookie);

    // If caller is a student and didn't specify studentEmail, default to their own email
    if (session && session.role === "STUDENT" && !studentEmail) {
      studentEmail = session.email;
    }

    const submissions = activityStore.getSubmissions({
      activityId,
      studentEmail,
      status,
      departmentId,
    });

    return NextResponse.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to retrieve submissions.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
