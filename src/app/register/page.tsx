import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegsiterForm from "@/components/ui/register-form";

export default async function Register() {

    const registrationOpen = true;

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

    if (!registrationOpen) {
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
                    <Link href="../profile">
                        <button className="py-2 px-6 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">Dashboard</button>
                    </Link>
                </nav>
                <p className="w-screen h-screen flex items-center justify-center">BeaverHacks 2026 applications are not open yet! Check back soon.</p>
            </>
        )
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
                <Link href="../profile">
                    <button className="py-2 px-6 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">Dashboard</button>
                </Link>
            </nav>
            <div className="h-screen w-[80%] m-auto lg:w-screen pt-20 flex items-center flex-col text-center md:text-left">
                <div className="h-full flex justify-center items-center">
                    <div>
                        <CardTitle><span className="text-xl bg-gradient-to-r from-red-500 to-orange-500 inline-block text-transparent bg-clip-text">BeaverHacks</span> <span className="text-xl">Registration Form</span></CardTitle>
                        <p className="text-xs md:text-sm text-gray-400 break-normal pt-3">Note: You must be 18+ years old to participate in BeaverHacks 2026. Failure to comply with this standard will result in the hacker's immediate suspension from attending the event.</p>
                        <div className="mt-8">
                            <RegsiterForm />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}