"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";

interface AddJudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AddJudgeModal({
  isOpen,
  onClose,
  name,
  onNameChange,
  email,
  onEmailChange,
  onSubmit,
  isSubmitting,
}: AddJudgeModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="bg-neutral-950 border-neutral-800 rounded-none max-w-md gap-0 [&>button]:text-neutral-500 [&>button]:hover:text-white [&>button]:rounded-none"
        onPointerDownOutside={(e: Event) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e: KeyboardEvent) => isSubmitting && e.preventDefault()}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-medium text-white">
            Add Judge
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Judge name"
              className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="judge@example.com"
              className="bg-transparent dark:bg-transparent border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 rounded-none focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter className="flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-neutral-800 text-white hover:bg-neutral-900 rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !email.trim() || !name.trim()}
            className="bg-white text-black hover:bg-neutral-200 rounded-none"
          >
            {isSubmitting ? "Adding..." : "Add Judge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
