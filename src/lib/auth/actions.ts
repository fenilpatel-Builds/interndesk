"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signSessionToken } from "./session-token";
import { MemberRole } from "@/types/multitenant";
import { credentialsStore } from "./credentials-store";
import { multiTenantStore } from "@/lib/multitenant/store";

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
        const localAcc = credentialsStore.findByEmail(cleanEmail);
        const resolvedName =
          localAcc?.name ||
          user.user_metadata?.full_name ||
          cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const resolvedRole =
          localAcc?.role ||
          (cleanEmail === "superadmin@interndesk.com" ? "SUPER_ADMIN" : "STUDENT");

        const { data: newProfile } = await adminClient
          .from("profiles")
          .insert({
            id: user.id,
            full_name: resolvedName,
            email: cleanEmail,
            mobile: user.user_metadata?.mobile || "9876543210",
            role: resolvedRole,
            status: "ACTIVE",
          })
          .select()
          .maybeSingle();
        profile = newProfile;
      }
    } catch (dbErr) {
      console.warn("[Profile Sync Notice]:", dbErr);
    }

    const localAcc = credentialsStore.findByEmail(cleanEmail);
    const role = localAcc?.role || profile?.role || (cleanEmail === "superadmin@interndesk.com" ? "SUPER_ADMIN" : "STUDENT");

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
 * Sign in using Email and Password supporting newly registered accounts & Supabase Auth
 */
export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const cookieStore = await cookies();

    // 1. Check local persistent credentials store (Newly registered accounts: Institute, Company, Student, Admin)
    const localAccount = credentialsStore.authenticate(cleanEmail, password);
    if (localAccount) {
      const sessionToken = signSessionToken({
        id: localAccount.id,
        name: localAccount.name,
        email: localAccount.email,
        role: localAccount.role,
        organizationId: localAccount.organizationId,
      });

      cookieStore.set("interndesk_user", sessionToken, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      if (localAccount.organizationId) {
        cookieStore.set("interndesk_active_org", localAccount.organizationId, {
          path: "/",
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      }

      if (localAccount.role === "SUPER_ADMIN") {
        return {
          success: true,
          message: `Authenticated as ${localAccount.name}. Launching Super Admin Console...`,
          redirectTo: "/super-admin",
        };
      }

      if (localAccount.role === "STUDENT") {
        return {
          success: true,
          message: `Authenticated as ${localAccount.name}. Launching Student Dashboard...`,
          redirectTo: "/student/dashboard",
        };
      }

      return {
        success: true,
        message: `Authenticated as ${localAccount.name} (${localAccount.organizationName || "Workspace"}). Launching Workspace...`,
        redirectTo: "/workspace",
      };
    }

    // 2. Try Supabase Auth
    try {
      const supabase = await createServerSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authData?.user && !authError) {
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

        const role = profile?.role || "STUDENT";
        const rawName = profile?.full_name || user.user_metadata?.full_name || cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
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
            message: "Student authenticated successfully. Directing to Student Portal...",
            redirectTo: "/student/dashboard",
          };
        }

        return {
          success: true,
          message: "Authenticated successfully. Directing to Organization Workspace...",
          redirectTo: "/workspace",
        };
      }
    } catch {
      // Ignored for Supabase fallback
    }

    return {
      success: false,
      message: "Invalid login credentials. Please verify your email and password or register a new account.",
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Authentication error occurred.";
    return {
      success: false,
      message: errMsg,
    };
  }
}

/**
 * Register any account (Student, Company, Institute) with immediate server persistence
 */
