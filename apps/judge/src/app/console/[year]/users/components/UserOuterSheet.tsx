"use client";
import { UserSearchResult } from "@/app/actions";
import React, { useState } from "react";
import { Sheet } from "@repo/ui/components/sheet";
import UserInnerSheet from "./UserInnerSheet";

export default function UserOuterSheet({ currentUser, hackathonId, setAllUsers, isSheetOpen, setIsSheetOpen}: { currentUser: UserSearchResult, hackathonId: string, setAllUsers: React.Dispatch<React.SetStateAction<UserSearchResult[]>>, isSheetOpen: boolean, setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
	const [user, setUser] = useState<UserSearchResult>(currentUser);

    function updateUsers(user: UserSearchResult) {
        setAllUsers((prev: UserSearchResult[]) => 
            prev.map(u => (u.id === user.id ? user : u))
        );
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={(value) => {
            setIsSheetOpen(value)
            if (!value) {
                if (!user) return;
                updateUsers(user)
            }
        }}>
            <UserInnerSheet
                user={user}
                hackathonId={hackathonId}
                setUser={setUser}
            />
        </Sheet>
    )
}
