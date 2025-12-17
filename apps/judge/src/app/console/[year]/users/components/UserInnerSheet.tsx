"use client";
import { createJudge, removeJudge, setJudgeType, setSuperadmin, UserSearchResult } from "@/app/actions";
import React from "react";
import { Button } from "@repo/ui/components/button";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@repo/ui/components/sheet";
import { JudgeRole, UserRole } from "@prisma/client";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";

export default function UserInnerSheet({ user, hackathonId, setUser }: { user: UserSearchResult, hackathonId: string, setUser: React.Dispatch<React.SetStateAction<UserSearchResult>>}) {
    function getParticipant(user: UserSearchResult) {
        return user.hackathonParticipants.find( (p) => p.hackathonId === hackathonId );
    }

    async function addJudgeRole(user: UserSearchResult, role: JudgeRole) {
        const participant = getParticipant(user)
        if (!participant) return

        const updatedUser: UserSearchResult = {
            ...user,
            hackathonParticipants: user.hackathonParticipants.map(p =>
                p.id === participant.id
                    ? { 
                        ...p, 
                        judge: p.judge ? { ...p.judge, role } : { role, id: "" } // temporary id if judge doesn't exist yet
                    } 
                    : p
            )
        };
        setUser(updatedUser);

        if (!participant?.judge) {
            const judge = await createJudge(participant.id, role)

            if (judge) participant.judge = judge
            else return false
        }
        
        await setJudgeType(participant.judge.id, role)
    }

    async function deleteJudge(user: UserSearchResult) {
        const participant = getParticipant(user)
        if (!participant) return

        const updatedUser: UserSearchResult = {
            ...user,
            hackathonParticipants: user.hackathonParticipants.map(p =>
                p.id === participant.id
                    ? { 
                        ...p, 
                        judge: null
                    } 
                    : p
            )
        };
        setUser(updatedUser);

        if (!participant?.judge) {
            return false
        }
        
        await removeJudge(participant.judge.id)
        return true
    }

    return (
        user &&

        <SheetContent>
            <SheetHeader>
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription>
                    Description -- Work In Progress
                </SheetDescription>
            </SheetHeader>
            <div className="flex justify-between gap-2.5">
                <Label htmlFor={`${user.id}-superadmin`} className="w-15 flex justify-end flex-1" >User</Label>
                <Switch
                    id={`${user.id}-superadmin`}
                    checked={user.role === UserRole.ADMIN}
                    onCheckedChange={async (checked) => {
                        setSuperadmin(checked, user.id);

                        setUser(prev => {
                            if (!prev) return prev

                            const updated = {
                                ...prev,
                                role: checked ? UserRole.ADMIN : UserRole.USER
                            }
                            setUser(updated)
                            return updated
                        })
                    }} />
                <Label htmlFor={`${user.id}-superadmin`} className="flex-1" >Superadmin</Label>
            </div>
            { hackathonId &&
                <>
                    { getParticipant(user)?.judge ?
                        <>
                            <div className="flex justify-between gap-2.5">
                                <Label htmlFor={`${user.id}-judge-type`} className="w-15 flex justify-end flex-1" >Judge</Label>
                                <Switch
                                    id={`${user.id}-judge-type`}
                                    checked={ getParticipant(user)?.judge?.role === JudgeRole.MANAGER }
                                    onCheckedChange={async (checked) => {
                                        const role = checked ? JudgeRole.MANAGER : JudgeRole.JUDGE

                                        addJudgeRole(user, role)
                                    }} />
                                <Label htmlFor={`${user.id}-judge-type`} className="flex-1" >Admin</Label>
                            </div>
                            <div className="flex justify-center">
                                <Button variant={"destructive"} className="w-60" onClick={() => deleteJudge(user)}>
                                    Delete Judge
                                </Button>
                            </div>
                        </>
                    :
                        <div className="flex justify-center">
                            <Button variant={"outline"} className="w-60" onClick={() => addJudgeRole(user, JudgeRole.JUDGE)}>
                                Promote to Judge
                            </Button>
                        </div>
                    }
                    <div className="flex justify-center">
                        <Button variant={"destructive"} className="w-60">
                            Delete Hackathon Participant
                        </Button>
                    </div>
                </>

            }

            <div className="flex justify-center">
                <Button variant={"destructive"} className="w-60">
                    Delete User
                </Button>
            </div>
        </SheetContent>
    )
}
