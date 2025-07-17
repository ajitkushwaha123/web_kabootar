import { transporter } from "./Nodemailer";

export async function sendInvitationEmail({ to, workspaceName, inviteUrl }) {
  if (!to || !workspaceName || !inviteUrl) {
    throw new Error("Missing required fields for sending invitation email.");
  }

  const mailOptions = {
    from: `"Kabootar.ai" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: `You’re invited to join the "${workspaceName}" workspace on Kabootar.ai`,
    html: `
      <div style="font-family: 'Poppins', sans-serif; background-color: #f9fafb; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
          
          <div style="background-color: #10b981; padding: 24px 32px; color: #fff;">
            <h1 style="margin: 0; font-size: 24px;">🚀 Invitation to join <strong>${workspaceName}</strong></h1>
            <p style="margin: 4px 0 0; font-size: 14px;">on <strong>Kabootar.ai</strong> CRM Platform</p>
          </div>
          
          <div style="padding: 32px; color: #111827;">
            <p style="font-size: 16px; margin-bottom: 16px;">Hello there,</p>
            <p style="font-size: 16px; line-height: 1.6;">
              You've been invited to join the <strong>${workspaceName}</strong> workspace inside <strong>Kabootar.ai</strong> — a powerful CRM built for modern communication workflows using WhatsApp.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 14px; color: #6b7280;">If you weren’t expecting this invitation, you can safely ignore this email.</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px 32px; font-size: 12px; color: #9ca3af; text-align: center;">
            &copy; ${new Date().getFullYear()} Kabootar.ai · All rights reserved
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Invitation sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("Failed to send invitation email.");
  }
}
