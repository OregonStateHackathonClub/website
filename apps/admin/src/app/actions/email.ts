"use server";

import { Resend } from "resend";
import { requireAdmin } from "./auth";
import { prisma } from "@repo/database";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  from?: string;
};

type SendEmailResult = {
  success: boolean;
  sentCount: number;
  errors: string[];
};

export async function sendEmail({
  to,
  subject,
  html,
  from,
}: SendEmailInput): Promise<SendEmailResult> {
  await requireAdmin();

  const sender = from || "BeaverHacks <info@beaverhacks.org>";
  const errors: string[] = [];
  let sentCount = 0;

  // Send emails in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < to.length; i += batchSize) {
    const batch = to.slice(i, i + batchSize);

    const promises = batch.map(async (email) => {
      try {
        const { error } = await resend.emails.send({
          from: sender,
          to: email,
          subject,
          html,
        });

        if (error) {
          errors.push(`${email}: ${error.message}`);
          return false;
        }
        return true;
      } catch (error) {
        errors.push(
          `${email}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        return false;
      }
    });

    const results = await Promise.all(promises);
    sentCount += results.filter(Boolean).length;
  }

  return {
    success: errors.length === 0,
    sentCount,
    errors,
  };
}

export async function getEmailRecipients(hackathonId: string) {
  await requireAdmin();

  const applications = await prisma.application.findMany({
    where: { hackathonId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return applications.map((app) => ({
    email: app.user.email,
    name: app.name,
    status: app.status,
  }));
}
