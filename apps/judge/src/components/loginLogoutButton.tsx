"use client";

import Link from "next/link";
import { authClient, signOut } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";

// you could probably come up with a "better" name for this but this is searchable and obvious as to functionality
export default function LoginLogoutButton() {
	const { data: session } = authClient.useSession();

	if (session?.user) {
		return (
			<Button
				onClick={async () => {
					await signOut();
				}}
			>
				Sign Out
			</Button>
		);
	} else {
		return (
			<div>
				<Button asChild className="m-1 bg-orange-500 hover:bg-orange-300">
					<Link href="/log-in" className="flex items-center px-5">
						Login
					</Link>
				</Button>
				<Button asChild className="m-1 bg-orange-500 hover:bg-orange-300">
					<Link href="/sign-up" className="flex items-center px-5">
						Sign Up
					</Link>
				</Button>
			</div>
		);
	}
}
