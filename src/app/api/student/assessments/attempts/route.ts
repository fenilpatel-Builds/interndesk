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
    const { searchParams } = new URL(req.url);

    const email = (searchParams.get("email") || session?.email || headerEmail || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const attempts = assessmentStore.getAttemptsForStudent(email);

    return NextResponse.json({
      success: true,
      attempts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load attempts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
