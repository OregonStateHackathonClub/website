"use client";
import { createJudge, removeHackathonParticipant, removeJudge, removeUser, setJudgeType, setSuperadmin, UserSearchResult } from "@/app/actions";
import React from "react";
import { Button } from "@repo/ui/components/button";
import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@repo/ui/components/sheet";
import { JudgeRole, UserRole } from "@prisma/client";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import { toast } from "sonner";

export default function UserInnerSheet({ user, hackathonId, setUser }: { user: UserSearchResult, hackathonId: string, setUser: React.Dispatch<React.SetStateAction<UserSearchResult | null>> }) {

    function getParticipant() {
        return user.hackathonParticipants.find( (p) => p.hackathonId === hackathonId );
    }

    async function addJudgeRole(role: JudgeRole) {
        const participant = getParticipant()
        if (!participant) return

        let updatedUser: UserSearchResult = {
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

        if (participant?.judge) {
            setJudgeType(participant.judge.id, role)
        } else {
            const judge = await createJudge(participant.id, role)

            if (judge)
            {
                participant.judge = judge
                updatedUser = {
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
            } else {
                toast.error("Failed to create judge")
                return false
            }
        }
        setUser(updatedUser);
    }

    async function deleteJudge() {
        const participant = getParticipant()
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
        
        const res = await removeJudge(participant.judge.id)

        if (res) {
            toast.message("Successfully deleted judge")
            return true
        } else {
            toast.error("Failed to  delete judge")
            return false
        }
    }

    async function deleteHackathonParticipant() {
        const participant = getParticipant()
        if (!participant) return

        try {
            setUser(prev => ({
                ...prev!,
                hackathonParticipants: prev!.hackathonParticipants.map(p =>
                    p.id === participant.id ? { ...p, judge: null } : p
                )
            }));

            const res =  await removeHackathonParticipant(participant.id)
    
            if (res) {
                toast.message("Successfully deleted hackathon participant")
                setUser(prev => ({
                    ...prev!,
                    hackathonParticipants: prev!.hackathonParticipants.filter(p => p.id !== participant.id)
                }));
                return true
            } else {
                throw new Error("Failed to delete hackathon participant");
            }
            
        } catch (err) {
            toast.error((err as Error).message);
            setUser(user);
            return false
        }
    }

    async function deleteUser() {
        if (!user) return false
        const tempUser = user
        try {
            setUser(null)
            const res = await removeUser(tempUser.id)
    
            if (!res) {
                throw new Error("Failed to delete user");
            }

            toast.message("Successfully deleted user")
            return true

        } catch (err) {
            toast.error((err as Error).message);
            setUser(tempUser)
            return false
        }
    }

    function getDescription() {
        const options = ["Meow.", "the Destroyer!", "just vibin..", "hardened criminal",
            "01100001011001000110000101101101\n011000100110111101100010011010010110001101101000",
            "the last code-bender", "nature's chosen", "fallen angel", "the 4th", "the fastest man alive",
            "gone but not forgotten", "a fan favorite", "Pika Pika!", "undercover spy", "ascended one"]
        return options[Math.floor(Math.random() * options.length)]
    }

    return (
        user &&

        <SheetContent>
            <SheetHeader>
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription>
                    {getDescription()}
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
                    { getParticipant()?.judge ?
                        <>
                            <div className="flex justify-between gap-2.5">
                                <Label htmlFor={`${user.id}-judge-type`} className="w-15 flex justify-end flex-1" >Judge</Label>
                                <Switch
                                    id={`${user.id}-judge-type`}
                                    checked={ getParticipant()?.judge?.role === JudgeRole.MANAGER }
                                    onCheckedChange={async (checked) => {
                                        const role = checked ? JudgeRole.MANAGER : JudgeRole.JUDGE

                                        addJudgeRole(role)
                                    }} />
                                <Label htmlFor={`${user.id}-judge-type`} className="flex-1" >Admin</Label>
                            </div>
                            <div className="flex justify-center">
                                <Button variant={"destructive"} className="w-60" onClick={() => deleteJudge()}>
                                    Delete Judge
                                </Button>
                            </div>
                        </>
                    :
                        <div className="flex justify-center">
                            <Button variant={"outline"} className="w-60" onClick={() => addJudgeRole(JudgeRole.JUDGE)}>
                                Promote to Judge
                            </Button>
                        </div>
                    }
                    <div className="flex justify-center">
                        <Button variant={"destructive"} className="w-60" onClick={() => deleteHackathonParticipant()}>
                            Delete Hackathon Participant
                        </Button>
                    </div>
                </>
            }

            <div className="flex justify-center">
                <Button variant={"destructive"} className="w-60" onClick={() => deleteUser()}>
                    Delete User
                </Button>
            </div>
        </SheetContent>
    )
}
