import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { prisma } from "@repo/database"

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    unauthorized();
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  if (!user) {
    unauthorized();
  }

  if(user.role != 'ADMIN'){
    unauthorized();
  }
  
  return (
    <div className="flex min-h-dvh grow bg-zinc-900 text-zinc-50">
      {children}
    </div>
  );
}
