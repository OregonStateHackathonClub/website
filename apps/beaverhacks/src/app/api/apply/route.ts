import { headers } from "next/headers";
import { Resend } from "resend";
import { prisma, type ShirtSize } from "@repo/database";
import { uploadFile } from "@repo/storage";
import { auth } from "@repo/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request): Promise<Response> {
  const applicationsOpen = process.env.APPLICATIONS_OPEN === "true";

  if (!applicationsOpen) {
    return new Response("Applications are closed", {
      status: 400,
    });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = session.user;

  // Get the current hackathon (most recent)
  const hackathon = await prisma.hackathon.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!hackathon) {
    return new Response("No active hackathon found", { status: 400 });
  }

  // Check if user already applied to this hackathon
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_hackathonId: {
        userId: user.id,
        hackathonId: hackathon.id,
      },
    },
  });

  if (existingApplication) {
    return new Response("You have already submitted an application for this hackathon", {
      status: 400,
    });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;

  const path = await uploadFile(formData.get("resume") as File);

  // Create application and hackathon participant in a transaction
  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        userId: user.id,
        hackathonId: hackathon.id,
        name,
        university: formData.get("university") as string,
        phoneNumber: formData.get("phoneNumber") as string,
        levelOfStudy: formData.get("levelOfStudy") as string,
        country: formData.get("country") as string,
        linkedinUrl: (formData.get("linkedinUrl") as string) || "",
        shirtSize: formData.get("shirtSize") as ShirtSize,
        resumePath: path,
      },
    });

    // Also create hackathon participant record (upsert in case it already exists)
    await tx.hackathonParticipant.upsert({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: hackathon.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        hackathonId: hackathon.id,
      },
    });

    return app;
  });

  try {
    await resend.emails.send({
      from: "BeaverHacks <info@beaverhacks.org>",
      to: user.email,
      subject: "BeaverHacks — Application Received",
      html: `
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
          <tr>
            <td style="background: linear-gradient(135deg, #F97316, #EA580C); padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Application Received
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Hey ${name},
              </p>
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Thanks for applying to BeaverHacks! Your application has been received and is currently under review.
              </p>
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                We'll notify you by email once a decision has been made. In the meantime, you can check your application status on your <a href="https://beaverhacks.org/profile" target="_blank" style="color: #F97316; text-decoration: underline;">profile</a>.
              </p>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you have any questions, feel free to reach out.
              </p>
            </td>
          </tr>
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
</html>
      `,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return Response.json(application);
}
