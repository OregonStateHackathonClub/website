import { prisma } from "@repo/database";
import { isAdmin, isManager } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

interface PageProps {
  params: Promise<{ year: string }>;
}

export default async function Page({ params }: PageProps) {
  const { year } = await params;

  // Verify user has access to this hackathon
  const userIsAdmin = await isAdmin();
  const userIsManager = await isManager(year);

  if (!userIsAdmin && !userIsManager) {
    redirect("/unauthorized");
  }

  // Fetch hackathon details
  const hackathon = await prisma.hackathon.findUnique({
    where: { id: year },
    include: {
      _count: {
        select: {
          teams: true,
          submissions: true,
          participants: true,
          tracks: true,
          judges: true,
        },
      },
    },
  });

  if (!hackathon) {
    redirect("/console");
  }

  const navItems = [
    {
      title: "Users",
      description: "Manage participants and team assignments",
      href: `/console/${year}/users`,
      count: hackathon._count.participants,
      adminOnly: true,
    },
    {
      title: "Submissions",
      description: "View and manage project submissions",
      href: `/console/${year}/submissions`,
      count: hackathon._count.submissions,
      adminOnly: false,
    },
    {
      title: "Tracks",
      description: "Manage tracks and judging rubrics",
      href: `/console/${year}/tracks`,
      count: hackathon._count.tracks,
      adminOnly: false,
    },
    {
      title: "Judges",
      description: "Manage judges and their assignments",
      href: `/console/${year}/judge`,
      count: hackathon._count.judges,
      adminOnly: true,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/console">
          <Button variant="ghost" className="mb-4">
            ← Back to all hackathons
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{hackathon.name}</h1>
        {hackathon.description && (
          <p className="text-muted-foreground mt-2">{hackathon.description}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {navItems
          .filter((item) => !item.adminOnly || userIsAdmin)
          .map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{item.title}</CardTitle>
                    <span className="text-2xl font-bold text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage {item.title}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold">
                {hackathon._count.participants}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teams</p>
              <p className="text-2xl font-bold">{hackathon._count.teams}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-2xl font-bold">
                {hackathon._count.submissions}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracks</p>
              <p className="text-2xl font-bold">{hackathon._count.tracks}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Judges</p>
              <p className="text-2xl font-bold">{hackathon._count.judges}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
