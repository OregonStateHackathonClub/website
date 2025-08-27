"use client"

import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginForm() {
    
    const router = useRouter();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("");
    const [emailFormState, setEmailFormState] = useState(0)
    const [passwordFormState, setPasswordFormState] = useState(0)

    async function handleSubmit (event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        const userEmail = String(email);
        if (!userEmail) return toast.error("Please enter your email.");

        const userPassword = String(password);
        if (!userPassword) return toast.error("Please enter your password.");

        await signIn.email(
            {
                email,
                password
            },
            {
                onRequest: () => {
                    // to be continued
                },
                onResponse: () => {
                    // to be continued
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
                onSuccess: () => {
                    toast.message("Signed in successfully!")
                    router.push("/profile")
                }
            }
        )

    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-3">
                {emailFormState === 0 ?
                    <div className="relative">
                        <input
                        type="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailFormState(1);
                        }}
                        className="peer w-full bg-transparent text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-200 shadow-sm"/>
                        <label className="absolute cursor-text bg-transparent peer-focus:bg-black px-1 left-2.5 top-2.5 rounded-md text-gray-500 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-200 peer-focus:scale-90 focus:-top-2 focus:left-2.5 focus:text-xs focus:text-slate-200 focus:scale-90">
                            Enter email
                        </label>
                    </div>
                :
                    <div className="relative">
                        <input
                        type="email"
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (e.target.value.length == 0) {
                                setEmailFormState(0)
                            }
                        }}
                        className="peer w-full bg-transparent text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none border-slate-200 shadow-sm"/>
                        <label className="absolute cursor-text bg-black px-1 rounded-md  transition-all transform origin-left -top-2 left-2.5 text-xs text-slate-200 scale-90">
                            Enter email
                        </label>
                    </div>
                }

                {passwordFormState === 0 ?
                    <div className="relative">
                        <input
                        type="password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordFormState(1);
                        }}
                        className="peer w-full bg-transparent text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-200 shadow-sm"/>
                            <label className="absolute cursor-text bg-transparent peer-focus:bg-black px-1 left-2.5 top-2.5 rounded-md text-gray-500 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-200 peer-focus:scale-90 focus:-top-2 focus:left-2.5 focus:text-xs focus:text-slate-200 focus:scale-90">
                                Enter password
                            </label>
                    </div>
                :
                    <div className="relative">
                        <input
                        type="password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (e.target.value.length == 0) {
                                setPasswordFormState(0)
                            }
                        }}
                        className="peer w-full bg-transparent text-sm border rounded-md px-3 py-2 transition duration-300 ease focus:outline-none border-slate-200 shadow-sm"/>
                            <label className="absolute cursor-text bg-black px-1 rounded-md  transition-all transform origin-left -top-2 left-2.5 text-xs text-slate-200 scale-90">
                                Enter password
                            </label>
                    </div>
                }
            </div>
            <div className="mt-5 border rounded-md w-[35%] mx-auto text-center px-2 py-2 bg-background shadow-sm hover:bg-accent hover:cursor-pointer hover:text-accent-foreground transition-all duration-200">
                <button className="text-white" type="submit">Log In</button>
            </div>
            <div className="mt-5">
                <p>Don't have an account? <button onClick={(e) => {
                        e.preventDefault();
                        router.push("/apply")
                    }} className="text-blue-500 hover:text-purple-500 transition-all duration-200">Create one here.</button></p>
            </div>
        </form> 
    )
}