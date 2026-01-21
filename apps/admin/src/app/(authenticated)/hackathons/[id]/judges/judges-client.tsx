"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  ClipboardList,
  Star,
  Shield,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  addJudge,
  removeJudge,
  updateJudgeRole,
} from "@/app/actions/hackathons";

type Judge = {
  id: string;
  name: string;
  email: string;
  role: "JUDGE" | "MANAGER";
  hackathon_participant: {
    user: {
      image: string | null;
    };
  };
  _count: {
    assignments: number;
    scores: number;
  };
};

type AvailableParticipant = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  application?: {
    name: string;
  };
};

interface JudgesClientProps {
  hackathonId: string;
  judges: Judge[];
  availableParticipants: AvailableParticipant[];
}

export function JudgesClient({
  hackathonId,
  judges,
  availableParticipants,
}: JudgesClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedRole, setSelectedRole] = useState<"JUDGE" | "MANAGER">("JUDGE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const managers = judges.filter((j) => j.role === "MANAGER");

  async function handleAddJudge() {
    if (!selectedParticipant) {
      toast.error("Please select a participant");
      return;
    }

    setIsSubmitting(true);
    const result = await addJudge(hackathonId, selectedParticipant, selectedRole);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Judge added successfully");
      setIsAddDialogOpen(false);
      setSelectedParticipant("");
      setSelectedRole("JUDGE");
    } else {
      toast.error(result.error || "Failed to add judge");
    }
  }

  async function handleRemoveJudge(judgeId: string, judgeName: string) {
    if (!confirm(`Remove ${judgeName} as a judge?`)) return;

    const result = await removeJudge(hackathonId, judgeId);
    if (result.success) {
      toast.success("Judge removed");
    } else {
      toast.error(result.error || "Failed to remove judge");
    }
  }

  async function handleRoleChange(judgeId: string, newRole: "JUDGE" | "MANAGER") {
    const result = await updateJudgeRole(hackathonId, judgeId, newRole);
    if (result.success) {
      toast.success(`Role updated to ${newRole}`);
    } else {
      toast.error(result.error || "Failed to update role");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Judges</h2>
          <p className="text-sm text-neutral-500">
            {judges.length} judge{judges.length !== 1 ? "s" : ""} •{" "}
            {managers.length} manager{managers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          disabled={availableParticipants.length === 0}
          className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Judge
        </button>
      </div>

      {judges.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm p-12 text-center">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No judges yet</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Add judges to allow scoring of submissions.
          </p>
        </div>
      ) : (
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Judge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {judges.map((judge) => (
                <tr
                  key={judge.id}
                  className="border-b border-neutral-800 last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {judge.hackathon_participant.user.image ? (
                          <Image
                            src={judge.hackathon_participant.user.image}
                            alt={judge.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {judge.name}
                        </p>
                        <p className="text-xs text-neutral-500">{judge.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        value={judge.role}
                        onChange={(e) =>
                          handleRoleChange(
                            judge.id,
                            e.target.value as "JUDGE" | "MANAGER"
                          )
                        }
                        className={`appearance-none pr-8 pl-3 py-1 text-xs font-medium border cursor-pointer bg-transparent ${
                          judge.role === "MANAGER"
                            ? "text-purple-400 border-purple-500/30"
                            : "text-neutral-400 border-neutral-700"
                        }`}
                      >
                        <option value="JUDGE">JUDGE</option>
                        <option value="MANAGER">MANAGER</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-500 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                      <ClipboardList className="h-4 w-4 text-neutral-600" />
                      {judge._count.assignments}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                      <Star className="h-4 w-4 text-neutral-600" />
                      {judge._count.scores}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveJudge(judge.id, judge.name)}
                      disabled={judge._count.scores > 0}
                      className="p-2 text-neutral-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={
                        judge._count.scores > 0
                          ? "Cannot remove judge with scores"
                          : "Remove judge"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Judge Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setIsAddDialogOpen(false)}
          />
          <div className="relative bg-neutral-950 border border-neutral-800 p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Add Judge</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Select Participant
                </label>
                <select
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full h-10 px-3 bg-transparent border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
                >
                  <option value="">Choose a participant...</option>
                  {availableParticipants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.application?.name || p.user.name} ({p.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as "JUDGE" | "MANAGER")
                  }
                  className="w-full h-10 px-3 bg-transparent border border-neutral-800 text-white text-sm focus:outline-none focus:border-neutral-600"
                >
                  <option value="JUDGE">Judge</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="h-10 px-4 border border-neutral-800 text-white text-sm font-medium hover:bg-neutral-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJudge}
                disabled={isSubmitting || !selectedParticipant}
                className="h-10 px-4 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Judge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
