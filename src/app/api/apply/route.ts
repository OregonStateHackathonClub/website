import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { ShirtSize } from "@prisma/client";

export async function POST(request: Request): Promise<Response> {
  const applicationsOpen = false;
  
  if (!applicationsOpen) {
    return new Response('Applications are closed', { 
      status: 400 
    });
  }

  const cookieStore = cookies()
  const sessionToken = cookieStore.get('session')?.value

  if (!sessionToken) {
    return new Response('Unauthorized', { status: 401 })
  }
  const { user } = await validateSessionToken(sessionToken)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const existingApplication = await prisma.application.findUnique({
    where: { userId: user.id }
  })

  if (existingApplication) {
    return new Response('You have already submitted an application', { 
      status: 400 
    })
  }

  const formData = await request.formData()

  const path = await uploadFile(formData.get("resume") as File)

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      university: formData.get("university") as string,
      graduationYear: parseInt(formData.get("graduationYear") as string),
      shirtSize: formData.get("shirtSize") as ShirtSize,
      resumePath: path,
    }
  })

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
      `
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return Response.json(application)
}