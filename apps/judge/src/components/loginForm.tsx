"use client";

import { Github, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@repo/ui/components/card";
import { signIn } from "@repo/auth/client";
import { Field } from "./field"; // Import the new Field component

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission (page reload)
        setError(null); // Clear previous errors on a new attempt

        // 1. Client-side validation for immediate feedback
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // 2. Call your authentication library
        await signIn.email(
            { email, password },
            {
                onRequest: () => setLoading(true),
                onResponse: () => setLoading(false),
                onSuccess: async () => router.push("/"),
                // 3. Handle and display errors from the server
                onError: (ctx) => {
                    setError(ctx.error.message || "An unknown error occurred.");
                },
            },
        );
    };

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Converted to a <form> with an onSubmit handler */}
                <form className="grid gap-4" onSubmit={handleEmailLogin}>
                    <Field
                        label="Email"
                        type="email"
                        placeholder="BennyDaBeaver@example.com"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        onKeyDown={() => setError(null)} // Clear error when user types
                    />
                    <Field
                        label="Password"
                        type="password"
                        placeholder="password"
                        autoComplete="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={() => setError(null)} // Clear error when user types
                    />

                    {/* Conditionally render the error message */}
                    {error && <p className="text-center text-red-500 text-sm">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full bg-orange-500  hover:bg-orange-300 hover:cursor-pointer text-white hover:text-black"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <p>Login</p>
                        )}
                    </Button>
                </form>

                {/* Separator */}
                <div className="relative mt-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-gray-700 border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* GitHub Sign-In Button */}
                <Button
                    variant="outline"
                    className="w-full mt-4 group transition-colors duration-200 hover:border-blue-500 hover:bg-blue-500/10 hover:cursor-pointer"
                    onClick={() => signIn.social({ provider: "github" })}
                >
                    <Github className="mr-2 h-4 w-4 text-neutral-200 transition-colors duration-200 group-hover:text-blue-500" />
                    <span className="transition-colors duration-200 group-hover:text-blue-500">
                        GitHub
                    </span>
                </Button>
            </CardContent>
        </Card>
    );
}