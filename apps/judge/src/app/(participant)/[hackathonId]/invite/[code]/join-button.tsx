"use client";

import { Button } from "@repo/ui/components/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { joinTeam } from "@/app/actions/participant";

interface JoinButtonProps {
  code: string;
  hackathonId: string;
  hasSoloSubmission: boolean;
}

export function JoinButton({
  code,
  hackathonId,
  hasSoloSubmission,
}: JoinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    const result = await joinTeam(code);
    if (result.success) {
      router.push(`/${hackathonId}/team/${result.teamId}`);
      router.refresh();
    } else {
      setLoading(false);
      toast.error(result.error || "Failed to join team");
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={handleJoin}
        disabled={loading}
        className="flex-1 rounded-none bg-white text-black hover:bg-neutral-200"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasSoloSubmission ? (
          "Delete Submission & Join"
        ) : (
          "Join Team"
        )}
      </Button>
      <Link
        href={`/${hackathonId}`}
        className="rounded-none border border-neutral-800 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-neutral-900"
      >
        Cancel
      </Link>
    </div>
  );
}
