import { prisma } from "@repo/database";
import { EmailClient } from "./email-client";

export default async function EmailPage() {
  const hackathons = await prisma.hackathon.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  return <EmailClient hackathons={hackathons} />;
}
