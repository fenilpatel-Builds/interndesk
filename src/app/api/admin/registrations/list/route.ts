import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
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
