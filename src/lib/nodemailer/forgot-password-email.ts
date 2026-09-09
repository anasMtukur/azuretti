import nodemailer from "nodemailer";

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM     = process.env.EMAIL_FROM ?? "noreply@azuretti.com";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",   // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string | null;
  token: string;
}) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${opts.token}`;

  await transporter.sendMail({
    from:    `"Azuretti" <${FROM}>`,
    to:      opts.to,
    subject: "Reset your Azuretti password",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:'DM Sans',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="background:#1c7d4a;padding:28px 40px;">
                      <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                        Azuretti
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                        Reset your password
                      </p>
                      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                        Hi ${opts.name ?? "there"}, we received a request to reset the password
                        for your Azuretti account. Click the button below to choose a new one.
                      </p>
                      <a href="${resetUrl}"
                        style="display:inline-block;background:#1c7d4a;color:#ffffff;font-size:15px;
                               font-weight:600;padding:14px 28px;border-radius:8px;text-decoration:none;">
                        Reset password
                      </a>
                      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                        This link expires in <strong>1 hour</strong>. If you didn't request a
                        password reset, you can safely ignore this email — your password won't change.
                      </p>
                      <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;" />
                      <p style="margin:0;font-size:12px;color:#d1d5db;">
                        Or copy this link into your browser:<br/>
                        <span style="color:#6b7280;word-break:break-all;">${resetUrl}</span>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Hi ${opts.name ?? "there"},

We received a request to reset the password for your Azuretti account.

Reset your password here: ${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    `.trim(),
  });
}