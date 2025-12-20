import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth";

async function logout() {
  "use server";
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}

const Profile = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <AuthPage />;

  const user = session.user;

  const application = await prisma.application.findUnique({
    where: { userId: user.id },
  });

  if (!application) redirect("/apply");

  return (
    <>
      <nav className="fixed w-full flex justify-between items-center p-4 border-b z-10">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/images/beaver.png"
            width={40}
            height={40}
            className="w-10 h-10 sm:w-12 sm:h-12"
            alt="logo"
          />
          <div className="flex flex-col">
            <h1 className="text-lg uppercase font-bold sm:text-xl">
              BeaverHacks
            </h1>
            <p className="text-xs uppercase text-muted-foreground hidden sm:block">
              Oregon State University
            </p>
          </div>
        </Link>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Logout
          </Button>
        </form>
      </nav>

      <div className="flex flex-col w-screen h-screen items-center justify-center">
        <pre className="text-xs sm:text-base font-mono">
          {`
  ________________________________________
/                                         \\
|  Welcome back ${user.name}!              ${" ".repeat(Math.max(0, 10 - user.name.length))}|
|  Congrats, you have submitted your      |
|  application!                           |
\\_________________________________________/
                                  |  /
                                  | /
                                  |/`}
        </pre>
        <div>
          <Image
            src="/images/beaver.png"
            width={150}
            height={150}
            alt="Beaver mascot"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>
      </div>
    </>
  );
};

export default Profile;
