import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegsiterForm from "@/components/ui/register-form";

export default async function Register() {
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
                <Link href="../profile">
                    <button className="py-2 px-6 border rounded-lg hover:cursor-pointer hover:border-gray-500 transition duration-200">Dashboard</button>
                </Link>
            </nav>
            <div className="flex justify-center items-center flex-col w-[75%] h-screen m-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Register to <span className="bg-gradient-to-r from-red-500 to-orange-500 inline-block text-transparent bg-clip-text">BeaverHacks</span></CardTitle>
                        <CardDescription>
                            Apply to the hackathon by filling in the required information below
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            <RegsiterForm />
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}