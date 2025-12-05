"use client";
import { createJudge, setJudgeType, setSuperadmin, UserSearchResult } from "@/app/actions";
import React from "react";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@repo/ui/components/sheet";
import { JudgeRole, UserRole } from "@prisma/client";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";

export default function UserInnerSheet({ user, hackathonId, setUser }: { user: UserSearchResult, hackathonId: string, setUser: React.Dispatch<React.SetStateAction<UserSearchResult>>}) {
    function getParticipant(user: UserSearchResult) {
        const participant = user.hackathonParticipants.find( (p) => p.hackathonId === hackathonId );
        return participant
    }

    return (
        user &&

        <SheetContent>
            <SheetHeader>
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription>
                    Description -- Nothing here is implemented at the moment
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
            <div className="flex justify-between gap-2.5">
                <Label htmlFor={`${user.id}-judge-type`} className="w-15 flex justify-end flex-1" >Judge</Label>
                <Switch
                    id={`${user.id}-judge-type`}
                    checked={ getParticipant(user)?.judge?.role === JudgeRole.MANAGER }
                    onCheckedChange={async (checked) => {
                        const role = checked ? JudgeRole.MANAGER : JudgeRole.JUDGE

                        const participant = getParticipant(user)
                        if (!participant) return

                        if (!participant?.judge) {
                            const judge = await createJudge(participant.id, role)

                            if (judge) participant.judge = judge
                            else return false
                        }
                        
                        await setJudgeType(participant.judge.id, role)
                        participant.judge.role = role
                        
                        const updatedUser = { ...user }
                        updatedUser.hackathonParticipants = user.hackathonParticipants.map(p =>
                            p.id === participant.id ? { ...participant } : p
                        );
                        setUser(updatedUser)
                    }} />
                <Label htmlFor={`${user.id}-judge-type`} className="flex-1" >Admin</Label>
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
        </SheetContent>
    )
}
