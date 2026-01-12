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

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: user.id}
  })

  if(!participant){
    unauthorized();
  }

  const judgeManager = await prisma.judge.findFirst({
    where: { 
      hackathon_participant_id: participant.id,
      role: 'MANAGER',
    }
  })

  if(user.role != 'ADMIN' || judgeManager){
    unauthorized();
  }
  
  return (
    <div className="flex min-h-dvh grow bg-zinc-900 text-zinc-50">
      {children}
    </div>
  );
}
