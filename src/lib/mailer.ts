import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

if (
  !smtpHost ||
  !smtpUser ||
  !smtpPass
) {
  console.warn(
    "SMTP configuration is incomplete. Email sending will fail until SMTP_HOST, SMTP_USER and SMTP_PASS are configured."
  );
}

const transporter =
  nodemailer.createTransport({
    host: smtpHost,

    port: smtpPort,

    secure:
      smtpPort === 465,

    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

type BrandStatusEmailInput = {
  to: string;

  companyName: string;

  status:
    | "ACTIVE"
    | "REJECTED";

  rejectionReason?: string | null;
};

export async function sendBrandStatusEmail({
  to,
  companyName,
  status,
  rejectionReason,
}: BrandStatusEmailInput) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "SMTP configuration is incomplete."
    );
  }

  if (status === "ACTIVE") {
    return transporter.sendMail({
      from: smtpFrom,

      to,

      subject:
        "Your Revtail Brand Account Has Been Approved",

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
          <h2>Brand Account Approved</h2>

          <p>Dear ${escapeHtml(companyName)},</p>

          <p>
            Your Brand account on <strong>Revtail</strong>
            has been approved by our Admin team.
          </p>

          <p>
            You can now log in to your Brand dashboard and
            use the available Brand features.
          </p>

          <p>
            Regards,<br />
            Revtail Team
          </p>
        </div>
      `,
    });
  }

  return transporter.sendMail({
    from: smtpFrom,

    to,

    subject:
      "Update Regarding Your Revtail Brand Registration",

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2>Brand Registration Rejected</h2>

        <p>Dear ${escapeHtml(companyName)},</p>

        <p>
          Your Brand registration on <strong>Revtail</strong>
          could not be approved.
        </p>

        ${
          rejectionReason
            ? `
              <p>
                <strong>Reason:</strong><br />
                ${escapeHtml(rejectionReason)}
              </p>
            `
            : ""
        }

        <p>
          Regards,<br />
          Revtail Team
        </p>
      </div>
    `,
  });
}


type CampaignStatusEmailInput = {
  to: string;
  companyName: string;
  campaignCode: string;
  productName: string;
  status: "LIVE" | "REJECTED";
  rejectionReason?: string | null;
};

export async function sendCampaignStatusEmail({
  to,
  companyName,
  campaignCode,
  productName,
  status,
  rejectionReason,
}: CampaignStatusEmailInput) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error(
      "SMTP configuration is incomplete."
    );
  }

  if (!to?.trim()) {
    throw new Error(
      "Brand email address is required."
    );
  }

  const safeCompanyName =
    escapeHtml(companyName);

  const safeCampaignCode =
    escapeHtml(campaignCode);

  const safeProductName =
    escapeHtml(productName);

  if (status === "LIVE") {
    return transporter.sendMail({
      from: smtpFrom,
      to,
      subject:
        `Campaign Approved and LIVE - ${campaignCode}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
          <h2>Campaign Approved</h2>

          <p>Dear ${safeCompanyName},</p>

          <p>
            Your campaign on <strong>Revtail</strong> has been
            approved by the Admin team and is now
            <strong>LIVE</strong>.
          </p>

          <p>
            <strong>Campaign Code:</strong>
            ${safeCampaignCode}
            <br />
            <strong>Product:</strong>
            ${safeProductName}
          </p>

          <p>
            Testers can now view and apply for the campaign
            based on the configured eligibility criteria.
          </p>

          <p>
            Regards,<br />
            Revtail Team
          </p>
        </div>
      `,
    });
  }

  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject:
      `Campaign Rejected - ${campaignCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2>Campaign Rejected</h2>

        <p>Dear ${safeCompanyName},</p>

        <p>
          Your campaign on <strong>Revtail</strong>
          could not be approved.
        </p>

        <p>
          <strong>Campaign Code:</strong>
          ${safeCampaignCode}
          <br />
          <strong>Product:</strong>
          ${safeProductName}
        </p>

        ${
          rejectionReason
            ? `
              <p>
                <strong>Reason:</strong><br />
                ${escapeHtml(rejectionReason)}
              </p>
            `
            : ""
        }

        <p>
          Please review the campaign details and make
          the required corrections before submitting
          again, if applicable.
        </p>

        <p>
          Regards,<br />
          Revtail Team
        </p>
      </div>
    `,
  });
}

type CampaignCompletedEmailInput = {
  to: string;
  companyName: string;
  campaignCode: string;
  productName: string;
};

export async function sendCampaignCompletedEmail({
  to,
  companyName,
  campaignCode,
  productName,
}: CampaignCompletedEmailInput) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP configuration is incomplete.");
  }

  if (!to?.trim()) {
    throw new Error("Brand email address is required.");
  }

  return transporter.sendMail({
    from: smtpFrom,
    to,
    subject: `Campaign Completed - ${campaignCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2>Campaign Completed</h2>

        <p>Dear ${escapeHtml(companyName)},</p>

        <p>
          Your campaign on <strong>Revtail</strong> has been marked
          as <strong>COMPLETED</strong> by the Admin team.
        </p>

        <p>
          <strong>Campaign Code:</strong> ${escapeHtml(campaignCode)}<br />
          <strong>Product:</strong> ${escapeHtml(productName)}
        </p>

        <p>
          All campaign activities are now closed.
        </p>

        <p>
          Regards,<br />
          Revtail Team
        </p>
      </div>
    `,
  });
}

type AdminLoginOtpEmailInput = {
  to: string;
  otp: string;
};

export async function sendAdminLoginOtpEmail({
  to,
  otp,
}: AdminLoginOtpEmailInput) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP configuration is incomplete.");
  }

  if (!to?.trim()) {
    throw new Error("Admin email address is required.");
  }

  return transporter.sendMail({
    from: smtpFrom,
    to: to.trim(),
    subject: `Revtail Admin - Login Verification Code (${otp})`,
    text:
      `Hello Admin,\n\n` +
      `Your one-time login verification code for Revtail Admin Dashboard is:\n\n` +
      `   ${otp}\n\n` +
      `This code is valid for 5 minutes. Please do not share this code with anyone.\n\n` +
      `If you did not request this login code, please secure your account immediately.\n\n` +
      `Regards,\n` +
      `Revtail Security Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0d3b66; margin: 0 0 6px 0; font-size: 22px; font-weight: 700;">Revtail Admin</h2>
          <p style="color: #64748b; margin: 0; font-size: 13px;">Login Verification Code</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px 0;">
          Hello <strong>Admin</strong>,
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
          A login attempt was made for your Revtail Admin account. Use the one-time verification code below to complete your sign-in:
        </p>

        <div style="background: #f8fafc; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0d3b66; font-family: monospace;">
            ${otp}
          </span>
          <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
            Valid for <strong>5 minutes</strong>
          </div>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 16px 0;">
          <strong>Security Notice:</strong> Do not share this code with anyone. Revtail support will never ask for your verification code.
        </p>

        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; margin: 0;">
          If you did not initiate this login request, please change your password immediately.
        </p>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Revtail. All rights reserved.
        </div>
      </div>
    `,
  });
}


function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}