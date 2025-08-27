import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import React, { useState } from "react";
import LoginForm from "@/components/ui/login-form";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image"

export default async function Login() {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect("/profile")
  }

  return (
    <>
      <nav className="fixed w-full flex justify-between items-center p-4 border-b z-10">
        <Link href="/" className="flex items-center gap-4">
          <Image src="/images/beaver.png" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12" alt="logo"/>
          <div className="flex flex-col">
            <h1 className="text-lg uppercase font-bold sm:text-xl">
              BeaverHacks
            </h1>
            <p className="text-xs uppercase text-muted-foreground hidden sm:block">
              Oregon State University
            </p>
          </div>
        </Link>
      </nav>
      <div className="flex items-center justify-center w-screen h-screen max-w-[75%] mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back to <span className="bg-gradient-to-r from-red-500 to-orange-500 inline-block text-transparent bg-clip-text">BeaverHacks</span></CardTitle>
            <CardDescription>Please log into your account using personal credentials.</CardDescription>
          </CardHeader>
          {/* <CardContent>
          <Link href="/api/login">
            <div className="flex justify-center">
              <Button variant="outline">
                <FcGoogle />
                Sign in with Google
              </Button>
            </div>
          </Link>  
        </CardContent> */}
          <CardContent>
            <CardDescription>
              <LoginForm />
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </>
  );
}