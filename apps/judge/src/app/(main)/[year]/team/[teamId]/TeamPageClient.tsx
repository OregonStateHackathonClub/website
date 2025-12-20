"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { isTeamMember } from "@/app/actions/auth"; 
import {
	getInviteCode,
	getTeamInfo,
	removeUserFromTeam,
	resetInviteCode,
	updateTeam,
} from "@/app/actions/team";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/popover";
import { Textarea } from "@repo/ui/components/textarea";
import { authClient } from "@repo/auth/client";

const formSchema = z.object({
	name: z.string().min(4),
	lookingForTeammates: z.boolean().optional(),
	contact: z.string().optional(),
	description: z.string().optional(),
});

type TeamInfo = {
	id: string;
	name: string;
	description: string | null;
	contact: string | null;
	lookingForTeammates: boolean;
	creatorId: string | null;
	members: TeamUser[];
};

type TeamUser = {
	id: string;
	participant: {
		user: {
			id: string;
			name: string;
		};
	} | null;
};

export default function TeamPageClient({
	teamId,
	year,
	teamMember,
}: {
	teamId: string;
	year: string;
	teamMember: boolean;
}) {
	const [editing, setEditing] = useState(false);
	const [team, setTeam] = useState<TeamInfo | null>(null);
	const [inviteCode, setInviteCode] = useState("");
	const [copied, setCopied] = useState(false);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	const router = useRouter();
	const { data: session } = authClient.useSession();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "" },
	});

	useEffect(() => {
		const fetchTeam = async () => {
			try {
				const updatedTeam = await getTeamInfo(teamId);
				if (!updatedTeam) {
					// Cope with your failures
					toast.error("Failed to find team");
					return false;
				}
				setTeam(updatedTeam);
				form.reset({
					name: updatedTeam.name,
					contact: updatedTeam.contact ?? "",
					description: updatedTeam.description ?? "",
					lookingForTeammates: updatedTeam.lookingForTeammates,
				});
			} catch (error) {
				console.log(`Error fetching team: ${error}`);
			} finally {
				setLoading(false);
			}
		};
		const fetchInvite = async () => {
			const code = await getInviteCode(teamId);
			if (code) setInviteCode(code);
		};
		fetchTeam();
		fetchInvite();
	}, [teamId, form]);

	const getLink = useCallback(
		() =>
			inviteCode === ""
				? "Generating..."
				: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${year}/invite/${inviteCode}`,
		[year, inviteCode],
	);

	const copyLink = async () => {
		await navigator.clipboard.writeText(getLink());
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const res = await updateTeam(teamId, values);
		if (res) {
			const updatedTeam = await getTeamInfo(teamId);
			setTeam(updatedTeam);
			setEditing(false);
		}
	};

	const removeUser = async (teamMemberId: string) => {
		const result = await removeUserFromTeam(teamMemberId, teamId);
		if (result) {
			setTeam((prevTeam) => {
				if (!prevTeam) return prevTeam;
				return {
					...prevTeam,
					users: prevTeam.members.filter(
						(u) => u.id !== teamMemberId,
					),
				};
			});

			if (!(await getTeamInfo(teamId))) {
				router.push("/");
			}

			if (!(await isTeamMember(teamId))) {
				window.location.reload();
			}
		}
	};

	if (!team)
		return (
			<>
				{loading ? (
					<div className="py-10 text-center">Loading Team...</div>
				) : (
					<div className="py-10 text-center">Team Not Found.</div>
				)}
			</>
		);

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 py-10">
			{/* Team Header */}
			<div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-md">
				<div>
					<h1 className="font-bold text-3xl">{team.name}</h1>
					{team.lookingForTeammates && (
						<span className="mt-1 inline-block font-medium text-green-600">
							Looking for teammates ✔
						</span>
					)}
				</div>
				{teamMember && !editing && (
					<Button
						variant="outline"
						className="rounded-xl"
						onClick={() => setEditing(true)}
					>
						Edit
					</Button>
				)}
			</div>

			{/* --- View Mode --- */}
			{!editing && (
				<>
					{/* Team Description */}
					{team.description && (
						<div className="rounded-xl bg-white p-6 shadow-md">
							<h2 className="mb-2 font-semibold text-xl">Description</h2>
							<p className="text-gray-700">{team.description}</p>
						</div>
					)}

					{/* Members */}
					<div className="rounded-xl bg-white p-6 shadow-md">
						<h2 className="mb-2 font-semibold text-xl">Members</h2>
						<ul className="space-y-2">
							{team.members.map((u) => (
								<li
									key={u.id}
									className="flex items-center justify-between"
								>
									<span className="flex gap-2">
										{u.participant?.user.name}

										{teamMember && u.id === team.creatorId && (
											<Image
												src="/crown.png"
												alt="Team leader"
												width={20}
												height={20}
											/>
										)}
									</span>

									{session?.user.id === u.id && (
										<Image
											src="/leave-red.png"
											alt="Leave team"
											width={20}
											height={20}
											className="cursor-pointer"
											onClick={() => removeUser(u.id)}
										/>
									)}

									{session?.user.id === team.creatorId &&
										session?.user.id !== u.id && (
											<Image
												src="/trashcan-red.png"
												alt="Remove user"
												width={20}
												height={20}
												className="cursor-pointer"
												onClick={() => removeUser(u.id)}
											/>
										)}
								</li>
							))}
						</ul>

						{/* Invite Link */}
						{team.members.length < 4 && teamMember && (
							<Popover open={open} onOpenChange={setOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" className="mt-4 w-full rounded-xl">
										+ Add Teammates
									</Button>
								</PopoverTrigger>
								<PopoverContent className="relative w-80">
									<button
										type="button"
										className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded hover:bg-gray-200"
										onClick={async () => {
											if (inviteCode === "") return;

											setInviteCode("");
											const success = await resetInviteCode(inviteCode);
											if (success) {
												const code = await getInviteCode(teamId);
												if (code) setInviteCode(code);
											} else {
												toast.error("Failed to remove invite.");
											}
										}}
									>
										<span className="text-2xl">&#10227;</span>
									</button>

									<p className="mb-2 text-sm">
										Send this invite link to friends:
									</p>
									<div className="flex gap-2">
										<input
											type="text"
											value={getLink()}
											readOnly
											className="flex-1 rounded border px-2 py-1"
										/>
										<Button size="sm" onClick={copyLink}>
											{copied ? "Copied!" : "Copy"}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						)}
					</div>

					{/* Contact Info */}
					{team.contact && (
						<div className="rounded-xl bg-white p-6 shadow-md">
							<h2 className="mb-2 font-semibold text-xl">Contact</h2>
							<p>{team.contact}</p>
						</div>
					)}
				</>
			)}

			{/* --- Edit Mode --- */}
			{editing && (
				<div className="rounded-xl bg-white p-6 shadow-md">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(async (values) => {
								setLoading(true);
								try {
									await onSubmit(values);
								} finally {
									setLoading(false);
								}
							})}
							className="space-y-6"
						>
							{/* Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Team Name</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Team Name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Looking for teammates */}
							<FormField
								control={form.control}
								name="lookingForTeammates"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
										<FormLabel>Looking for teammates</FormLabel>
									</FormItem>
								)}
							/>

							{/* Contact */}
							<FormField
								control={form.control}
								name="contact"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Email" />
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Description */}
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea {...field} placeholder="Brief description..." />
										</FormControl>
									</FormItem>
								)}
							/>

							{/* Actions */}
							<div className="flex gap-4">
								<Button
									type="submit"
									className="rounded-xl bg-green-500 hover:bg-green-600"
									disabled={loading}
								>
									<span className="inline-flex min-w-[90px] items-center justify-center">
										{loading ? (
											<Loader2 size={16} className="animate-spin" />
										) : (
											"Update Team"
										)}
									</span>
								</Button>
								<Button
									type="button"
									className="rounded-xl bg-gray-300 hover:bg-gray-300"
									onClick={() => setEditing(false)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Form>
				</div>
			)}
		</div>
	);
}
