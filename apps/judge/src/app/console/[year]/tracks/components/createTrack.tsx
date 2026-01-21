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

interface TrackDialogProps {
  yearParam: string;
  createTrack: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function TrackDialog({ yearParam, createTrack }: TrackDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createTrack(formData);
    setOpen(false); // Close dialog after successful submission
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          Create a track
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="hackathonId" value={yearParam} />
          <DialogHeader>
            <DialogTitle>Create a track</DialogTitle>
            <DialogDescription>
              Design your own track. Save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description-1">Description</Label>
              <Input id="description-1" name="description" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prize-1">Prize</Label>
              <Input id="prize-1" name="prize" />
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
