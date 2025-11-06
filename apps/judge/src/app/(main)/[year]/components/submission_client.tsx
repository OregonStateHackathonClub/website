"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { MultiSelect, MultiSelectOption } from "@/components/multi-select";

import SubmissionCard from "@/components/submissionCard";
import Image from "next/image";
import Link from "next/link";

// Define specific types for your data
interface Track {
	id: string;
	name: string;
}

interface Submission {
	id: string;
	name: string;
	images?: string[];
	tagline?: string;
	githubUrl?: string | null;
	videoUrl?: string | null;
	tracks?: { id: string; name: string } [];
}

interface Hackathon {
	submissions: Submission[];
	bannerImage?: string;
	sponsorLogos?: string[];
}

interface SubmissionsClientProps {
	hackathon: Hackathon;
	tracks: Track[];
	year: string;
	userTeamId?: string | null;
	teamSubmission?: { id: string; /*status: string  removed this*/ } | null;
}
const sponsors = [
	{
		href: "https://acm.oregonstate.edu/",
		src: "https://beaverhacks.org/images/acmlogo.svg",
		alt: "ACM OSU",
	},
	{
		href: "https://www.osuappdev.club/",
		src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fappdev.png&w=256&q=75",
		alt: "App Development Club",
	},
	{
		href: "https://gdgc-osu.com/",
		src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fgdgc.png&w=256&q=75",
		alt: "Google Developer Group on Campus",
	},
	{
		href: "https://org.osu.edu/womenincyber/",
		src: "https://beaverhacks.org/_next/image?url=%2Fimages%2Fwicys.png&w=256&q=75",
		alt: "Women in Cybersecurity",
	},
];

