"use client";

import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { joinTeam } from "@/app/actions";

export default function InvitePageClient({
  code,
  year,
}: {
  code: string;
  year: string;
}) {
  const [failed, setFailed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    async function addToTeam() {
      const teamId = await joinTeam(code);
      if (!teamId) {
        toast.error("Could not join team");
        setFailed(true);
        return;
      }

      setRedirecting(true);
      await router.push(`/${year}/team/${teamId}`);
    }

    if (!isPending && session) {
      addToTeam();
    } else if (!isPending && !session) {
      setRedirecting(true);
      router.push("/log-in");
    }
  }, [isPending, session, router, code, year]);

  if (redirecting) {
    return null;
  } else if (!session) {
    return <div>Loading...</div>;
  } else if (failed) {
    return <div>Failed to add you to the team.</div>;
  } else {
    return <div>Joining Team...</div>;
  }
}
