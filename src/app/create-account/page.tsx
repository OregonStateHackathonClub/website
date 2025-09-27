

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ApplicationForm } from "@/components/form";
import { CreateAccount } from "@/components/create-account";
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
  
  return <CreateAccount />

}

export default Apply