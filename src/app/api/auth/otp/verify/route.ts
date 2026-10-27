import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtp } from "@/lib/auth/actions";

/**
 * POST /api/auth/otp/verify
 * Verifies the 6-digit OTP code against the persistent store / Supabase auth,
 * binds the user identity, checks RBAC (STUDENT vs FACULTY vs ADMIN),
 * sets session cookies, and returns the appropriate dashboard redirection URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const token = typeof body?.token === "string" ? body.token.trim() : "";

    if (!email || !token) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and 6-digit OTP code are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid 6-digit numeric OTP code.",
        },
        { status: 400 }
      );
    }

    const result = await verifyEmailOtp(email, token);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Invalid or expired OTP code.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      role: result.role,
      redirectTo: result.redirectTo || (result.role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard"),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
