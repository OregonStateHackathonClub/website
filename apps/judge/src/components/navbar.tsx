import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentHackathonId } from "@/lib/queries";
import LoginLogoutButton from "./loginLogoutButton";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/75 px-4 backdrop-blur-lg md:px-8">
            {/* This inner div constrains the content to your site's max-width and centers it */}
            <div className="flex h-16 w-full items-center justify-between max-w-7xl mx-auto">
                <Suspense fallback={<HackathonHomepageButton />}>
                    <HackathonHomepageButtonWrapper />
                </Suspense>
                <LoginLogoutButton />
            </div>
        </nav>
    );
};

const HackathonHomepageButtonWrapper = async () => {
    const currentHackathonId = await getCurrentHackathonId();

    return <HackathonHomepageButton link={`/${currentHackathonId}`} />;
};

const HackathonHomepageButton = ({ link = "/" }: { link?: string }) => (
    <Link
        href={{ pathname: link }}
        className="flex items-center gap-5 p-5"
    >
        <div className="relative h-10 w-10">
            <Image src="/beaverhacks_gradient.png" alt="beaver" fill />
        </div>
        <h1>BeaverHacks Official Judging Platform</h1>
    </Link>
);