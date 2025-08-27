import ProfilePage from "@/components/ui/profile-page";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image"

export default async function Profile() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return (
      <>
        <nav className="fixed w-full flex justify-between items-center p-4 border-b z-10">
          <Link href="/" className="flex items-center gap-4">
            <Image src="/images/beaver.png" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12" alt="logo" />
            <div className="flex flex-col">
              <h1 className="text-lg uppercase font-bold sm:text-xl">
                BeaverHacks
              </h1>
              <p className="text-xs uppercase text-muted-foreground hidden sm:block">
                Oregon State University
              </p>
            </div>
          </Link>
          <Link href="../login">
            <button className="py-2 px-6 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">Sign In</button>
          </Link>
        </nav>
        <p className="w-screen h-screen flex items-center justify-center">Unauthorized</p>
      </>
    );
  }

  return (
    <>
      <nav className="fixed w-full flex justify-between items-center p-4 border-b z-10">
        <Link href="/" className="flex items-center gap-4">
          <Image src="/images/beaver.png" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12" alt="logo" />
          <div className="flex flex-col">
            <h1 className="text-lg uppercase font-bold sm:text-xl">
              BeaverHacks
            </h1>
            <p className="text-xs uppercase text-muted-foreground hidden sm:block">
              Oregon State University
            </p>
          </div>
        </Link>
        {/* Sign Out Button */}
        <SignOutButton />
      </nav>

      <div className="flex justify-center items-center flex-col w-screen h-screen">
        <ProfilePage name={session.user.name} />
        {/* BeaverHacks Logo */}
        {/* <div>
          <Image 
            src="/images/beaver.png" 
            width={150} 
            height={150} 
            alt="Beaver mascot" 
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div> */}
      </div>
    </>
  )
}