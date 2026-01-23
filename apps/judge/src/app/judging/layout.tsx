import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    unauthorized();
  }

  // Check if user is a judge for any hackathon
  const judge = await prisma.judge.findFirst({
    where: { email: session.user.email },
  });

  if (!judge) {
    unauthorized();
  }

  return (
    <div className="min-h-dvh w-full bg-neutral-950 text-neutral-200">
      {children}
    </div>
  );
}
