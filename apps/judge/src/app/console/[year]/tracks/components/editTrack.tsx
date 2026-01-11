"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

interface EditTrackDialogProps {
  track: {
    id: string;
    name: string;
    description: string;
    prize: string | null;
  };
  hackathonId: string;
  updateTrack: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function EditTrackDialog({
  track,
  hackathonId,
  updateTrack,
}: EditTrackDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(track.name);
  const [description, setDescription] = useState(track.description);
  const [prize, setPrize] = useState(track.prize || "");

  async function handleSubmit(formData: FormData) {
    await updateTrack(formData);
    setOpen(false); // Close dialog after successful submission
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Edit Track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="trackId" value={track.id} />
          <input type="hidden" name="hackathonId" value={hackathonId} />
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>
              Update the track details. Save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name-edit">Name</Label>
              <Input
                id="name-edit"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description-edit">Description</Label>
              <Input
                id="description-edit"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prize-edit">Prize</Label>
              <Input
                id="prize-edit"
                name="prize"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
