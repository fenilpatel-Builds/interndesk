"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
  error?: string;
}

/**
 * Send real Supabase Auth Email OTP
 */
export async function sendEmailOtp(email: string): Promise<AuthResponse> {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: `Verification code sent to ${email}. Please check your inbox.`,
  };
}

/**
 * Verify Email OTP server-side
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
  deviceInfo?: {
    deviceLabel?: string;
    browser?: string;
    os?: string;
    ipHash?: string;
  }
): Promise<AuthResponse> {
  if (!email || !token) {
    return { success: false, message: "Email and OTP code are required." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: "email",
  });

  if (error || !data.user) {
    return {
      success: false,
      message: error?.message || "Invalid or expired OTP code. Please try again.",
    };
  }

  const authUserId = data.user.id;
  const adminClient = createAdminClient();

  // Check if profile exists
  let { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (!profile) {
    // If not found, check if a profile with the same email exists to link
    const { data: existingEmailProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (existingEmailProfile) {
      const { data: updated } = await adminClient
        .from("profiles")
        .update({ auth_user_id: authUserId })
        .eq("id", existingEmailProfile.id)
        .select()
        .single();
      profile = updated;
    } else {
      // Default initial profile creation as STUDENT
      const { data: newProfile } = await adminClient
        .from("profiles")
        .insert({
          auth_user_id: authUserId,
          role: "STUDENT",
          full_name: data.user.user_metadata?.full_name || email.split("@")[0],
          email: email.toLowerCase(),
          mobile: data.user.user_metadata?.mobile || "Not Provided",
          status: "ACTIVE",
        })
        .select()
        .single();
      profile = newProfile;
    }
  }

  // Register device session if deviceInfo provided
  if (profile && deviceInfo?.deviceLabel) {
    try {
      await adminClient.from("user_sessions").insert({
        user_id: profile.id,
        device_label: deviceInfo.deviceLabel,
        browser: deviceInfo.browser || "Unknown",
        os: deviceInfo.os || "Unknown",
        ip_hash: deviceInfo.ipHash || "anonymized",
      });

      // Audit log entry
      await adminClient.from("audit_logs").insert({
        actor_user_id: profile.id,
        actor_role: profile.role,
        action: "USER_LOGGED_IN_OTP",
        entity_type: "SESSION",
        entity_id: profile.id,
        metadata: {
          device: deviceInfo.deviceLabel,
          browser: deviceInfo.browser,
        },
      });
    } catch (err) {
      console.error("Session recording error:", err);
    }
  }

  // Determine redirection based on role & student registration status
  if (profile?.role === "ADMIN") {
    return {
      success: true,
      message: "Admin authentication successful.",
      redirectTo: "/admin/dashboard",
    };
  }

  // Student role check
  if (profile) {
    const { data: studentProfile } = await adminClient
      .from("student_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    if (!studentProfile) {
      // Profile exists but hasn't completed multi-step registration
      return {
        success: true,
        message: "Please complete your internship registration.",
        redirectTo: "/register",
      };
    }

    const status = studentProfile.registration_status;
    if (status === "APPROVED" || status === "ACTIVE") {
      return {
        success: true,
        message: "Login successful.",
        redirectTo: "/student/dashboard",
      };
    } else {
      // Section 8: "If not approved, show a status page instead of the dashboard."
      return {
        success: true,
        message: "Your application is under review.",
        redirectTo: "/student/status",
      };
    }
  }

  return {
    success: true,
    message: "Login successful.",
    redirectTo: "/student/dashboard",
  };
}

/**
 * Sign out current session
 */
export async function signOutUser(): Promise<{ success: boolean }> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return { success: true };
}
