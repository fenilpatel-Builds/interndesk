import { NextResponse } from "next/server";
import crypto from "crypto";
import { getProgramById, INTERNSHIP_PROGRAMS } from "@/lib/programs-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, programId, amount } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to initiate program enrollment payment." },
        { status: 400 }
      );
    }

    // Program enrollment fee lookup
    let programFee = 4999;
    if (programId) {
      const prog = getProgramById(programId);
      if (prog) programFee = prog.fee;
    } else if (amount && typeof amount === "number" && amount > 0) {
      programFee = amount;
    }

    const amountInPaise = programFee * 100;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Razorpay order ID generation
    let orderId = `order_${crypto.randomBytes(10).toString("hex")}`;

    if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes("rzp_test_...")) {
      const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            fee_type: "PROGRAM_ENROLLMENT",
            programId: programId || "general_program",
            email,
          },
        }),
      });

      if (rzpRes.ok) {
        const orderData = await rzpRes.json();
        orderId = orderData.id;
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: programFee,
      currency: "INR",
      keyId: razorpayKeyId || "rzp_test_dummy_key",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create program payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
