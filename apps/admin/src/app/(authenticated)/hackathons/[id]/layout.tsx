import { prisma } from "@repo/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HackathonNav } from "./components/nav";

interface HackathonLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function HackathonLayout({
  children,
  params,
}: HackathonLayoutProps) {
  const { id } = await params;

  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="max-w-6xl">
      <Link
        href="/hackathons"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hackathons
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">{hackathon.name}</h1>
        {hackathon.description && (
          <p className="text-sm text-neutral-500 mt-1">
            {hackathon.description}
          </p>
        )}
      </div>

      <HackathonNav hackathonId={hackathon.id} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
