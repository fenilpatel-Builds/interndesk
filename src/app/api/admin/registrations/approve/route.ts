import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrationId, studentId } = body;

    if (!registrationId || !studentId) {
      return NextResponse.json(
        { error: "registrationId and studentId are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Update registration
    const { error: regError } = await adminClient
      .from("registrations")
      .update({
        status: "APPROVED",
        approved_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    if (regError) {
      throw new Error(regError.message);
    }

    // 2. Update student profile to ACTIVE
    const { data: studentProfile, error: spError } = await adminClient
      .from("student_profiles")
      .update({
        registration_status: "ACTIVE",
        internship_start: new Date().toISOString().split("T")[0],
      })
      .eq("id", studentId)
      .select("*, profiles(*)")
      .single();

    if (spError) {
      throw new Error(spError.message);
    }

    const userId = studentProfile?.user_id;

    // 3. Auto-issue Offer Letter record (Section 25)
    const offerDocNumber = `ID-OFF-${Date.now().toString().slice(-6)}`;
    await adminClient.from("documents").insert({
      student_id: studentId,
      type: "OFFER_LETTER",
      status: "AVAILABLE",
      document_number: offerDocNumber,
      issued_at: new Date().toISOString(),
    });

    // 4. In-App Notification (Section 31)
    if (userId) {
      await adminClient.from("notifications").insert({
        user_id: userId,
        type: "REGISTRATION_APPROVED",
        title: "Internship Registration Approved!",
        message: "Your application has been officially approved. You can now access your full student portal and download your Offer Letter.",
      });
    }

    // 5. Immutable Audit Log (Section 20)
    await adminClient.from("audit_logs").insert({
      actor_user_id: userId,
      actor_role: "ADMIN",
      action: "REGISTRATION_APPROVED",
      entity_type: "REGISTRATION",
      entity_id: registrationId,
      old_status: "PENDING_ADMIN_APPROVAL",
      new_status: "APPROVED",
      metadata: {
        student_id: studentId,
        offer_letter: offerDocNumber,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student registration successfully approved.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Approval failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
