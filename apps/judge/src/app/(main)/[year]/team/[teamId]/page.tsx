import { Suspense } from "react";
import { isTeamMember } from "@/app/actions";
import TeamPageClient from "./TeamPageClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function TeamLoader({ year, teamId }: { year: string; teamId: string }) {
    const teamMember = await isTeamMember(teamId);
    return <TeamPageClient year={year} teamId={teamId} teamMember={teamMember} />;
}

export default async function Page({
    params,
}: {
    params: Promise<{ year: string; teamId: string }>;
}) {
    const { year, teamId } = await params;

    return (
        <div className="min-h-screen text-neutral-200">
            <header className="border-neutral-800 border-b bg-neutral-900/60 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
                    <Link
                        href={`/${year}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-300 text-sm transition hover:border-orange-500/50 hover:text-orange-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {year} Projects
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-10">
                <Suspense fallback={<div className="text-center py-10 text-neutral-400">Loading Team...</div>}>
                    <TeamLoader year={year} teamId={teamId} />
                </Suspense>
            </main>
        </div>
    );
}