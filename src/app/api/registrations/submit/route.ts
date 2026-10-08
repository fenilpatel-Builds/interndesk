import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/validations/registration";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: "Registration form data is required." },
        { status: 400 }
      );
    }

    // 1. Validate Form Data server-side using Zod
    const validationResult = registrationSchema.safeParse(formData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    const data = validationResult.data;

    const adminClient = createAdminClient();

    // 2. Find or create User Profile
    let { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("email", data.email.toLowerCase().trim())
      .maybeSingle();

    if (!profile) {
      const { data: newProfile, error: pError } = await adminClient
        .from("profiles")
        .insert({
          auth_user_id: crypto.randomUUID(),
          role: "STUDENT",
          full_name: data.fullName.trim(),
          email: data.email.toLowerCase().trim(),
          mobile: data.mobile.trim(),
          status: "ACTIVE",
        })
        .select()
        .single();

      if (pError || !newProfile) {
        throw new Error(pError?.message || "Failed to create student profile.");
      }
      profile = newProfile;
    } else {
      // Update details if profile exists
      await adminClient
        .from("profiles")
        .update({
          full_name: data.fullName.trim(),
          mobile: data.mobile.trim(),
        })
        .eq("id", profile.id);
    }

    // 3. Find or create Student Profile
    let { data: studentProfile } = await adminClient
      .from("student_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();

    if (!studentProfile) {
      const { data: newSp, error: spError } = await adminClient
        .from("student_profiles")
        .insert({
          user_id: profile.id,
          college: data.college.trim(),
          university: data.university.trim(),
          course: data.course.trim(),
          technology: data.technology,
          registration_status: "PENDING_ADMIN_APPROVAL",
        })
        .select()
        .single();

      if (spError || !newSp) {
        throw new Error(spError?.message || "Failed to create student profile details.");
      }
      studentProfile = newSp;
    } else {
      await adminClient
        .from("student_profiles")
        .update({
          college: data.college.trim(),
          university: data.university.trim(),
          course: data.course.trim(),
          technology: data.technology,
          registration_status: "PENDING_ADMIN_APPROVAL",
        })
        .eq("id", studentProfile.id);
    }

    // 4. Create Registration Application (100% FREE Registration)
    const appNumber = `ID-APP-${Date.now().toString().slice(-6)}`;
    const { data: registration, error: regError } = await adminClient
      .from("registrations")
      .insert({
        student_id: studentProfile.id,
        application_number: appNumber,
        status: "PENDING_ADMIN_APPROVAL",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (regError || !registration) {
      throw new Error(regError?.message || "Failed to record application.");
    }

    // 5. Audit Log (Free Registration Submission)
    try {
      await adminClient.from("audit_logs").insert({
        actor_user_id: profile.id,
        actor_role: "STUDENT",
        action: "REGISTRATION_SUBMITTED_FREE",
        entity_type: "REGISTRATION",
        entity_id: registration.id,
        new_status: "PENDING_ADMIN_APPROVAL",
        metadata: {
          application_number: appNumber,
          fee: "FREE_REGISTRATION",
          technology: data.technology,
          college: data.college,
        },
      });
    } catch {
      // Audit log non-blocking
    }

    // 6. Student In-app Notification
    try {
      await adminClient.from("notifications").insert({
        user_id: profile.id,
        type: "REGISTRATION_SUBMITTED",
        title: "Registration Submitted Successfully",
        message: `Your registration application ${appNumber} has been received for review. An administrator will verify your profile shortly.`,
      });
    } catch {
      // Notification non-blocking
    }

    return NextResponse.json({
      success: true,
      applicationNumber: appNumber,
      status: "PENDING_ADMIN_APPROVAL",
      message: "Registration submitted successfully! Your application is awaiting admin verification.",
    });
  } catch (err: unknown) {
    console.error("[Registration Submit Error]:", err);
    const message = err instanceof Error ? err.message : "Failed to submit registration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
