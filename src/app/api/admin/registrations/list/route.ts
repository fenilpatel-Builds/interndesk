import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthenticatedUser } from "@/lib/multitenant/auth-guard";

export async function GET() {
  try {
    const user = await resolveAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view registrations." },
        { status: 401 }
      );
    }

    const allowedAdminRoles = ["SUPER_ADMIN", "ORG_ADMIN", "ORG_OWNER", "ADMIN", "HR_COORDINATOR", "HR_MANAGER"];
    if (!allowedAdminRoles.includes(user.role)) {
      return NextResponse.json(
        { error: `Access Denied: Role '${user.role}' is not authorized to view registrations.` },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();
    const { data: registrations, error } = await adminClient
      .from("registrations")
      .select(`
        id,
        application_number,
        status,
        submitted_at,
        approved_at,
        rejected_at,
        rejection_reason,
        student_profiles (
          id,
          college,
          university,
          course,
          technology,
          registration_status,
          profiles (
            full_name,
            email,
            mobile
          )
        )
      `)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ registrations: registrations || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load registrations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
