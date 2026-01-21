"use client";
import { UserSearchResult } from "@/app/actions/user";
import React, { useEffect, useState } from "react";
import { Sheet } from "@repo/ui/components/sheet";
import UserInnerSheet from "./UserInnerSheet";

export default function UserOuterSheet({
  currentUser,
  hackathonId,
  setAllUsers,
  isSheetOpen,
  setIsSheetOpen,
}: {
  currentUser: UserSearchResult;
  hackathonId: string;
  setAllUsers: React.Dispatch<React.SetStateAction<UserSearchResult[]>>;
  isSheetOpen: boolean;
  setIsSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [user, setUser] = useState<UserSearchResult | null>(currentUser);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    const participant = user?.hackathonParticipants.find(
      (p) => p.hackathonId === hackathonId,
    );
    if (user && (!hackathonId || participant)) {
      setAllUsers((prev: UserSearchResult[]) =>
        prev.map((u) => (u.id === user.id ? user : u)),
      );
    } else {
      setIsSheetOpen(false);
      setAllUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    }
  }, [user, hackathonId, setAllUsers, setIsSheetOpen, currentUser.id]);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(value) => {
        setIsSheetOpen(value);
      }}
    >
      {user && (
        <UserInnerSheet
          user={user}
          hackathonId={hackathonId}
          setUser={setUser}
        />
      )}
    </Sheet>
  );
}
