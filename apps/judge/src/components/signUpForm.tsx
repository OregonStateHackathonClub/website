"use client";

import { Github, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { createHackathonParticipant } from "@/app/actions/hackathonParticipant";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { signIn, signUp } from "@repo/auth/client";
import { Field } from "./field"; // Import the new Field component

export function SignUpForm() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleEmailSignUp = async (e: FormEvent) => {
		e.preventDefault();
		setError(null);

		// Client-side validation
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!passwordConfirmation
		) {
			setError("All fields are required.");
			return;
		}
		if (!/\S+@\S+\.\S+/.test(email)) {
			setError("Please enter a valid email address.");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}
		if (password !== passwordConfirmation) {
			setError("Passwords do not match.");
			return;
		}

		await signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`,
			image: "",
			callbackURL: "/",
			fetchOptions: {
				onResponse: () => setLoading(false),
				onRequest: () => setLoading(true),
				onError: (ctx) => {
					setError(ctx.error.message || "An unknown error occurred.");
				},
				onSuccess: async () => {
					const res = await createHackathonParticipant();
					if (res) {
						router.push("/");
					} else {
						setError("Failed to create user profile after sign up.");
					}
				},
			},
		});
	};

	return (
		<Card className="z-50 max-w-md rounded-md">
			<CardHeader>
				<CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
				<CardDescription className="text-xs md:text-sm">
					Enter your information to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4" onSubmit={handleEmailSignUp}>
					<div className="grid grid-cols-2 gap-4">
						<Field
							label="First name"
							placeholder="Benny"
							required
							onChange={(e) => setFirstName(e.target.value)}
							onKeyDown={() => setError(null)}
							value={firstName}
						/>
						<Field
							label="Last name"
							placeholder="Beaver"
							required
							onChange={(e) => setLastName(e.target.value)}
							onKeyDown={() => setError(null)}
							value={lastName}
						/>
					</div>
					<Field
						label="Email"
						type="email"
						placeholder="BennyDaBeaver@example.com"
						required
						onChange={(e) => setEmail(e.target.value)}
						onKeyDown={() => setError(null)}
						value={email}
					/>
					<Field
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={() => setError(null)}
						autoComplete="new-password"
						placeholder="Password"
					/>
					<Field
						label="Confirm Password"
						type="password"
						value={passwordConfirmation}
						onChange={(e) => setPasswordConfirmation(e.target.value)}
						onKeyDown={() => setError(null)}
						autoComplete="new-password"
						placeholder="Confirm Password"
					/>

					{error && <p className="text-center text-red-500 text-sm">{error}</p>}

					<Button
						type="submit"
						className="w-full bg-orange-500 hover:bg-orange-300"
						disabled={loading}
					>
						{loading ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							"Create an account"
						)}
					</Button>

					<div className="relative mt-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-gray-700 border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">
								Or sign up with
							</span>
						</div>
					</div>

					{/* GitHub Sign-Up Button */}
					<Button
						variant="outline"
						className="w-full"
						onClick={() =>
							signIn.social({ provider: "github", callbackURL: "/" })
						}
					>
						<Github className="mr-2 h-4 w-4" />
						GitHub
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
