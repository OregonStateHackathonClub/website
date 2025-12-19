import { auth } from "@repo/auth";
import { prisma, type ShirtSize } from "@repo/database";
import { uploadFile } from "@repo/storage";
import { headers } from "next/headers";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request): Promise<Response> {
  const applicationsOpen = false;

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

  const existingApplication = await prisma.application.findUnique({
    where: { userId: user.id },
  });

  if (existingApplication) {
    return new Response("You have already submitted an application", {
      status: 400,
    });
  }

  const formData = await request.formData();

  const path = await uploadFile(formData.get("resume") as File);

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      university: formData.get("university") as string,
      graduationYear: parseInt(formData.get("graduationYear") as string),
      shirtSize: formData.get("shirtSize") as ShirtSize,
      resumePath: path,
    },
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "BeaverHacks Registration Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F97316; margin-top: 20px;">BeaverHacks Registration Confirmed!</h2>
          
          <p>Hello ${user.name},</p>
          
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
