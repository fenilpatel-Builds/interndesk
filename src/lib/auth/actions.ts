"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signSessionToken } from "./session-token";
import { MemberRole } from "@/types/multitenant";

export interface AuthResponse {
  success: boolean;
  message: string;
  redirectTo?: string;
  error?: string;
}

/**
 * Send 6-digit Email OTP exclusively via Supabase Auth
 */
export async function sendEmailOtp(email: string): Promise<AuthResponse> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "Please provide a valid email address." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("[Supabase Auth signInWithOtp Error]:", error);
      if (error.status === 429) {
        return {
          success: false,
          message: "Email dispatch rate limit reached. Please wait a minute before requesting another code.",
        };
      }
      return {
        success: false,
        message: error.message || "Failed to dispatch verification code via Supabase Auth.",
      };
    }

    return {
      success: true,
      message: `6-Digit verification code has been dispatched to ${cleanEmail} via Supabase Auth. Please check your inbox!`,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to connect to Supabase Auth service.";
    console.error("[Supabase Auth Exception]:", err);
    return {
      success: false,
      message: errMsg,
    };
  }
}

/**
 * Verify 6-Digit Email OTP exclusively via Supabase Auth
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
  const cleanEmail = email.toLowerCase().trim();
  const cleanToken = token.trim();

  if (!cleanEmail || !cleanToken) {
    return { success: false, message: "Email and OTP code are required." };
  }

  // Strictly enforce 6 numeric digits
  if (!/^\d{6}$/.test(cleanToken)) {
    return { success: false, message: "Please enter a valid 6-digit numeric OTP code." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: "email",
    });

    if (error || !data?.user) {
      console.warn("[Supabase Auth verifyOtp Error]:", error);
      return {
        success: false,
        message: error?.message || "Invalid or expired OTP code. Please check your inbox or request a new code.",
      };
    }

    const user = data.user;
    const adminClient = createAdminClient();

    // Fetch or sync user profile
    let profile = null;
    try {
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        profile = existingProfile;
      } else {
        const { data: newProfile } = await adminClient
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || (cleanEmail === "fenil8918@gmail.com" ? "Fenil Patel" : cleanEmail.split("@")[0]),
            email: cleanEmail,
            mobile: user.user_metadata?.mobile || "9876543210",
            role: cleanEmail === "fenil8918@gmail.com" ? "ADMIN" : (cleanEmail === "superadmin@interndesk.com" ? "SUPER_ADMIN" : "STUDENT"),
            status: "ACTIVE",
          })
          .select()
          .maybeSingle();
        profile = newProfile;
      }
    } catch (dbErr) {
      console.warn("[Profile Sync Notice]:", dbErr);
    }

    const role = profile?.role || (cleanEmail === "fenil8918@gmail.com" ? "ADMIN" : (cleanEmail === "superadmin@interndesk.com" ? "SUPER_ADMIN" : "STUDENT"));

    // Record session audit log if deviceInfo is provided
    if (deviceInfo) {
      try {
        await adminClient.from("user_sessions").insert({
          user_id: user.id,
          device_label: deviceInfo.deviceLabel || "Web Browser",
          browser: deviceInfo.browser || "Browser",
          os: deviceInfo.os || "Desktop",
          ip_hash: deviceInfo.ipHash || "ip-hash",
        });

        await adminClient.from("audit_logs").insert({
          actor_user_id: user.id,
          actor_role: role,
          action: "LOGIN_OTP_VERIFIED",
          entity_type: "SESSION",
          entity_id: user.id,
          new_status: "ACTIVE",
          metadata: { email: cleanEmail, auth_provider: "supabase" },
        });
      } catch {
        // Non-blocking
      }
    }

    // Set cryptographically signed application session cookie for SSR multi-tenant context
    try {
      const cookieStore = await cookies();
      const rawName = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const sessionToken = signSessionToken({
        id: user.id,
        name: formattedName,
        email: cleanEmail,
        role: role as MemberRole,
      });

      cookieStore.set("interndesk_user", sessionToken, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    } catch (cErr) {
      console.warn("Cookie set error:", cErr);
    }

    if (role === "SUPER_ADMIN" || cleanEmail === "superadmin@interndesk.com") {
      return {
        success: true,
        message: "Super Admin authenticated via Supabase. Directing to Super Admin Console...",
        redirectTo: "/super-admin",
      };
    }

    if (role === "STUDENT") {
      return {
        success: true,
        message: "Student authenticated via Supabase. Directing to Student Portal...",
        redirectTo: "/student/dashboard",
      };
    }

    return {
      success: true,
      message: "Authenticated successfully with Supabase. Directing to Organization Workspace...",
      redirectTo: "/workspace",
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Verification failed via Supabase.";
    console.error("[Supabase Auth verifyOtp Exception]:", err);
    return {
      success: false,
      message: errMsg,
    };
  }
}

/**
 * Sign in using Email and Password exclusively via Supabase Auth
 */
export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError || !authData?.user) {
      console.warn("[Supabase Auth signInWithPassword Error]:", authError?.message);
      return {
        success: false,
        message: authError?.message || "Invalid email or password.",
      };
    }

    const user = authData.user;
    const adminClient = createAdminClient();

    let profile = null;
    try {
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();
      profile = existingProfile;
    } catch {
      // Ignored
    }

    const role = profile?.role || (cleanEmail === "fenil8918@gmail.com" ? "ADMIN" : (cleanEmail === "superadmin@interndesk.com" ? "SUPER_ADMIN" : "STUDENT"));

    try {
      const cookieStore = await cookies();
      const rawName = profile?.full_name || cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const sessionToken = signSessionToken({
        id: user.id,
        name: formattedName,
        email: cleanEmail,
        role: role as MemberRole,
      });

      cookieStore.set("interndesk_user", sessionToken, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    } catch {
      // Ignored
    }

    if (role === "SUPER_ADMIN" || cleanEmail === "superadmin@interndesk.com") {
      return {
        success: true,
        message: "Super Admin authenticated successfully via Supabase. Directing to Super Admin Console...",
        redirectTo: "/super-admin",
      };
    }

    if (role === "STUDENT") {
      return {
        success: true,
        message: "Student authenticated successfully via Supabase. Directing to Student Portal...",
        redirectTo: "/student/dashboard",
      };
    }

    return {
      success: true,
      message: "Authenticated successfully with Supabase. Directing to Organization Workspace...",
      redirectTo: "/workspace",
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Authentication failed with Supabase.";
    console.error("[Supabase Auth signInWithPassword Exception]:", err);
    return {
      success: false,
      message: errMsg,
    };
  }
}

/**
 * Sign out session exclusively via Supabase Auth
 */
export async function signOutUser() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  try {
    const cookieStore = await cookies();
    cookieStore.delete("interndesk_user");
    cookieStore.delete("interndesk_active_org");
  } catch {
    // Ignored
  }
  return { success: true };
}

/**
 * Register organization session cookie for newly registered company or institute
 */
export async function registerOrganizationSession(data: {
  userId: string;
  name: string;
  email: string;
  role: string;
  orgId: string;
}) {
  try {
    const cookieStore = await cookies();
    const sessionToken = signSessionToken({
      id: data.userId,
      name: data.name,
      email: data.email,
      role: data.role as MemberRole,
      organizationId: data.orgId,
    });

    cookieStore.set("interndesk_user", sessionToken, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("interndesk_active_org", data.orgId, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to register organization session:", err);
    return { success: false };
  }
}