export default function SubmissionsClient({
	hackathon,
	tracks,
	year,
	userTeamId = null,
	teamSubmission = null,
}: SubmissionsClientProps) {
	const [selectedTracks, setSelectedTracks] = useState<string[]>(["all"]);
	const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
		hackathon.submissions,
	);
	const router = useRouter();

	useEffect(() => {
		if (selectedTracks.length === 0 || selectedTracks.includes("all")) {
			setFilteredSubmissions(hackathon.submissions);
		} else {
			const filtered = hackathon.submissions.filter((submission: Submission) =>
				selectedTracks.some((selected) =>
					submission.tracks?.some((link) => String(link.id) === String(selected))
				),
			);
			setFilteredSubmissions(filtered);
		}
	}, [selectedTracks, hackathon.submissions]);

	const handleProjectClick = (submissionId: string) => {
		router.push(`/${year}/projects/${submissionId}`);
	};

	return (
		<div className="min-h-screen text-neutral-200">
			{/* ====== HERO / TITLE BANNER ====== */}
			<div
				className="relative isolate overflow-hidden"
				style={{
					backgroundImage: `linear-gradient(to bottom, rgba(10,10,10,.00), rgba(10,10,10,.00)), url(${
						hackathon?.bannerImage || "/hero-dark-texture.jpg"
					})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8">
					<div className="flex flex-col items-center gap-4 text-center">
						<span className="inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-neutral-300 text-s tracking-wide">
							Oregon State University
						</span>
						<h1 className="bg-gradient-to-r from-white via-orange-100 to-orange-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-sm sm:text-5xl md:text-6xl">							BeaverHacks {year}
						</h1>
						<p className="max-w-2xl text-neutral-300 text-sm sm:text-base">
							Explore projects, filter by track, and discover this year’s
							builds.
						</p>
					</div>

					{/* Sponsors (per year) */}
					<div className="mt-12">
						<div className="mx-auto max-w-5xl">
							<div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6">
								<p className="mb-4 text-center text-neutral-400 text-s tracking-wide">
									Sponsors
								</p>
								<div className="grid grid-cols-2 items-center justify-center gap-6 sm:grid-cols-4">
									{sponsors.map((sponsor) => (
									<a
										key={sponsor.alt}
										href={sponsor.href}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-center opacity-80 transition hover:scale-102 hover:opacity-100"
									>
										<Image
											src={sponsor.src}
											alt={sponsor.alt}
											width={100}
											height={40}
											className="object-contain"
										/>
									</a>									))}
								</div>
							</div>
						</div>
					</div>
				</div>
				
			</div>

			{/* ====== CONTENT ====== */}
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
				{/* Quick actions / filter */}
				<div className="mb-8 flex flex-wrap items-center justify-center gap-4">
					{/* Connected Filter Button */}
					<div className="inline-flex items-center rounded-xl border border-neutral-700 bg-neutral-800/50 text-sm text-neutral-200 transition-colors hover:border-neutral-600">
						<div className="flex items-center gap-2 px-4 py-2">
							<Filter className="h-4 w-4" />
							<span className="whitespace-nowrap">Filter by track:</span>
						</div>
						<div className="h-5 w-px bg-neutral-700 hover:cursor-pointer"></div>
						<MultiSelect
							options={[
								{ label: "All Tracks", value: "all" },
								...tracks.map((track) => ({
									label: track.name,
									value: track.id,
								})),
							]}
							onValueChange={(values) => {
								setSelectedTracks(values.length === 0 ? ["all"] : values);
							}}
							defaultValue={["all"]}
							placeholder="Select..."
							className="h-10 min-w-[140px] !border-0 !bg-transparent px-3 py-2 text-sm !shadow-none hover:!bg-transparent focus:!ring-0 focus:!ring-offset-0"                            />
					</div>

					{/* Action Buttons */}
					{userTeamId ? (
						<div className="flex flex-wrap gap-3">                              
							<Link
								href={`/${year}/team/${userTeamId}`}
								className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-sm text-white transition hover:bg-orange-300 hover:text-black"
							>
								Go to Your Team
							</Link>
							{!teamSubmission && (
								<Link
									href={`/${year}/submission?teamId=${userTeamId}`}
									className="rounded-xl border border-orange-500/40 bg-neutral-900/60 px-4 py-2 font-semibold text-orange-300 text-sm transition hover:border-orange-400 hover:text-white"
								>
									Create Submission
								</Link>
							)}
							{teamSubmission && (
								<>
									{/* {teamSubmission.status === "submitted" && ( */}
										{/* <Link
											href={`/${year}/projects/${teamSubmission.id}`}
											className="rounded-xl border border-green-500/40 bg-neutral-900/60 px-4 py-2 font-semibold text-green-300 text-sm transition hover:border-green-400 hover:text-white"
										>
											View Submission
										</Link> */}
									{/* )} */}
									<Link
										href={`/${year}/submission?edit=${teamSubmission.id}`}
										className="rounded-xl border border-orange-500/40 bg-neutral-900/60 px-4 py-2 font-semibold text-orange-300 text-sm transition hover:border-orange-400 hover:text-white"
									>
										Edit
									</Link>
								</>
							)}
						</div>
					) : (
						<div className="flex gap-3">
							<Link
								href={`/${year}/create-team`}
								className="rounded-xl bg-orange-500 px-4 py-2 font-semibold text-sm text-white transition hover:bg-orange-300 hover:text-black"
							>
								Create a Team
							</Link>
							<Link
								href={`/${year}/find-team`}
								className="rounded-xl border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-neutral-200 text-sm transition hover:border-neutral-600"
							>
								Find a Team
							</Link>
						</div>
					)}
				</div>

				{/* Submissions grid */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
					{filteredSubmissions.map((submission: Submission, index: number) => (
						<SubmissionCard
							key={submission.id}
							submission={submission}
							index={index}
							showOpenButton={true}
							onClick={() => handleProjectClick(submission.id)}
						/>
					))}
				</div>

				{/* No results */}
				{filteredSubmissions.length === 0 && (
					<div className="py-24 text-center text-neutral-400">
						No submissions found for the selected track.
					</div>
				)}

				{/* Footer note / patterns hook */}
				<div className="mt-12 text-center text-neutral-500 text-xs">
					Interested in becoming a sponsor? Contact us at
					sponsor@beaverhacks.org
				</div>
			</div>
		</div>
	);
}
