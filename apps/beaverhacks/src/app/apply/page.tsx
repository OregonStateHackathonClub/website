import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { ApplicationForm } from "@/components/form";

const Apply = async () => {
  const applicationsOpen = process.env.APPLICATIONS_OPEN === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackURL=/apply");
  }

  // Get the current hackathon
  const hackathon = await prisma.hackathon.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center text-neutral-400">
          <h1 className="text-xl font-semibold text-white mb-2">No Active Hackathon</h1>
          <p>Please check back later.</p>
        </div>
      </div>
    );
  }

  // Check if user already applied to this hackathon
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_hackathonId: {
        userId: session.user.id,
        hackathonId: hackathon.id,
      },
    },
  });

  if (existingApplication) redirect("/profile");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div>
        <ApplicationForm email={session.user.email} applicationsOpen={applicationsOpen} />
      </div>
    </div>
  );
};

export default Apply;
