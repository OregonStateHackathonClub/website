"use client";
import { userSearch, UserSearchResult } from "@/app/actions";
import React, { useCallback, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@repo/ui/components/pagination";
import { Button } from "@repo/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@repo/ui/components/dropdown-menu";
import { toast } from "sonner";
import { JudgeRole, UserRole } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import UserOuterSheet from "./UserOuterSheet";

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

	const admins = allUsers.filter(u => u.role === UserRole.ADMIN);
	const judges = allUsers.filter(u =>
		u.hackathonParticipants.some(p => p.judge?.role === JudgeRole.JUDGE)
	);
	const managers = allUsers.filter(u =>
		u.hackathonParticipants.some(p => p.judge?.role === JudgeRole.MANAGER)
	);
	const users = hackathonId
		? allUsers.filter(u =>
			!u.hackathonParticipants.some(p =>
				p.judge?.role === JudgeRole.JUDGE ||
				p.judge?.role === JudgeRole.MANAGER
			)
		)
		: allUsers.filter(u => u.role === UserRole.USER);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 400); // 400ms debounce

		return () => clearTimeout(handler);
	}, [search]);


	const fetchUsers = useCallback(async () => {
		const allUsersResult = await userSearch(debouncedSearch, hackathonId);
		if (allUsersResult) setAllUsers(allUsersResult);
	}, [debouncedSearch, hackathonId]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

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
		// setList,
		setPage,
	}: {
		list: UserSearchResult[];
		page: number;
		// setList: React.Dispatch<React.SetStateAction<UserSearchResult[]>>;
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
							className="hover:bg-gray-800 hover:text-white"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
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
							<div className="flex-1 h-0.5 mx-5 bg-gray-800 rounded-full" />
							<Button
							variant={"outline"}
							className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
							onClick={() => toast.error("Not yet implemented")}>+</Button>
						</div>
						{users ? <Users list={managers} page={managerPage} setPage={setManagerPage} /> : <div>Loading...</div>}

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
						{users ? <Users list={judges} page={judgePage} setPage={setJudgePage} /> : <div>Loading...</div>}

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
						{users ? <Users list={users} page={userPage} setPage={setUserPage} /> : <div>Loading...</div>}
					</div>
					:
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
						{users ? <Users list={admins} page={adminPage} setPage={setAdminPage} /> : <div>Loading...</div>}
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
						{users ? <Users list={users} page={userPage} setPage={setUserPage} /> : <div>Loading...</div>}
					</div>
				}
			</div>
		</>
	);
}
