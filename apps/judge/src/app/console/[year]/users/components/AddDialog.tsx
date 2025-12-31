"use client"
import { UserSearchResult } from "@/app/actions/user";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { useState } from "react";
import Pages from "./Pages";
import { Checkbox } from "@repo/ui/components/checkbox";
import { createHackathonParticipant } from "@/app/actions/hackathonParticipant";
import { toast } from "sonner";
import { JudgeRole } from "@prisma/client";
import { createJudge, setJudgeType } from "@/app/actions/judge";

type userId = string

export default function AddDialog({ role, hackathonId, search, setSearch, filteredUsers, setAllUsers }: { role: null | JudgeRole, hackathonId: string, search: string, setSearch: React.Dispatch<React.SetStateAction<string>>, filteredUsers: UserSearchResult[], setAllUsers: React.Dispatch<React.SetStateAction<UserSearchResult[]>> }) {
    const [selected, setSelected] = useState<userId[]>([])
    const [page, setPage] = useState(1)

    let validTargets

    if (role === null) {
        validTargets = filteredUsers.filter(u =>
            u.hackathonParticipants.some(p => p.hackathonId !== hackathonId)
        );
    } else {
        validTargets = filteredUsers.filter(u =>
            u.hackathonParticipants.some(p => p.judge?.role !== role)
        );
    }

    // TODO: Properly show when it fails
    // TODO: Add Magic Links for Judges
    function applyChanges() {
        const totalSelected = selected.length
        let selectedCount = selected.length

        const makeRole = async (id: userId) => {
            const currentUser = filteredUsers.find(u => u.id == id);
            if (!currentUser) return
            let currentHackathonParticipant = currentUser.hackathonParticipants.find((p) => p.hackathonId === hackathonId );
            if (!currentHackathonParticipant) {
                const fullHackathonParticipant = await createHackathonParticipant()
                if (!fullHackathonParticipant) return
                currentHackathonParticipant = {
                    id: fullHackathonParticipant.id,
                    hackathonId: fullHackathonParticipant.hackathonId,
                    judge: null
                }
            }

            if (role === null) {
                setAllUsers((prev) => prev.map(u => (u.id === currentUser.id ? currentUser : u)));
                setSelected((prev) => prev.filter(id => (id !== currentUser.id)))
                selectedCount -= 1
                if (selectedCount === 0) toast.message(`Successfully added ${totalSelected} hackathon participants`)
            } else {
                if (!currentHackathonParticipant.judge) {
                    const currentJudge = await createJudge(currentHackathonParticipant.id, role)
                    if (!currentJudge) return
                    currentHackathonParticipant.judge = currentJudge
                } else if (currentHackathonParticipant.judge.role !== role) {
                    const res = await setJudgeType(currentHackathonParticipant.judge.id, role)
                    if (!res) return
                    currentHackathonParticipant.judge.role = role
                }

                setAllUsers((prev) => prev.map(u => (u.id === currentUser.id ? currentUser : u)));
                setSelected((prev) => prev.filter(id => (id !== currentUser.id)))
                selectedCount -= 1
                if (selectedCount === 0) toast.message(`Successfully promoted ${totalSelected} users to ${role === JudgeRole.MANAGER ? "managers" : "judges"}`)
            }
        }

        for (const id of selected) {
            makeRole(id)
        }
    }

    function Users({
		list,
	}: {
		list: UserSearchResult[];
	}) {
		const entriesPerPage = 5;
		const totalPages = Math.ceil(list.length / entriesPerPage);

		const startIndex = (page - 1) * entriesPerPage;
		const endIndex = startIndex + entriesPerPage;
		const currentEntries = list.slice(startIndex, endIndex);

		return (
			<div>
				<div className="grid gap-2 h-85">
					{currentEntries.map((user) => {
						return (
							<div key={user.id}>
								<div className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-sm">
									<div>
										<h3 className="font-semibold text-gray-100">{user.name}</h3>
										<p className="text-xs">{user.email}</p>
									</div>
									<Checkbox className="w-5 h-5" checked={selected.includes(user.id) } onCheckedChange={(checked) => {
                                        setSelected((prev) => {
                                            if (checked) return [...prev, user.id];
                                            else return prev.filter((id) => id !== user.id);
                                        })
                                    }} />
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
        <Dialog onOpenChange={() => {
            setSelected([])
            setPage(1)
            }}>
            <DialogTrigger asChild>
                <Button
                variant={"outline"}
                className="w-9 h-9 p-0 m-0 rounded-full border-gray-800 bg-gray-900 text-gray-100 hover:bg-gray-800 hover:text-gray-100">
                    +
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {role === null && "Add Users to this Hackathon"}
                        {role === JudgeRole.MANAGER && "Add Managers"}
                        {role === JudgeRole.JUDGE && "Add Judges"}
                    </DialogTitle>
                    <DialogDescription>
                        {role === null && "Select users to add to this hackathon as participants."}
                        {role === JudgeRole.MANAGER && "Select users to promote to managers for this hackathon."}
                        {role === JudgeRole.JUDGE && "Select users to promote to judges for this hackathon."}
                    </DialogDescription>
                </DialogHeader>
                <input
                    type="text"
                    placeholder="Search..."
                    className="mb-2 w-75 cursor-text rounded-xl border border-gray-700 bg-gray-900 p-2 shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Users list={validTargets} />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button type="submit" onClick={applyChanges}>Save changes</Button>
                </DialogClose>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}