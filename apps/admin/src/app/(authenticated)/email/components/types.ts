import type { ApplicationStatus } from "@repo/database";

export type Hackathon = {
  id: string;
  name: string;
  _count: {
    applications: number;
  };
};

export type Recipient = {
  email: string;
  name: string;
  status: ApplicationStatus;
};

export const STATUS_OPTIONS = [
  { value: "ALL", label: "All Recipients" },
  { value: "APPLIED", label: "Applied" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "CHECKED_IN", label: "Checked In" },
] as const;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BeaverHacks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">BeaverHacks</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px; font-weight: 600;">Hello!</h2>

              <p style="margin: 0 0 16px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                This is your email content. Write your message here.
              </p>

              <p style="margin: 0 0 24px; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                You can customize this template with your own HTML.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #000000; border-radius: 6px;">
                    <a href="https://beaverhacks.org" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">
                      Visit BeaverHacks
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 8px; color: #888888; font-size: 12px;">
                Oregon State University Hackathon Club
              </p>
              <p style="margin: 0; color: #888888; font-size: 11px;">
                <a href="https://beaverhacks.org" style="color: #666666;">beaverhacks.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
