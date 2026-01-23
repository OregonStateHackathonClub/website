import { prisma } from "@repo/database";
import { Composer } from "./components/composer";

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

  return <Composer hackathons={hackathons} />;
}
