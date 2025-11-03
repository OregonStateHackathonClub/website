import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentHackathonId } from "@/lib/queries";
import LoginLogoutButton from "./loginLogoutButton";

export const Navbar = () => {
	return (
		<div className="flex h-20 items-center justify-between bg-gray-100 px-8">
			<Suspense fallback={<HackathonHomepageButton />}>
				<HackathonHomepageButtonWrapper />
			</Suspense>
			<LoginLogoutButton />
		</div>
	);
};

const HackathonHomepageButtonWrapper = async () => {
	const currentHackathonId = await getCurrentHackathonId();

	return <HackathonHomepageButton link={`/${currentHackathonId}`} />;
};

const HackathonHomepageButton = ({ link = "/" }: { link?: string }) => (
	<Link
		href={{ pathname: link }}
		className="flex items-center gap-5 p-5 hover:bg-gray-200"
	>
		<div className="relative h-10 w-10">
			<Image src="/beaver.png" alt="beaver" fill />
		</div>
		<h1>BeaverHacks Official Judging Platform</h1>
	</Link>
);