export async function registerAccountAction(params: {
  name: string;
  email: string;
  password: string;
  accountType: "STUDENT" | "COMPANY" | "INSTITUTE";
  organizationName?: string;
  phone?: string;
  website?: string;
  categoryOrIndustry?: string;
  size?: string;
  college?: string;
  university?: string;
  technology?: string;
  role?: MemberRole;
}): Promise<AuthResponse & { organizationCode?: string; organizationId?: string }> {
  const cleanEmail = params.email.toLowerCase().trim();
  const cleanName = params.name.trim();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "Valid email address is required." };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long." };
  }
  if (!cleanName || cleanName.length < 2) {
    return { success: false, message: "Full name is required (minimum 2 characters)." };
  }

  try {
    let orgId: string | undefined = undefined;
    let orgCode: string | undefined = undefined;
    let orgName = params.organizationName?.trim();

    if (params.accountType === "INSTITUTE" || params.accountType === "COMPANY") {
      const orgType = params.accountType === "INSTITUTE" ? "EDUCATIONAL" : "CORPORATE";
      const resolvedOrgName = orgName || (params.accountType === "INSTITUTE" ? `${cleanName}'s Institution` : `${cleanName}'s Enterprise`);
      const slug = resolvedOrgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `org-${Date.now()}`;

      const newOrg = multiTenantStore.createOrganization({
        name: resolvedOrgName,
        slug,
        type: orgType,
        status: "APPROVED",
        official_email: cleanEmail,
        contact_number: params.phone?.trim() || "+91 98765 43210",
        website: params.website?.trim() || "https://interndesk.io",
        country: "India",
        size: params.size || "100-500",
        industry_or_category: params.categoryOrIndustry || (orgType === "EDUCATIONAL" ? "Higher Education" : "Technology & Software"),
        description: `${resolvedOrgName} Verified Workspace on InternDesk.`,
        joining_policy: "REQUEST_APPROVAL",
        allowed_email_domains: cleanEmail.includes("@") ? [`@${cleanEmail.split("@")[1]}`] : [],
        settings: {
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          expectedDailyHours: 8,
          gracePeriodMinutes: 15,
          allowedBreakMinutes: 60,
          timeZone: "Asia/Kolkata",
          dateFormat: "DD/MM/YYYY",
          primaryColor: orgType === "EDUCATIONAL" ? "#4F46E5" : "#2563EB",
          requireReportReview: true,
          autoApproveAttendance: false,
          requireDocumentApproval: true,
        },
      });

      orgId = newOrg.id;
      orgCode = newOrg.code;
      orgName = newOrg.name;

      const userId = `usr-${Date.now()}`;
      multiTenantStore.addMembership({
        organization_id: newOrg.id,
        user_id: userId,
        role: "ORG_ADMIN",
        member_type: "ADMIN",
        status: "ACTIVE",
        job_title: orgType === "EDUCATIONAL" ? "Academic Internship Coordinator / Dean" : "Corporate Workspace Administrator",
        user_full_name: cleanName,
        user_email: cleanEmail,
        joined_at: new Date().toISOString(),
      });
    }

    // Save to server-side credentials store
    const account = credentialsStore.register({
      email: cleanEmail,
      password: params.password,
      name: cleanName,
      role: (params.accountType === "STUDENT" ? "STUDENT" : "ORG_ADMIN") as MemberRole,
      organizationId: orgId,
      organizationName: orgName,
      organizationType: params.accountType === "INSTITUTE" ? "EDUCATIONAL" : (params.accountType === "COMPANY" ? "CORPORATE" : undefined),
    });

    // Automatically set signed session cookies
    const cookieStore = await cookies();
    const sessionToken = signSessionToken({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      organizationId: account.organizationId,
    });

    cookieStore.set("interndesk_user", sessionToken, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    if (orgId) {
      cookieStore.set("interndesk_active_org", orgId, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    }

    const redirectTo = params.accountType === "STUDENT" ? "/student/dashboard" : "/workspace";

    return {
      success: true,
      message: `Account created successfully for ${cleanName}!`,
      redirectTo,
      organizationCode: orgCode,
      organizationId: orgId,
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to register account.";
    return {
      success: false,
      message: errMsg,
    };
  }
}

/**
 * Sign out session
 */
export async function signOutUser() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignored
  }
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

/**
 * Retrieve registered accounts for quick selection or administration
 */
export async function getRegisteredAccountsAction() {
  return credentialsStore.getAll();
}

/**
 * Clear all testing accounts
 */
export async function clearAllTestingAccountsAction() {
  credentialsStore.clearAllTestingAccounts();
  return { success: true, message: "All testing accounts have been successfully cleared." };
}
