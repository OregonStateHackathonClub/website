"use client";

import { useState } from "react";
import { assignJudge } from "./server-actions";
import { Button } from "@repo/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/select";

type JudgeCardProps = { 
    submission: { 
        id: string; 
        name: string; 
        tracks: { id: string; name: string }[]; 
    }; 
    judges: { 
        id: string; 
        name: string 
    }[]; 
};

export function JudgeCard({ submission, judges }: JudgeCardProps) {
    const [selectedJudge, setSelectedJudge] = useState<string | undefined>(undefined);  
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | undefined>(undefined);

    async function handleApply() {
    if (!selectedJudge) return;

    setLoading(true);
    setMessage("");

    const result = await assignJudge({
        judgeId: selectedJudge,
        submissionId: submission.id,
    });

    setLoading(false);

    if (!result.success) {
        setMessage(result.error);
        return;
    }

    setMessage("Judge assigned successfully!");
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h2 className="font-semibold">{submission.name}</h2>

        <div className="flex items-center gap-2">
            <Select onValueChange={setSelectedJudge}>
                <SelectTrigger className="w-40">
              <SelectValue placeholder="Assign judge" />
            </SelectTrigger>

            <SelectContent>
              {judges.map((judge) => (
                <SelectItem key={judge.id} value={judge.id}>
                  {judge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleApply}
            disabled={!selectedJudge || loading}
          >
            {loading ? "Assigning..." : "Apply"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {submission.tracks.map((track) => (
          <span
            key={track.id}
            className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
          >
            {track.name}
          </span>
        ))}
      </div>

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
