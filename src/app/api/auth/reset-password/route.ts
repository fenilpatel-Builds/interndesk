import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/auth/otp-store";
import { credentialsStore } from "@/lib/auth/credentials-store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, password } = body;

    if (!email || !otp || !password) {
      return NextResponse.json(
        { success: false, message: "Email, OTP code, and new password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // 1. Verify OTP
    const isOtpValid = otpStore.verify(cleanEmail, cleanOtp);
    if (!isOtpValid) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code." },
        { status: 401 }
      );
    }

    // 2. Find or register updated password in credentials store
    const account = credentialsStore.findByEmail(cleanEmail);
    if (account) {
      credentialsStore.register({
        email: cleanEmail,
        password: password,
        name: account.name,
        role: account.role,
        organizationId: "org-akash-01",
        organizationName: "Akash Technolabs",
        organizationType: "CORPORATE",
      });
    }

    // 3. Update in Supabase Auth if connected
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.updateUser({ password });
    } catch {
      // Supabase optional sync
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Password reset failed.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
