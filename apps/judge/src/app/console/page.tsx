import { getHackathonsForUser, createHackathon } from "../actions/hackathons";
import { isAdmin } from "../actions/auth";
import { CreateHackathonDialog } from "@/components/createHackathonDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const hackathons = await getHackathonsForUser();
  const userIsAdmin = await isAdmin();

  // If user has no access to any hackathons, they shouldn't be here
  if (hackathons.length === 0 && !userIsAdmin) {
    redirect("/unauthorized");
  }

  // If user has access to exactly one hackathon, redirect them directly
  if (hackathons.length === 1 && !userIsAdmin) {
    redirect(`/console/${hackathons[0].id}`);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hackathons</h1>
          <p className="text-muted-foreground mt-2">
            {userIsAdmin
              ? "Manage all hackathons in the system"
              : "View hackathons you have access to"}
          </p>
        </div>
        {userIsAdmin && (
          <CreateHackathonDialog createHackathon={createHackathon} />
        )}
      </div>

      {hackathons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No hackathons yet</p>
            {userIsAdmin && (
              <p className="text-sm">
                Click "Create New Hackathon" to get started
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hackathons.map((hackathon) => (
            <Card
              key={hackathon.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{hackathon.name}</CardTitle>
                {hackathon.description && (
                  <CardDescription>{hackathon.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Teams</p>
                    <p className="font-semibold">{hackathon._count.teams}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submissions</p>
                    <p className="font-semibold">
                      {hackathon._count.submissions}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Participants</p>
                    <p className="font-semibold">
                      {hackathon._count.participants}
                    </p>
                  </div>
                </div>
                <Link href={`/console/${hackathon.id}`}>
                  <Button className="w-full">View This Hackathon</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
