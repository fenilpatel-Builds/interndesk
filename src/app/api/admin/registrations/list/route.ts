import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthenticatedUser } from "@/lib/multitenant/auth-guard";

export async function GET() {
  try {
    const user = await resolveAuthenticatedUser();
    if (user && user.role === "STUDENT") {
      return NextResponse.json(
        { error: "Access Denied: Students are not authorized to view admin registrations." },
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
