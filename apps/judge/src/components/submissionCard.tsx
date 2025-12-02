"use client";

// import { Tag } from "lucide-react";
import Image from "next/image";
import { ProjectLinks } from "@/components/projectLinks";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";

// Define a type for the data this card needs
type Submission = {
	id: string;
	name: string;
	images?: string[];
	tagline?: string;
	githubUrl?: string | null;
	videoUrl?: string | null;
	// submissionTracks?: { track: { name: string } }[];
};

interface SubmissionCardProps {
	submission: Submission;
	index: number;
	onClick: () => void;
	showOpenButton: boolean;
}

export default function SubmissionCard({
	submission,
	onClick,
	index,
	showOpenButton,
}: SubmissionCardProps) {
	const img = submission.images?.[0] || "/beaver.png";

	return (
		<Card
			className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-2 border-neutral-800 bg-neutral-900/60 backdrop-blur transition hover:border-orange-500/50 hover:bg-neutral-900 hover:shadow-lg hover:shadow-orange-500/10 supports-[backdrop-filter]:bg-neutral-900/50"
			onClick={onClick}
		>
			{/* Top Section: Title and Badges */}
			<CardHeader className="p-1">
				<CardTitle className="line-clamp-2 font-bold text-lg text-white leading-snug">
					{submission.name}
				</CardTitle>
				{/* {submission.submissionTracks && submission.submissionTracks.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{submission.submissionTracks.map(
							({ track }: { track: { name: string } }) => (
								<span
									key={track.name}
									className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300 uppercase tracking-wide"
								>
									<Tag className="h-3 w-3" />
									{track.name}
								</span>
							),
						)}
					</div>
				)} */}
			</CardHeader>

			{/* Middle Section: Image */}
			<div className="relative aspect-video w-full">
				<Image
					src={img}
					alt={`${submission.name} cover`}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover transition duration-500 group-hover:scale-[1.03]"
					priority={index < 7}
				/>
			</div>

			{/* Bottom Section: Description and Links */}
			<CardContent className="flex-grow px-2 pt-1 pb-0">
				{submission.tagline && (
					<CardDescription className="line-clamp-2 text-neutral-400 text-sm">
						{submission.tagline}
					</CardDescription>
				)}
			</CardContent>
			<CardFooter className="p-2">
				<div className="flex w-full items-center justify-between gap-3">
					<ProjectLinks
						githubURL={submission.githubUrl ?? null}
						ytVideo={submission.videoUrl ?? null}
					/>
					{showOpenButton && (
						<button
							type="button"
							className="ml-auto inline-flex items-center rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-200 text-xs transition hover:cursor-pointer hover:border-orange-500/50 hover:bg-neutral-800"
							onClick={(e) => {
								e.stopPropagation();
								onClick();
							}}
						>
							Open →
						</button>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
