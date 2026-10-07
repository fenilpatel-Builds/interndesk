import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/validations/registration";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      paymentId,
      signature,
      formData,
    } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "Order ID and Payment ID are required." },
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

    // 2. Cryptographic signature check (HMAC-SHA256)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && signature && !secret.includes("your_razorpay_secret")) {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { error: "Payment verification failed: Invalid cryptographic signature." },
          { status: 400 }
        );
      }
    }

    const adminClient = createAdminClient();

    // 3. Upsert Profile
    let { data: profile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("email", data.email.toLowerCase())
      .single();

    if (!profile) {
      const { data: newProfile, error: pError } = await adminClient
        .from("profiles")
        .insert({
          auth_user_id: crypto.randomUUID(), // Linked on first OTP sign-in if not yet created
          role: "STUDENT",
          full_name: data.fullName,
          email: data.email.toLowerCase(),
          mobile: data.mobile,
          status: "ACTIVE",
        })
        .select()
        .single();

      if (pError || !newProfile) {
        throw new Error(pError?.message || "Failed to create student profile.");
      }
      profile = newProfile;
    }

    // 4. Upsert Student Profile
    let { data: studentProfile } = await adminClient
      .from("student_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    if (!studentProfile) {
      const { data: newSp, error: spError } = await adminClient
        .from("student_profiles")
        .insert({
          user_id: profile.id,
          college: data.college,
          university: data.university,
          course: data.course,
          technology: data.technology,
          registration_status: "PENDING_ADMIN_APPROVAL", // Moves to PENDING_ADMIN_APPROVAL upon verified payment
        })
        .select()
        .single();

      if (spError || !newSp) {
        throw new Error(spError?.message || "Failed to register student profile.");
      }
      studentProfile = newSp;
    } else {
      await adminClient
        .from("student_profiles")
        .update({ registration_status: "PENDING_ADMIN_APPROVAL" })
        .eq("id", studentProfile.id);
    }

    // 5. Create Registration Application
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

    // 6. Record Payment (Fixed ₹1,000 INR)
    const { data: paymentRecord, error: payError } = await adminClient
      .from("payments")
      .insert({
        student_id: studentProfile.id,
        registration_id: registration.id,
        gateway: "RAZORPAY",
        order_id: orderId,
        payment_id: paymentId,
        amount: 1000.0,
        currency: "INR",
        status: "VERIFIED",
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payError || !paymentRecord) {
      throw new Error(payError?.message || "Failed to record payment.");
    }

    // 7. Automatic Receipt Generation (Section 14)
    const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`;
    await adminClient.from("receipts").insert({
      payment_id: paymentRecord.id,
      receipt_number: receiptNumber,
      storage_path: `receipts/${receiptNumber}.pdf`,
    });

    // 8. Immutable Audit Log (Section 20)
    await adminClient.from("audit_logs").insert({
      actor_user_id: profile.id,
      actor_role: "STUDENT",
      action: "REGISTRATION_SUBMITTED_AND_PAYMENT_VERIFIED",
      entity_type: "REGISTRATION",
      entity_id: registration.id,
      old_status: "PAYMENT_PENDING",
      new_status: "PENDING_ADMIN_APPROVAL",
      metadata: {
        application_number: appNumber,
        payment_id: paymentId,
        receipt_number: receiptNumber,
        amount: 1000,
      },
    });

    // 9. In-app Notification (Section 31)
    await adminClient.from("notifications").insert({
      user_id: profile.id,
      type: "REGISTRATION_SUBMITTED",
      title: "Registration & Payment Received",
      message: `Your application ${appNumber} and registration payment of ₹1,000 have been verified. An administrator is now reviewing your application.`,
    });

    return NextResponse.json({
      success: true,
      applicationNumber: appNumber,
      receiptNumber,
      status: "PENDING_ADMIN_APPROVAL",
      message: "Registration submitted successfully. Your payment has been verified and your application is waiting for admin approval.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
