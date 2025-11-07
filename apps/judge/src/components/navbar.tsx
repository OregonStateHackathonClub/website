import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentHackathonId } from "@/lib/queries";
import LoginLogoutButton from "./loginLogoutButton";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-neutral-800 bg-neutral-900/75 px-4 backdrop-blur-lg md:px-8">
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
        className="group flex items-center gap-5 p-5"
    >
        <div className="relative h-10 w-10">
            {/* 1. The default gradient image (bottom layer) */}
            <Image
                src="/beaverhacks_gradient.png"
                alt="BeaverHacks Gradient Logo"
                fill
                className="transition-opacity duration-300 ease-in-out"
            />
            {/* 2. The white hover image (top layer) */}
            <Image
                src="/beaverhacks_white.png"
                alt="BeaverHacks White Logo"
                fill
                className="opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"
            />
        </div>
        <h1>BeaverHacks Official Judging Platform</h1>
    </Link>
);