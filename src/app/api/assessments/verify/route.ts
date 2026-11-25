import { NextRequest, NextResponse } from "next/server";
import { assessmentStore } from "@/lib/assessments/assessment-store";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code") || "";
    if (!code.trim()) {
      return NextResponse.json({ success: false, error: "Verification code is required" }, { status: 400 });
    }

    const attempt = assessmentStore.findAttemptByVerificationCode(code);
    if (!attempt) {
      return NextResponse.json({ success: false, error: "No matching examination attempt found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, attempt });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal verification error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
