/**
 * Branded Transactional Email Service for 6-Digit OTP Delivery
 * Supports Resend REST API (Free Tier: 3,000 emails/month)
 */

export async function sendOtpEmail(email: string, otpCode: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "InternDesk <onboarding@resend.dev>";

  if (!apiKey || apiKey.startsWith("re_placeholder") || apiKey.startsWith("re_...")) {
    console.log(`[LOCAL OTP SIMULATION] OTP for ${email}: ${otpCode}`);
    return {
      success: true,
      error: "No Resend key configured. In development, OTP is logged to server console.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: `Your InternDesk Verification Code: ${otpCode}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
                .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .logo { font-size: 20px; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
                h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
                p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; }
                .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 28px 0; }
                .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; font-family: monospace; }
                .footer { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 28px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">InternDesk</div>
                <h1>Your One-Time Verification Code</h1>
                <p>Hello,</p>
                <p>Use the following 6-digit verification code to access your InternDesk account. This code is confidential and expires in 10 minutes.</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otpCode}</div>
                </div>

                <p>If you did not request this verification code, please ignore this email or contact security.</p>
                
                <div class="footer">
                  © 2026 InternDesk Technologies Ltd. • Learn • Work • Grow
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("[Resend API Error]:", errData);
      return { success: false, error: errData.message || "Failed to send email via Resend" };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected email transmission error";
    console.error("[Resend Network Error]:", message);
    return { success: false, error: message };
  }
}
