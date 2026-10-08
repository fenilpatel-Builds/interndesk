/**
 * Multi-Provider Transactional Email Service
 * Supports:
 * 1. SMTP / Gmail App Password (via Nodemailer) - Sends to ANY recipient without domain verification
 * 2. Brevo (Sendinblue) REST API - Free 300 emails/day to ANY recipient
 * 3. Resend REST API
 */

import nodemailer from "nodemailer";

export interface SendOtpResult {
  success: boolean;
  error?: string;
  provider?: "SMTP" | "BREVO" | "RESEND" | "SIMULATION";
  forwardedTo?: string;
}

export async function sendOtpEmail(email: string, otpCode: string): Promise<SendOtpResult> {
  const cleanEmail = email.toLowerCase().trim();

  // HTML Template for 6-Digit OTP Email
  const emailHtml = `
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
  `;

  // =========================================================================
  // PROVIDER 1: SMTP / GMAIL APP PASSWORD (Sends to ANY recipient in the world)
  // =========================================================================
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `InternDesk <${smtpUser}>`,
        to: cleanEmail,
        subject: `Your InternDesk Verification Code: ${otpCode}`,
        html: emailHtml,
      });

      console.log(`[SMTP Success]: OTP code ${otpCode} delivered directly to ${cleanEmail}`);
      return { success: true, provider: "SMTP" };
    } catch (smtpErr: unknown) {
      const msg = smtpErr instanceof Error ? smtpErr.message : "SMTP delivery error";
      console.error("[SMTP Error]:", msg);
      // Fall through to other providers if available
    }
  }

  // =========================================================================
  // PROVIDER 2: BREVO (SENDINBLUE) REST API (Sends to ANY recipient)
  // =========================================================================
  const brevoKey = process.env.BREVO_API_KEY;
  const brevoSender = process.env.BREVO_SENDER_EMAIL || smtpUser || "notifications@interndesk.com";

  if (brevoKey) {
    try {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "InternDesk", email: brevoSender },
          to: [{ email: cleanEmail }],
          subject: `Your InternDesk Verification Code: ${otpCode}`,
          htmlContent: emailHtml,
        }),
      });

      if (brevoRes.ok) {
        console.log(`[Brevo Success]: OTP code ${otpCode} delivered directly to ${cleanEmail}`);
        return { success: true, provider: "BREVO" };
      } else {
        const brevoErr = await brevoRes.json().catch(() => ({}));
        console.error("[Brevo Error]:", brevoErr);
      }
    } catch (brevoNetErr: unknown) {
      console.error("[Brevo Network Error]:", brevoNetErr);
    }
  }

  // =========================================================================
  // PROVIDER 3: RESEND REST API
  // =========================================================================
  const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const resendFrom = process.env.EMAIL_FROM || "InternDesk <onboarding@resend.dev>";

  if (resendApiKey && !resendApiKey.startsWith("re_placeholder") && !resendApiKey.startsWith("re_...")) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [cleanEmail],
          subject: `Your InternDesk Verification Code: ${otpCode}`,
          html: emailHtml,
        }),
      });

      if (response.ok) {
        console.log(`[Resend Success]: OTP code ${otpCode} delivered to ${cleanEmail}`);
        return { success: true, provider: "RESEND" };
      }

      const errData = await response.json().catch(() => ({}));
      const errorMessage = typeof errData.message === "string" ? errData.message : "";
      console.error("[Resend API Error]:", errData);

      const isSandboxRestriction =
        errorMessage.toLowerCase().includes("testing emails to your own email address") ||
        errorMessage.toLowerCase().includes("huntking002@gmail.com");

      if (isSandboxRestriction) {
        console.warn(`[Resend Sandbox Notice]: Cannot send directly to ${cleanEmail} without custom domain on Resend. Forwarding to owner account huntking002@gmail.com...`);

        // Forward copy to owner account
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: resendFrom,
            to: ["huntking002@gmail.com"],
            subject: `[InternDesk Test OTP for ${cleanEmail}]: ${otpCode}`,
            html: `
              <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <p><strong>Recipient:</strong> ${cleanEmail}</p>
                <p><strong>OTP Code:</strong> <span style="font-size: 28px; font-weight: bold; color: #1e40af;">${otpCode}</span></p>
                <p style="color: #64748b; font-size: 12px;">Forwarded because Resend free tier without custom domain only permits sending to huntking002@gmail.com.</p>
              </div>
            `,
          }),
        }).catch(() => {});

        console.log(`\n================================================================`);
        console.log(`[INTERNDESK OTP CODE]`);
        console.log(`Target Recipient : ${cleanEmail}`);
        console.log(`OTP CODE         : ${otpCode}`);
        console.log(`Delivered To     : huntking002@gmail.com (Resend Sandbox)`);
        console.log(`================================================================\n`);

        return {
          success: true,
          provider: "RESEND",
          forwardedTo: "huntking002@gmail.com",
        };
      }

      return { success: false, error: errorMessage || "Failed to dispatch email via Resend" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Resend transmission error";
      console.error("[Resend Network Error]:", message);
      return { success: false, error: message };
    }
  }

  // =========================================================================
  // PROVIDER 4: LOCAL DEVELOPMENT SIMULATION
  // =========================================================================
  console.log(`\n================================================================`);
  console.log(`[LOCAL DEV OTP SIMULATION]`);
  console.log(`Recipient : ${cleanEmail}`);
  console.log(`OTP Code  : ${otpCode}`);
  console.log(`================================================================\n`);

  return {
    success: true,
    provider: "SIMULATION",
  };
}
