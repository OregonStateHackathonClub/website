"use client";
import { removeUser, setSuperadmin, userSearch } from "@/app/actions";
import React, { useCallback, useEffect, useState } from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@repo/ui/components/pagination";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";


import { toast } from "sonner";
import { UserRole } from "@prisma/client";
export default function UsersPage({ hackathonId }: { hackathonId: string }) {
	const [search, setSearch] = useState("");
	const [users, setUsers] = useState<any[]>([]);
	const [page, setPage] = useState(1);

	const fetchUsers = useCallback(async () => {
		const res = await userSearch(search, hackathonId);
		if (!res) return;
		setUsers(res);
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

	function Users() {
		const usersPerPage = 10;
		const totalPages = Math.ceil(users.length / usersPerPage);

		const startIndex = (page - 1) * usersPerPage;
		const endIndex = startIndex + usersPerPage;
		const currentUsers = users.slice(startIndex, endIndex);

		return (
			<div>
				<div className="grid gap-2">
					{currentUsers.map((user) => {
						return (
							<div key={user.id}>
								<div className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-sm">
									<div>
										<h3 className="font-semibold text-gray-100">{user.name}</h3>
										<p className="text-xs">{user.email}</p>
									</div>
									<ButtonGroup>
										<Button
											variant="outline"
											className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
											onClick={() => copyString(user.id)}
										>
											Copy UserId
										</Button>

										{user?.role == UserRole.USER && (
											<Button
												variant="outline"
												className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
												onClick={() => modifySuperadmin(true, user.id)}
											>
												Promote to Superuser
											</Button>
										)}

										{user?.role == UserRole.ADMIN && (
											<Button
												variant="outline"
												className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
												onClick={() => modifySuperadmin(false, user.id)}
											>
												Demote to User
											</Button>
										)}
										<Button
											variant="outline"
											className="rounded-xl border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100"
											onClick={() => deleteUser(user.id)}
										>
											Delete User
										</Button>
									</ButtonGroup>
								</div>
							</div>
						);
					})}
				</div>
				<Pages totalPages={totalPages} />
			</div>
		);
	}

	function Pages({ totalPages }: { totalPages: number }) {
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
							// Always show first & last page
							if (pageNum === 1 || pageNum === totalPages) return true;
							// Show a range around the current page
							if (Math.abs(pageNum - page) <= 2) return true;
							return false;
						})
						.map((pageNum, idx, arr) => {
							// Insert ellipses where there's a gap
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
											className={`hover:bg-gray-800 hover:text-white ${page === pageNum ? "border-gray-700 bg-gray-900 text-white" : ""}`}
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
			{users ? <Users /> : <div>Loading...</div>}
		</div>
	);
}
