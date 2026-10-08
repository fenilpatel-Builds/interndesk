/**
 * Branded Transactional Email Service for 6-Digit OTP Delivery
 * Supports Resend REST API (Free Tier: 3,000 emails/month)
 */

export interface SendOtpResult {
  success: boolean;
  error?: string;
  forwardedTo?: string;
}

export async function sendOtpEmail(email: string, otpCode: string): Promise<SendOtpResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "InternDesk <onboarding@resend.dev>";
  const cleanEmail = email.toLowerCase().trim();

  // If no valid key or placeholder key, simulate in development
  if (!apiKey || apiKey.startsWith("re_placeholder") || apiKey.startsWith("re_...")) {
    console.log(`\n================================================================`);
    console.log(`[LOCAL DEV OTP SIMULATION]`);
    console.log(`Recipient : ${cleanEmail}`);
    console.log(`OTP Code  : ${otpCode}`);
    console.log(`================================================================\n`);
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
        to: [cleanEmail],
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

      const errorMessage = typeof errData.message === "string" ? errData.message : "";
      const isSandboxRestriction =
        errorMessage.toLowerCase().includes("testing emails to your own email address") ||
        errorMessage.toLowerCase().includes("huntking002@gmail.com");

      // Handle Resend unverified domain limitation (only allowed to send to huntking002@gmail.com on free tier)
      if (isSandboxRestriction) {
        console.warn(`[Resend Sandbox Notice]: Free trial sender (${fromEmail}) cannot send to external recipient (${cleanEmail}). Forwarding to owner account huntking002@gmail.com...`);

        try {
          const fallbackRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: ["huntking002@gmail.com"],
              subject: `[InternDesk Test OTP for ${cleanEmail}]: ${otpCode}`,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; }
                      .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; }
                      .badge { display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; border-radius: 6px; margin-bottom: 12px; }
                      .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
                      .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #1d4ed8; font-family: monospace; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="badge">RESEND TESTING SANDBOX</div>
                      <h2 style="margin: 0 0 8px 0; color: #0f172a;">InternDesk Verification Code</h2>
                      <p style="color: #475569; font-size: 14px;"><strong>Intended Recipient:</strong> ${cleanEmail}</p>
                      <p style="color: #475569; font-size: 13px;">Because your Resend account has not verified a custom domain yet, test emails are routed to your verified developer email (huntking002@gmail.com).</p>
                      
                      <div class="otp-box">
                        <div class="otp-code">${otpCode}</div>
                      </div>

                      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
                        To send directly to other student emails in production, verify your domain at <a href="https://resend.com/domains" style="color: #2563eb;">resend.com/domains</a> and set <code>EMAIL_FROM=InternDesk &lt;onboarding@yourdomain.com&gt;</code> in <code>.env.local</code>.
                      </p>
                    </div>
                  </body>
                </html>
              `,
            }),
          });

          if (fallbackRes.ok) {
            console.log(`[Resend Fallback Success]: Test OTP ${otpCode} successfully delivered to huntking002@gmail.com for student ${cleanEmail}`);
          }
        } catch (fallbackErr) {
          console.error("[Resend Fallback Network Error]:", fallbackErr);
        }

        // Print prominently in server logs so development is never blocked
        console.log(`\n================================================================`);
        console.log(`[INTERNDESK OTP CODE]`);
        console.log(`Target Email : ${cleanEmail}`);
        console.log(`OTP CODE     : ${otpCode}`);
        console.log(`Delivered To : huntking002@gmail.com (Resend Sandbox)`);
        console.log(`================================================================\n`);

        return {
          success: true,
          forwardedTo: "huntking002@gmail.com",
        };
      }

      return { success: false, error: errorMessage || "Failed to send email via Resend" };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected email transmission error";
    console.error("[Resend Network Error]:", message);
    return { success: false, error: message };
  }
}
