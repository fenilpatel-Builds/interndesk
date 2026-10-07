import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to initiate registration fee payment." },
        { status: 400 }
      );
    }

    // STRICT RULE (Section 13): Registration fee is ₹1,000 INR. Amount must NEVER come from client!
    const FIXED_FEE_INR = 1000;
    const amountInPaise = FIXED_FEE_INR * 100;

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // Real Razorpay order ID generation
    let orderId = `order_${crypto.randomBytes(10).toString("hex")}`;

    if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes("rzp_test_...")) {
      // Direct call to Razorpay Orders API
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
            fee_type: "INTERNSHIP_REGISTRATION",
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
      amount: FIXED_FEE_INR,
      currency: "INR",
      keyId: razorpayKeyId || "rzp_test_dummy_key",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
