import { NextRequest, NextResponse } from "next/server";
import { sendEmailOtp } from "@/lib/auth/actions";

/**
 * POST /api/auth/otp/send
 * Dispatches a 6-digit cryptographic verification OTP to the provided email address.
 * Uses Resend REST API or SMTP with an automatic development sandbox code fallback.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid institute email address.",
        },
        { status: 400 }
      );
    }

    const result = await sendEmailOtp(email);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Failed to dispatch verification OTP.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      sandboxOtp: result.sandboxOtp,
      provider: result.provider,
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
