import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth/session"
import { ApplicationForm } from "@/components/form"
import { AuthPage } from "@/components/auth"
import { prisma } from "@/lib/prisma"

const Apply = async() => {
  const { user } = await getCurrentSession()

  if (!user) return <AuthPage />

  console.log(user)
  const existingApplication = await prisma.application.findUnique({
    where: { userId: user.id }
  })

  console.log(existingApplication)
  if (existingApplication) {
    redirect("/profile")
  }
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-[90vh] overflow-y-auto scrollbar-hide">
        <ApplicationForm name={user.name} email={user.email}/>
      </div>
    </div>
  )
}

export default Apply