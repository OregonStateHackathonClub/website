"use client";
import { removeUser, setSuperadmin, userSearch } from "@/app/actions";
import React, { useCallback, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@repo/ui/components/pagination";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";


import { toast } from "sonner";
import { JudgeRole, UserRole } from "@prisma/client";
import { ChevronDown } from "lucide-react";
export default function UsersPage({ hackathonId }: { hackathonId: string }) {
	const [search, setSearch] = useState("");

	const [superadmins, setSuperadmins] = useState<any[]>([]);
	const [admins, setAdmins] = useState<any[]>([]);
	const [judges, setJudges] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);

	const [superadminPage, setSuperadminPage] = useState(1);
	const [adminPage, setAdminPage] = useState(1);
	const [judgePage, setJudgePage] = useState(1);
	const [userPage, setUserPage] = useState(1);



	const fetchUsers = useCallback(async () => {
		if (hackathonId) {
			const adminResult = await userSearch(search, hackathonId, JudgeRole.ADMIN);
			if (adminResult) setAdmins(adminResult);

			const judgeResult = await userSearch(search, hackathonId, JudgeRole.JUDGE);
			if (judgeResult) setJudges(judgeResult);
		} else {
			const superAdminResult = await userSearch(search, "", UserRole.SUPERADMIN);
			if (superAdminResult) setSuperadmins(superAdminResult);
		}
		
		const usersResult = await userSearch(search, hackathonId);
		if (usersResult) setUsers(usersResult);
	}, [search]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	async function copyString(toCopy: string) {
		try {
			await navigator.clipboard.writeText(toCopy);
			toast.success("UserId opied to clipboard");
		} catch (err) {
			toast.error("Failed to copy text");
		}
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
		setPage,
	}: {
		list: any[];
		page: number;
		setPage: React.Dispatch<React.SetStateAction<number>>;
	}) {
		const entriesPerPage = 1;
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
											onClick={() => {}}
										>
											Edit
										</Button>

										<Button
											variant="outline"
											className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
											onClick={() => {}}
										>
											<ChevronDown />
										</Button>
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
						<div className="flex-1 h-0.5 mx-5 bg-gray-800" />
						<Button variant={"outline"} className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100">+</Button>
					</div>
					{users ? <Users list={admins} page={adminPage} setPage={setAdminPage} /> : <div>Loading...</div>}

					<div className="flex w-full justify-between items-center my-5">
						<div>
							Judges
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800" />
						<Button variant={"outline"} className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100">+</Button>
					</div>
					{users ? <Users list={judges} page={judgePage} setPage={setJudgePage} /> : <div>Loading...</div>}
				</div>
				:
				<div>
					<div className="flex w-full justify-between items-center my-5">
						<div>
							Superadmins
						</div>
						<div className="flex-1 h-0.5 mx-5 bg-gray-800" />
						<Button variant={"outline"} className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100">+</Button>
					</div>
					{users ? <Users list={superadmins} page={superadminPage} setPage={setSuperadminPage} /> : <div>Loading...</div>}
				</div>
			}
			<div className="flex w-full justify-between items-center my-5">
				<div>
					Users
				</div>
				<div className="flex-1 h-0.5 mx-5 bg-gray-800" />
				<Button variant={"outline"} className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100">+</Button>
			</div>
			{users ? <Users list={users} page={userPage} setPage={setUserPage} /> : <div>Loading...</div>}
		</div>
	);
}
