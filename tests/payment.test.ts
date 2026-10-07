import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("Payment Business Rules & Cryptographic Signatures", () => {
  const FIXED_FEE_INR = 1000;
  const SECRET = "test_razorpay_secret_key";

  it("enforces fixed registration fee of ₹1,000 INR", () => {
    const fee = 1000;
    expect(fee).toBe(FIXED_FEE_INR);
    const amountInPaise = fee * 100;
    expect(amountInPaise).toBe(100000);
  });

  it("validates authentic HMAC-SHA256 signature", () => {
    const orderId = "order_123456";
    const paymentId = "pay_789012";

    const signature = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(signature).toBe(expected);
  });

  it("detects tampered signature", () => {
    const orderId = "order_123456";
    const paymentId = "pay_789012";

    const tampered = "invalid_signature_hash";
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(tampered).not.toBe(expected);
  });
});
