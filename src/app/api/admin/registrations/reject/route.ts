import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrationId, studentId, reason } = body;

    if (!registrationId || !studentId) {
      return NextResponse.json(
        { error: "registrationId and studentId are required" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "A detailed rejection reason is required (minimum 5 characters)." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Update registration
    const { error: regError } = await adminClient
      .from("registrations")
      .update({
        status: "REJECTED",
        rejected_at: new Date().toISOString(),
        rejection_reason: reason.trim(),
      })
      .eq("id", registrationId);

    if (regError) {
      throw new Error(regError.message);
    }

    // 2. Update student profile
    const { data: studentProfile } = await adminClient
      .from("student_profiles")
      .update({
        registration_status: "REJECTED",
      })
      .eq("id", studentId)
      .select("*, profiles(*)")
      .single();

    const userId = studentProfile?.user_id;

    // 3. In-App Notification (Section 31)
    if (userId) {
      await adminClient.from("notifications").insert({
        user_id: userId,
        type: "REGISTRATION_REJECTED",
        title: "Registration Update",
        message: `Your internship registration could not be approved. Reason: ${reason.trim()}`,
      });
    }

    // 4. Audit Log (Section 20)
    await adminClient.from("audit_logs").insert({
      actor_user_id: userId,
      actor_role: "ADMIN",
      action: "REGISTRATION_REJECTED",
      entity_type: "REGISTRATION",
      entity_id: registrationId,
      old_status: "PENDING_ADMIN_APPROVAL",
      new_status: "REJECTED",
      metadata: {
        student_id: studentId,
        reason: reason.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student registration has been rejected.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rejection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
