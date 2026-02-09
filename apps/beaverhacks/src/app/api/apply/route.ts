import { headers } from "next/headers";
import { Resend } from "resend";
import { prisma } from "@repo/database";
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
        graduationYear: parseInt(formData.get("graduationYear") as string),
        shirtSize: formData.get("shirtSize") as string,
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
      subject: "BeaverHacks Registration Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F97316; margin-top: 20px;">BeaverHacks Registration Confirmed!</h2>

          <p>Hello ${name},</p>

          <p>Thank you for registering for BeaverHacks! Your application has been successfully submitted.</p>

          <!-- Rest of your email template -->

          <p style="margin-top: 30px;">See you at the hackathon!</p>
          <p>The BeaverHacks Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return Response.json(application);
}
