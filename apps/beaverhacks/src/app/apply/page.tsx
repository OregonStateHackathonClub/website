import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth";
import { ApplicationForm } from "@/components/form";

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
