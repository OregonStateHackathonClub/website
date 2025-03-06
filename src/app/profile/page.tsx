import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/auth/session"
import { logout } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

import { AuthPage } from "@/components/auth"
import { Button } from "@/components/ui/button"

const Profile = async() => {
  
  const { user } = await getCurrentSession()

  if (!user) return <AuthPage />

  const application = await prisma.application.findUnique({
    where: { userId: user.id }
  })

  if (!application) redirect("/apply")

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form action={logout}>  
        <Button variant="outline" type="submit" className="absolute top-4 right-4">Logout</Button>
      </form>
      <div>Welcome back {user.name}</div>
      <div>Congrats, you have submitted your application!</div>
    </div>
  )
}

export default Profile