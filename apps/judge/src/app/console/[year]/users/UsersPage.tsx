"use client";
import { createJudge, getJudgeType, removeUser, setJudgeType, setSuperadmin, userSearch, UserSearchResult } from "@/app/actions";
import React, { useCallback, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@repo/ui/components/pagination";
import { Button } from "@repo/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@repo/ui/components/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/sheet";
import { toast } from "sonner";
import { JudgeRole, UserRole } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";

export default function UsersPage({ hackathonId }: { hackathonId: string }) {
	const [search, setSearch] = useState("");

	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserSearchResult>();

	const [superadmins, setSuperadmins] = useState<UserSearchResult[]>([]);
	const [admins, setAdmins] = useState<UserSearchResult[]>([]);
	const [judges, setJudges] = useState<UserSearchResult[]>([]);
	const [users, setUsers] = useState<UserSearchResult[]>([]);
	const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);

	const [superadminPage, setSuperadminPage] = useState(1);
	const [adminPage, setAdminPage] = useState(1);
	const [judgePage, setJudgePage] = useState(1);
	const [userPage, setUserPage] = useState(1);
	const [allUserPage, setAllUserPage] = useState(1);

	const fetchUsers = useCallback(async () => {
		if (hackathonId) {
			const adminResult = await userSearch(search, hackathonId, JudgeRole.MANAGER);
			if (adminResult) setAdmins(adminResult);

			const judgeResult = await userSearch(search, hackathonId, JudgeRole.JUDGE);
			if (judgeResult) setJudges(judgeResult);

			const allUsersResult = await userSearch(search, hackathonId);
			if (allUsersResult) setAllUsers(allUsersResult);
		} else {
			const superAdminResult = await userSearch(search, "", UserRole.ADMIN);
			if (superAdminResult) setSuperadmins(superAdminResult);

			const usersResult = await userSearch(search, "", UserRole.USER);
			if (usersResult) setUsers(usersResult);
		}
	}, [search]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	async function copyString(toCopy: string) {
		try {
			await navigator.clipboard.writeText(toCopy);
			toast.success("Copied to clipboard");
		} catch (err) {
			toast.error("Failed to copy text");
		}
	}

	function getParticipant(user: UserSearchResult) {
		const participant = user.hackathonParticipants.find( (p) => p.hackathonId === hackathonId );
		return participant
	}

	async function deleteUser(judgeProfileId: string) {
		const res = await removeUser(judgeProfileId);
		if (!res) {
			toast.error("Failed to delete user.");
		}
	}

	async function modifySuperadmin(superAdminValue: boolean, judgeProfileId: string) {
		const res = await setSuperadmin(superAdminValue, judgeProfileId)
		if (res) {
			fetchUsers();
		} else {
			toast.error(`Failed to ${superAdminValue ? "add" : "remove"} superadmin.`);
		}
	}
	
	function Users({
		list,
		page,
		setList,
		setPage,
	}: {
		list: UserSearchResult[];
		page: number;
		setList: React.Dispatch<React.SetStateAction<UserSearchResult[]>>;
		setPage: React.Dispatch<React.SetStateAction<number>>;
	}) {
		const entriesPerPage = 5;
		const totalPages = Math.ceil(list.length / entriesPerPage);

		const startIndex = (page - 1) * entriesPerPage;
		const endIndex = startIndex + entriesPerPage;
		const currentEntries = list.slice(startIndex, endIndex);

		return (
			<div>
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetContent>
						{/* PUT COMPONENT HERE */}
						{/* <some component user={currentUser} > */}
						{
							currentUser &&
							<>
								<SheetHeader>
									<SheetTitle>{currentUser.name}</SheetTitle>
									<SheetDescription>
										Description -- Nothing here is implemented at the moment
									</SheetDescription>
								</SheetHeader>
								<div className="flex justify-between gap-2.5">
									<Label htmlFor={`${currentUser.id}-superadmin`} className="w-15 flex justify-end flex-1" >User</Label>
									<Switch
										id={`${currentUser.id}-superadmin`}
										checked={currentUser.role === UserRole.ADMIN}
										onCheckedChange={async (checked) => {
											await setSuperadmin(checked, currentUser.id)
											setCurrentUser(prev => {
												if (!prev) return prev

												return {
													...prev,
													role: checked ? UserRole.ADMIN : UserRole.USER
												}
											})
										}} />
									<Label htmlFor={`${currentUser.id}-superadmin`} className="flex-1" >Superadmin</Label>
								</div>
								<div className="flex justify-between gap-2.5">
									<Label htmlFor={`${currentUser.id}-judge-type`} className="w-15 flex justify-end flex-1" >Judge</Label>
									<Switch
										id={`${currentUser.id}-judge-type`}
										checked={ getParticipant(currentUser)?.judge?.role === JudgeRole.MANAGER }
										onCheckedChange={async (checked) => {
											const role = checked ? JudgeRole.MANAGER : JudgeRole.JUDGE

											const participant = getParticipant(currentUser)
											if (!participant) return

											if (!participant?.judge) {
												const judge = await createJudge(participant.id, role)

												if (judge) participant.judge = judge
												else return false
											}
											
											await setJudgeType(participant.judge.id, role)
											participant.judge.role = role
											
											const updatedUser = { ...currentUser }
											updatedUser.hackathonParticipants = currentUser.hackathonParticipants.map(p =>
												p.id === participant.id ? { ...participant } : p
											);
											setCurrentUser(updatedUser)
										}} />
									<Label htmlFor={`${currentUser.id}-judge-type`} className="flex-1" >Admin</Label>
								</div>

								<div className="flex justify-center">
									<Button variant={"destructive"} className="w-60">
										Delete Judge
									</Button>
								</div>

								<div className="flex justify-center">
									<Button variant={"destructive"} className="w-60">
										Delete Hackathon Participant
									</Button>
								</div>

								<div className="flex justify-center">
									<Button variant={"destructive"} className="w-60">
										Delete User
									</Button>
								</div>
							</>
						}

					</SheetContent>
				</Sheet>
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
												{ list == judges &&
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

	function Pages({
		totalPages,
		page,
		setPage,
	}: {
		totalPages: number;
		page: number;
		setPage: React.Dispatch<React.SetStateAction<number>>;
	}) {
		return (
			<Pagination className="pt-2">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							href="#"
							className="hover:bg-gray-800 hover:text-white"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						/>
					</PaginationItem>
					{Array.from({ length: totalPages }, (_, i) => i + 1)
						.filter((pageNum) => {
							if (pageNum === 1 || pageNum === totalPages) return true;
							if (Math.abs(pageNum - page) <= 2) return true;
							return false;
						})
						.map((pageNum, idx, arr) => {
							const prev = arr[idx - 1];
							const showEllipsis = prev && pageNum - prev > 1;

							return (
								<React.Fragment key={pageNum}>
									{showEllipsis && (
										<PaginationItem>
											<PaginationEllipsis />
										</PaginationItem>
									)}
									<PaginationItem>
										<PaginationLink
											onClick={() => setPage(pageNum)}
											className={`hover:bg-gray-800 hover:text-white ${
												page === pageNum
													? "border-gray-700 bg-gray-900 text-white"
													: ""
											}`}
											isActive={page === pageNum}
										>
											{pageNum}
										</PaginationLink>
									</PaginationItem>
								</React.Fragment>
							);
						})}

					<PaginationItem>
						<PaginationNext
							href="#"
							className="hover:bg-gray-800 hover:text-white"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		);
	}

	return (
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
							Admins
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						<Button
						variant={"outline"}
						className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
						onClick={() => toast.error("Not yet implemented")}>+</Button>
					</div>
					{users ? <Users list={admins} page={adminPage} setList={setAdmins} setPage={setAdminPage} /> : <div>Loading...</div>}

					<div className="flex w-full justify-between items-center my-5">
						<div>
							Judges
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						<Button
						variant={"outline"}
						className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
						onClick={() => toast.error("Not yet implemented")}>+</Button>
					</div>
					{users ? <Users list={judges} page={judgePage} setList={setJudges} setPage={setJudgePage} /> : <div>Loading...</div>}

					<div className="flex w-full justify-between items-center my-5">
						<div>
							Users
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						<Button
						variant={"outline"}
						className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
						onClick={() => toast.error("Not yet implemented")}>+</Button>
					</div>
					{users ? <Users list={allUsers} page={allUserPage} setList={setAllUsers} setPage={setAllUserPage} /> : <div>Loading...</div>}
				</div>
				:
				<div>
					<div className="flex w-full justify-between items-center my-5">
						<div>
							Superadmins
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						<Button
						variant={"outline"}
						className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
						onClick={() => toast.error("Not yet implemented")}>+</Button>
					</div>
					{users ? <Users list={superadmins} page={superadminPage} setList={setSuperadmins} setPage={setSuperadminPage} /> : <div>Loading...</div>}
					<div className="flex w-full justify-between items-center my-5">
						<div>
							Users
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
						<Button
						variant={"outline"}
						className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
						onClick={() => toast.error("Not yet implemented")}>+</Button>
					</div>
					{users ? <Users list={users} page={userPage} setList={setUsers} setPage={setUserPage} /> : <div>Loading...</div>}
				</div>
			}
		</div>
	);
}
