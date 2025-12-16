import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "@repo/auth";

// Force dynamic rendering since this layout requires auth
export const dynamic = 'force-dynamic';

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await auth.api.getSession({ headers: await headers() });

	if (!user) {
		unauthorized();
	}

	return (
		<div className="flex min-h-dvh grow bg-zinc-900 text-zinc-50">
			{children}
		</div>
	);
}
