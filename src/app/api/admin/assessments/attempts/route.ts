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
    return { isAuthorized: false };
  }
  return { isAuthorized: true, adminEmail };
}

export async function GET(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can view exam attempts." }, { status: 403 });
    }

    const attempts = assessmentStore.getAllAttempts();
    return NextResponse.json({ success: true, attempts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load attempts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isAuthorized } = await verifyAdminAuth(req);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Access Denied: Only Akash Administrators can reset attempts." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Attempt ID is required." }, { status: 400 });
    }

    const deleted = assessmentStore.deleteAttempt(id);
    if (!deleted) {
      return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Student exam attempt reset. Student is permitted to retake the exam.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
