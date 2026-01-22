"use client";

import { useState } from "react";
import {
  Star,
  Scale,
  Trophy,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { submitTriageScore } from "@/app/actions/scoring";
import { toast } from "sonner";

type RoundType = "TRIAGE" | "RUBRIC" | "RANKED";

type Assignment = {
  id: string;
  submissionId: string;
  completed: boolean;
  submission: {
    id: string;
    name: string;
    tagline: string | null;
    teamName: string;
    tracks: string[];
    images: string[];
  };
  score?: number;
};

type RoundAssignment = {
  round: {
    id: string;
    roundNumber: number;
    type: RoundType;
    trackId: string;
    trackName: string;
    minutesPerProject: number;
    rubricId: string | null;
    rankedSlots: number | null;
  };
  assignments: Assignment[];
  totalCount: number;
  completedCount: number;
};

interface JudgeClientProps {
  hackathonId: string;
  year: string;
  assignments: RoundAssignment[];
}

const ROUND_TYPE_CONFIG = {
  TRIAGE: { label: "Triage", icon: Star, description: "Quick 1-5 star rating" },
  RUBRIC: { label: "Rubric", icon: Scale, description: "Full rubric scoring" },
  RANKED: { label: "Ranked", icon: Trophy, description: "Rank top projects" },
};

export function JudgeClient({ hackathonId, year, assignments }: JudgeClientProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<{
    round: RoundAssignment["round"];
    assignment: Assignment;
  } | null>(null);

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
          <Scale className="w-8 h-8 text-neutral-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Active Rounds</h2>
        <p className="text-neutral-400 max-w-md">
          There are no active judging rounds assigned to you at the moment.
          Check back later or contact an organizer.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Judging Dashboard</h1>
        <p className="text-neutral-400">
          Review and score your assigned submissions
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {assignments.map((ra) => {
          const config = ROUND_TYPE_CONFIG[ra.round.type];
          const Icon = config.icon;
          const progress = ra.totalCount > 0
            ? Math.round((ra.completedCount / ra.totalCount) * 100)
            : 0;

          return (
            <div
              key={ra.round.id}
              className="border border-neutral-800 bg-neutral-900/50 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{ra.round.trackName}</h3>
                  <p className="text-xs text-neutral-500">
                    Round {ra.round.roundNumber}: {config.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">
                  {ra.completedCount} / {ra.totalCount} complete
                </span>
                <span className="text-white font-medium">{progress}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignments by Round */}
      {assignments.map((ra) => {
        const config = ROUND_TYPE_CONFIG[ra.round.type];
        const Icon = config.icon;

        return (
          <div key={ra.round.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon className="w-5 h-5 text-neutral-500" />
              <h2 className="text-lg font-medium text-white">
                {ra.round.trackName} - Round {ra.round.roundNumber}
              </h2>
              <span className="text-sm text-neutral-500">
                ({config.label} • {ra.round.minutesPerProject} min/project)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ra.assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => setSelectedAssignment({ round: ra.round, assignment })}
                  className="text-left border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate group-hover:text-orange-400 transition-colors">
                        {assignment.submission.name}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {assignment.submission.teamName}
                      </p>
                    </div>
                    {assignment.completed ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        {assignment.score !== undefined && (
                          <span className="text-sm">{assignment.score}★</span>
                        )}
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
                    )}
                  </div>
                  {assignment.submission.tagline && (
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                      {assignment.submission.tagline}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {assignment.submission.tracks.slice(0, 2).map((track) => (
                      <span
                        key={track}
                        className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400"
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Scoring Modal */}
      {selectedAssignment && (
        <ScoringModal
          hackathonId={hackathonId}
          year={year}
          round={selectedAssignment.round}
          assignment={selectedAssignment.assignment}
          onClose={() => setSelectedAssignment(null)}
          onNext={() => {
            // Find next incomplete assignment
            const currentRound = assignments.find(
              (a) => a.round.id === selectedAssignment.round.id
            );
            if (currentRound) {
              const currentIndex = currentRound.assignments.findIndex(
                (a) => a.id === selectedAssignment.assignment.id
              );
              const nextAssignment = currentRound.assignments
                .slice(currentIndex + 1)
                .find((a) => !a.completed);
              if (nextAssignment) {
                setSelectedAssignment({
                  round: selectedAssignment.round,
                  assignment: nextAssignment,
                });
              } else {
                setSelectedAssignment(null);
                toast.success("Round complete!");
              }
            }
          }}
        />
      )}
    </div>
  );
}

function ScoringModal({
  hackathonId,
  year,
  round,
  assignment,
  onClose,
  onNext,
}: {
  hackathonId: string;
  year: string;
  round: RoundAssignment["round"];
  assignment: Assignment;
  onClose: () => void;
  onNext: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triageScore, setTriageScore] = useState<number>(assignment.score || 0);

  async function handleTriageSubmit() {
    if (triageScore < 1 || triageScore > 5) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const result = await submitTriageScore(
      hackathonId,
      round.id,
      assignment.submissionId,
      triageScore
    );
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Score submitted");
      onNext();
    } else {
      toast.error(result.error || "Failed to submit score");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-neutral-950 border border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950">
          <div>
            <h2 className="text-lg font-medium text-white">
              {assignment.submission.name}
            </h2>
            <p className="text-sm text-neutral-500">
              {assignment.submission.teamName} • {round.trackName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-neutral-500 text-sm mr-4">
              <Clock className="w-4 h-4" />
              {round.minutesPerProject} min
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Project Image */}
          {assignment.submission.images.length > 0 && (
            <div className="mb-6 aspect-video relative bg-neutral-900 overflow-hidden">
              <Image
                src={assignment.submission.images[0]}
                alt={assignment.submission.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Project Info */}
          {assignment.submission.tagline && (
            <p className="text-neutral-300 mb-4">
              {assignment.submission.tagline}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {assignment.submission.tracks.map((track) => (
              <span
                key={track}
                className="px-2 py-1 text-sm bg-neutral-800 text-neutral-300"
              >
                {track}
              </span>
            ))}
          </div>

          {/* Links placeholder */}
          <div className="flex gap-3 mb-8">
            <a
              href={`/${year}/projects/${assignment.submissionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border border-neutral-700 text-neutral-300 text-sm hover:bg-neutral-800 transition-colors"
            >
              View Full Project
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Scoring Section */}
          {round.type === "TRIAGE" && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                Rate this project
              </h3>
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setTriageScore(star)}
                    className={`p-2 transition-all ${
                      star <= triageScore
                        ? "text-yellow-400"
                        : "text-neutral-600 hover:text-neutral-400"
                    }`}
                  >
                    <Star
                      className="w-10 h-10"
                      fill={star <= triageScore ? "currentColor" : "none"}
                    />
                  </button>
                ))}
                <span className="ml-4 text-lg text-white">
                  {triageScore > 0 ? `${triageScore} / 5` : "Select rating"}
                </span>
              </div>
              <button
                onClick={handleTriageSubmit}
                disabled={isSubmitting || triageScore < 1}
                className="w-full py-3 bg-white text-black font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit & Next"}
              </button>
            </div>
          )}

          {round.type === "RUBRIC" && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                Rubric Scoring
              </h3>
              <p className="text-neutral-500 text-sm">
                Rubric scoring UI coming soon. Please view the full project page
                to review this submission.
              </p>
            </div>
          )}

          {round.type === "RANKED" && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">
                Ranked Voting
              </h3>
              <p className="text-neutral-500 text-sm">
                Ranked voting UI coming soon. This view shows individual projects
                - for ranked voting you&apos;ll rank all finalists together.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
