export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html } = options;

  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev";
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const sendgridFrom = process.env.SMTP_FROM || process.env.SENDGRID_FROM;

  // 1. Check Resend first
  const isResendConfigured = resendApiKey && 
    resendApiKey !== "re_your-resend-api-key" && 
    !resendApiKey.includes("your-");

  if (isResendConfigured) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Resend] API Error:", error);
        return false;
      }

      console.log(`[Email] Sent via Resend to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("[Email] Resend Failed to send:", error);
      return false;
    }
  }

  // 2. Check SendGrid next
  const isSendGridConfigured = sendgridApiKey && 
    sendgridApiKey !== "SG.your-sendgrid-api-key" && 
    !sendgridApiKey.includes("your-");

  if (isSendGridConfigured) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: sendgridFrom || "noreply@sendsignal.app" },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[SendGrid] API Error:", error);
        return false;
      }

      console.log(`[Email] Sent via SendGrid to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("[Email] SendGrid Failed to send:", error);
      return false;
    }
  }

  // 3. Check SMTP next
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "noreply@sendsignal.app";

  const isSmtpConfigured = smtpHost && 
    smtpHost !== "smtp.sendgrid.net" && 
    smtpUser && 
    smtpPass;

  if (isSmtpConfigured) {
    try {
      const nodemailer = await import("nodemailer");
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
        from: smtpFrom,
        to,
        subject,
        html,
      });

      console.log(`[Email] Sent via SMTP to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("[Email] SMTP Failed to send:", error);
      return false;
    }
  }

  // 4. Fallback: Development Mode
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 EMAIL (Development Mode - No real email provider configured)");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  const urlMatch = html.match(/href="([^"]+)"/);
  if (urlMatch) {
    console.log(`Reset Link: ${urlMatch[1]}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return true;
}

export function generatePasswordResetHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 40px auto;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 40px;">
        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #1a1a1a;">Reset Your Password</h1>
        
        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
          You requested a password reset for your Send Signal account.
        </p>
        
        <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">
          Click the button below to reset your password. This link will expire in 1 hour.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2563eb; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #6b6b6b;">
          If you didn't request this password reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;">
        
        <p style="margin: 0; font-size: 12px; color: #9a9a9a; text-align: center;">
          This email was sent by Send Signal<br>
          © ${new Date().getFullYear()} Send Signal. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
