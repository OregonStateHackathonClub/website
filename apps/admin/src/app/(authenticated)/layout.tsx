import { auth } from "@repo/auth";
import { prisma, UserRole } from "@repo/database";
import { headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3004";
    redirect(
      `${authUrl}/login?callbackURL=${encodeURIComponent(`${adminUrl}/dashboard`)}`,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    unauthorized();
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header user={user} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
