import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { safeParseSession } from "@/lib/auth/session-token";
import { isUserAdmin } from "@/lib/auth/admin-whitelist";
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
    const userEmail = session?.email || headerEmail;

    const roleStr = String(session?.role || "");
    const isAdmin =
      isUserAdmin(userEmail) ||
      roleStr === "ORG_ADMIN" ||
      roleStr === "SUPER_ADMIN" ||
      roleStr === "ADMIN";

    const assessments = assessmentStore.getAll(isAdmin);

    let studentAttempts: any[] = [];
    if (userEmail && !isAdmin) {
      studentAttempts = assessmentStore.getAttemptsForStudent(userEmail);
    }

    return NextResponse.json({
      success: true,
      isAdmin,
      assessments,
      attempts: studentAttempts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load assessments";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
