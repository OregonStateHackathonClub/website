import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { ApplicationForm } from "@/components/form";
import { AuthPage } from "@/components/auth";

const Apply = async() => {
  const { user } = await getCurrentSession()

  if (!user) return <AuthPage />

  const existingApplication = await prisma.application.findUnique({
    where: { userId: user.id }
  })

  if (existingApplication) redirect("/profile")

  const applicationsOpen = false;

  if (!applicationsOpen) return (
    <div className="flex w-screen h-screen items-center justify-center">
      <div>Applications are closed</div>
    </div>
  )
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-[90vh]">
        <ApplicationForm name={user.name} email={user.email}/>
      </div>
    </div>
  )
}

export default Apply