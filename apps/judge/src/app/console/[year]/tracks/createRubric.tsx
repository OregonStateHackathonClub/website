"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@repo/ui/components/button";
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
import { Card } from "@repo/ui/components/card";

interface RubricDialogProps {
  trackId: string;
  trackName: string;
  createRubric: (formData: FormData) => Promise<void>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" form="rubric-form" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function RubricDialog({
  trackId,
  trackName,
  createRubric,
}: RubricDialogProps) {
  const [open, setOpen] = useState(false);

  const [criteria, setCriteria] = useState<
    { name: string; weight: string; maxScore: string }[]
  >([{ name: "", weight: "", maxScore: "" }]);

  const addCriterion = () => {
    setCriteria([...criteria, { name: "", weight: "", maxScore: "" }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  async function handleSubmit(formData: FormData) {
    await createRubric(formData);
    setOpen(false); // Close dialog after successful submission
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-black text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create a rubric for {trackName}</DialogTitle>
          <DialogDescription>
            Design a rubric for this track. Save when done.
          </DialogDescription>
        </DialogHeader>
        <form
          id="rubric-form"
          action={handleSubmit}
          className="space-y-4 overflow-y-auto flex-1"
        >
          <input type="hidden" name="trackId" value={trackId} />
          <Input name="rubricName" placeholder="Rubric Name" />

          {criteria.map((criterion, index) => (
            <Card key={index} className="p-4 space-y-2">
              <Input
                name={`criteria[${index}].name`}
                placeholder="Criteria Name"
                value={criterion.name}
                onChange={(e) => {
                  const newCriteria = [...criteria];
                  newCriteria[index].name = e.target.value;
                  setCriteria(newCriteria);
                }}
              />
              <Input
                name={`criteria[${index}].weight`}
                type="number"
                step="0.1"
                min="0"
                placeholder="Criteria Weight"
                value={criterion.weight}
                onChange={(e) => {
                  const newCriteria = [...criteria];
                  newCriteria[index].weight = e.target.value;
                  setCriteria(newCriteria);
                }}
              />
              <Input
                name={`criteria[${index}].maxScore`}
                type="number"
                placeholder="Criteria Max Score"
                value={criterion.maxScore}
                onChange={(e) => {
                  const newCriteria = [...criteria];
                  newCriteria[index].maxScore = e.target.value;
                  setCriteria(newCriteria);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(index)}
                disabled={criteria.length === 1}
              >
                Remove
              </Button>
            </Card>
          ))}

          <div className="flex justify-center pb-5">
            <Button type="button" onClick={addCriterion}>
              Add Criterion
            </Button>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <SubmitButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
