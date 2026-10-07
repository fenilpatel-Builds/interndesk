import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile, StudentProfile, UserRole } from "@/types/database";

export interface CurrentUserContext {
  isAuthenticated: boolean;
  user: {
    id: string;
    email?: string;
  } | null;
  profile: Profile | null;
  studentProfile: StudentProfile | null;
}

export async function getCurrentUserContext(): Promise<CurrentUserContext> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      user: null,
      profile: null,
      studentProfile: null,
    };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  let studentProfile: StudentProfile | null = null;
  if (profile && profile.role === "STUDENT") {
    const { data: sp } = await adminClient
      .from("student_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();
    studentProfile = sp;
  }

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    studentProfile,
  };
}

export async function requireRole(allowedRole: UserRole): Promise<CurrentUserContext> {
  const ctx = await getCurrentUserContext();
  if (!ctx.isAuthenticated || !ctx.profile) {
    throw new Error("UNAUTHORIZED");
  }
  if (ctx.profile.role !== allowedRole) {
    throw new Error("FORBIDDEN");
  }
  if (ctx.profile.status === "SUSPENDED") {
    throw new Error("ACCOUNT_SUSPENDED");
  }
  return ctx;
}

export async function requireStudentPortalAccess(): Promise<CurrentUserContext> {
  const ctx = await requireRole("STUDENT");
  const status = ctx.studentProfile?.registration_status;
  if (status !== "APPROVED" && status !== "ACTIVE") {
    throw new Error("REGISTRATION_NOT_APPROVED");
  }
  return ctx;
}
