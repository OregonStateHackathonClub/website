import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { ApplicationForm } from "@/components/form";
import { AuthPage } from "@/components/auth";

const Apply = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <AuthPage />;

  const user = session.user;

  const existingApplication = await prisma.application.findUnique({
    where: { userId: user.id },
  });

  if (existingApplication) redirect("/profile");

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-[90vh]">
        <ApplicationForm name={user.name} email={user.email} />
      </div>
    </div>
  );
};

export default Apply;
