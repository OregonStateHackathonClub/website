import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { prisma } from "@repo/database";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    unauthorized();
  }

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id },
    include: { judge: true },
  });

  if (!participant?.judge) {
    unauthorized();
  }

  return (
    <div className="flex min-h-dvh w-full grow bg-zinc-900 text-zinc-50">
      {children}
    </div>
  );
}
