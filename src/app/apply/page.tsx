

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ApplicationForm } from "@/components/form";
import { AuthPage } from "@/components/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const Apply = async() => {

  const applicationsOpen = true;

  if (!applicationsOpen) return (
    <div className="flex w-screen h-screen items-center justify-center">
      <div>Applications are closed</div>
    </div>
  )

  const session = await auth.api.getSession({
      headers: await headers()
  })

  if (session) {
    redirect("/profile")
  }
  
  return <AuthPage />

  // const { user } = await getCurrentSession()

  // if (!user) return <AuthPage />

  // const existingApplication = await prisma.user.findUnique({
  //   where: { session?.user.id }
  // })

  // if (existingApplication) redirect("/profile")

  // const applicationsOpen = false;
  
  // return (
  //   <div className="flex justify-center items-center h-screen">
  //     <div className="h-[90vh]">
  //       <ApplicationForm name={user.name} email={user.email}/>
  //     </div>
  //   </div>
  // )
}

export default Apply