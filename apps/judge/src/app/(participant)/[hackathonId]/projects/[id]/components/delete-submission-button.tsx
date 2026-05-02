"use client";

import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSubmission } from "../../../submission/actions";

interface DeleteSubmissionButtonProps {
  hackathonId: string;
}

export function DeleteSubmissionButton({
  hackathonId,
}: DeleteSubmissionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete your submission? This cannot be undone. You can submit a new project before the window closes.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    const result = await deleteSubmission(hackathonId);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Submission deleted");
      router.push(`/${hackathonId}`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full hover:cursor-pointer rounded-none border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50"
    >
      {isDeleting ? "Deleting..." : "Delete Submission"}
    </Button>
  );
}
