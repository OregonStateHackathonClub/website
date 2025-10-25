import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const sender = from || "info@beaverhacks.org";
  
  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}