"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function acceptanceEmailHtml(name: string, hackathonName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Welcome to ${hackathonName}!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Hey ${name},
              </p>
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Congratulations! You've been accepted to <strong>${hackathonName}</strong>. We're excited to have you join us.
              </p>
              <p style="margin: 0 0 12px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Here's what to do next:
              </p>

              <ul style="margin: 0 0 28px; padding-left: 20px; color: #18181b; font-size: 16px; line-height: 2;">
                <li>Read the <a href="https://beaverhacks.notion.site/" target="_blank" style="color: #F97316; text-decoration: underline;">Hacker Guide</a></li>
                <li>Join our <a href="https://discord.com/invite/hQaF72fwAr" target="_blank" style="color: #F97316; text-decoration: underline;">Discord</a></li>
              </ul>

              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you have any questions, don't hesitate to reach out. See you there!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                BeaverHacks &mdash; Hackathon Club at Oregon State University
              </p>
              <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 13px;">
                <a href="mailto:team@beaverhacks.org" style="color: #F97316; text-decoration: none;">team@beaverhacks.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statusUpdateEmailHtml(
  name: string,
  hackathonName: string,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color: #18181b; padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Application Update
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Hey ${name},
              </p>
              <p style="margin: 0 0 28px; color: #18181b; font-size: 16px; line-height: 1.6;">
                There's been an update to your <strong>${hackathonName}</strong> application. Visit your <a href="https://beaverhacks.org/profile" target="_blank" style="color: #F97316; text-decoration: underline;">profile</a> to view the details.
              </p>

              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you have any questions, feel free to reach out.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                BeaverHacks &mdash; Hackathon Club at Oregon State University
              </p>
              <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 13px;">
                <a href="mailto:team@beaverhacks.org" style="color: #F97316; text-decoration: none;">team@beaverhacks.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendStatusEmail(
  email: string,
  name: string,
  hackathonName: string,
  status: "ACCEPTED" | "REJECTED" | "WAITLISTED",
): Promise<void> {
  const isAccepted = status === "ACCEPTED";

  const subject = isAccepted
    ? `You're in! Welcome to ${hackathonName}`
    : `${hackathonName} — Application Update`;

  const html = isAccepted
    ? acceptanceEmailHtml(name, hackathonName)
    : statusUpdateEmailHtml(name, hackathonName);

  try {
    await resend.emails.send({
      from: "BeaverHacks <info@beaverhacks.org>",
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send ${status} email to ${email}:`, error);
  }
}
