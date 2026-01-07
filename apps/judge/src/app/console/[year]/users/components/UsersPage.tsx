"use client";
import { userSearch, UserSearchResult } from "@/app/actions/user";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@repo/ui/components/dropdown-menu";
import { toast } from "sonner";
import { JudgeRole, UserRole } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import UserOuterSheet from "./UserOuterSheet";
import InfoTooltip from "./InfoTooltip";
import Pages from "./Pages";
import AddDialog from "./AddDialog";

export default function UsersPage({ hackathonId }: { hackathonId: string }) {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserSearchResult>();
	
	const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);

	const [adminPage, setAdminPage] = useState(1);
	const [managerPage, setManagerPage] = useState(1);
	const [judgePage, setJudgePage] = useState(1);
	const [userPage, setUserPage] = useState(1);

	const filteredUsers = useMemo(() => {
		if (!debouncedSearch) return allUsers;
		const q = debouncedSearch.toLowerCase();

		return allUsers.filter(u =>
			u.name.toLowerCase().includes(q) ||
			u.email.toLowerCase().includes(q)
		);
	}, [allUsers, debouncedSearch]);

	const admins = filteredUsers.filter(u => u.role === UserRole.ADMIN);
	const judges = filteredUsers.filter(u =>
		u.hackathonParticipants.some(p => p.judge?.role === JudgeRole.JUDGE)
	);
	const managers = filteredUsers.filter(u =>
		u.hackathonParticipants.some(p => p.judge?.role === JudgeRole.MANAGER)
	);
	const users = hackathonId
		? filteredUsers.filter(u =>
			!u.hackathonParticipants.some(p =>
				p.judge?.role === JudgeRole.JUDGE ||
				p.judge?.role === JudgeRole.MANAGER
			)
		)
		: filteredUsers.filter(u => u.role === UserRole.USER);

	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
	if (debounceRef.current) {
		clearTimeout(debounceRef.current);
	}

	debounceRef.current = setTimeout(() => {
		setDebouncedSearch(search);
	}, 400);

	return () => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
	};
	}, [search]);

	useEffect(() => {
		const fetchUsers = async () => {
			const allUsersResult = await userSearch("", hackathonId);
			if (allUsersResult) setAllUsers(allUsersResult);
		}
		fetchUsers();
	}, [hackathonId]);

	async function copyString(toCopy: string) {
		try {
			await navigator.clipboard.writeText(toCopy);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Failed to copy text");
		}
	}
	
	function Users({
		list,
		page,
		setPage,
	}: {
		list: UserSearchResult[];
		page: number;
		setPage: React.Dispatch<React.SetStateAction<number>>;
	}) {
		const entriesPerPage = 25;
		const totalPages = Math.ceil(list.length / entriesPerPage);

		const startIndex = (page - 1) * entriesPerPage;
		const endIndex = startIndex + entriesPerPage;
		const currentEntries = list.slice(startIndex, endIndex);

		return (
			<div>
				<div className="grid gap-2">
					{currentEntries.map((user) => {
						return (
							<div key={user.id}>
								<div className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-sm">
									<div>
										<h3 className="font-semibold text-gray-100">{user.name}</h3>
										<p className="text-xs">{user.email}</p>
									</div>
									<div className="flex gap-5">
										<Button
											variant="outline"
											className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
											onClick={() => {
												setCurrentUser(user)
												setIsSheetOpen(true)
											}}
										>
											Edit
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
													onClick={() => toast.error("Not yet implemented")}
												>
													<ChevronDown />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem onClick={() => copyString(user.id)}> Copy User ID</DropdownMenuItem>
												{ list === judges &&
													<DropdownMenuItem onClick={() => toast.error("Not yet implemented")}> Regenerate Invite Link</DropdownMenuItem>
												}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<Pages totalPages={totalPages} page={page} setPage={setPage} />
			</div>
		);
	}

	return (
		<>
			{
				currentUser &&
				<UserOuterSheet
					currentUser={currentUser}
					hackathonId={hackathonId}
					setAllUsers={setAllUsers}
					isSheetOpen={isSheetOpen}
					setIsSheetOpen={setIsSheetOpen}
				/>
			}
			<div className="mx-auto w-full max-w-3xl py-10">
				<div className="flex justify-center">
					<div className="font-bold text-3xl">Users</div>
				</div>
				<div>
					<input
						type="text"
						placeholder="Search..."
						className="mb-2 w-75 cursor-text rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				{
					hackathonId ?
					<div>
						<div className="flex w-full justify-between items-center my-5">
							<div>
								Managers
							</div>
							<InfoTooltip>
								<strong>Managers can:</strong>
								<ul className="list-disc list-inside">
									<li>Add/Remove judges from this hackathon</li>
									<li>Modify this hackathon&apos;s information</li>
									<li>Add/Modify/Remove teams & hackathon participants from this hackathon</li>
									<li>Judge hackathon submissions</li>
								</ul>
							</InfoTooltip>
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
							<AddDialog role={JudgeRole.MANAGER} hackathonId={hackathonId} search={search} setSearch={setSearch} filteredUsers={filteredUsers} setAllUsers={setAllUsers} />
						</div>
						{users ? <Users list={managers} page={managerPage} setPage={setManagerPage} /> : <div>Loading...</div>}

						<div className="flex w-full justify-between items-center my-5">
							<div>
								Judges
							</div>
							<InfoTooltip>
								<strong>Judges can:</strong>
								<ul className="list-disc list-inside">
									<li>Judge hackathon submissions</li>
									<li>Modify their own judging rubric</li>
								</ul>
							</InfoTooltip>
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
							<AddDialog role={JudgeRole.JUDGE} hackathonId={hackathonId} search={search} setSearch={setSearch} filteredUsers={filteredUsers} setAllUsers={setAllUsers} />
						</div>
						{users ? <Users list={judges} page={judgePage} setPage={setJudgePage} /> : <div>Loading...</div>}

						<div className="flex w-full justify-between items-center my-5">
							<div>
								Users
							</div>
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
							<AddDialog role={null} hackathonId={hackathonId} search={search} setSearch={setSearch} filteredUsers={filteredUsers} setAllUsers={setAllUsers} />
						</div>
						{users ? <Users list={users} page={userPage} setPage={setUserPage} /> : <div>Loading...</div>}
					</div>
					:
					<div>
						<div className="flex w-full justify-between items-center my-5">
							<div>
								Admins
							</div>
							<InfoTooltip>
								<strong>Admins can:</strong>
								<ul className="list-disc list-inside">
									<li>Add/Modify/Remove Hackathons</li>
									<li>Add/Remove admins, managers, and judges</li>
									<li>Modify/Delete Users</li>
								</ul>
							</InfoTooltip>
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						</div>
						{users ? <Users list={admins} page={adminPage} setPage={setAdminPage} /> : <div>Loading...</div>}
						<div className="flex w-full justify-between items-center my-5">
							<div>
								Users
							</div>
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						</div>
						{users ? <Users list={users} page={userPage} setPage={setUserPage} /> : <div>Loading...</div>}
					</div>
				}
			</div>
		</>
	);
}
