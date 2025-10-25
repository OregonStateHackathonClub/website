// src/app/page.tsx

import { prisma } from "@repo/database";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const currentHackathon = await prisma.hackathon.findFirst({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  if (currentHackathon) {
    redirect(`/${currentHackathon.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-center text-neutral-400">
      <h1 className="text-2xl font-bold text-white">No Hackathon Found</h1>
      <p className="mt-2">Please check back later.</p>
    </div>
  );
}
