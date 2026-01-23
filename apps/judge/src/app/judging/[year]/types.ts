// Shared types for the judging interface

export type RoundType = "TRIAGE" | "RUBRIC" | "RANKED";

export type Criterion = {
  id: string;
  name: string;
  description: string | null;
  weight: number;
  maxScore: number;
};

export type Submission = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tableNumber: number | null;
  teamName: string;
  tracks: { id: string; name: string }[];
  images: string[];
  videoUrl: string;
  githubUrl: string;
  members: { name: string; image: string | null }[];
};

export type Assignment = {
  id: string;
  submissionId: string;
  completed: boolean;
  skippedReason: string | null;
  notes: string | null;
  submission: Submission;
  score?: number | Record<string, number>;
};

// Dashboard-specific round type (includes progress info)
export type DashboardRound = {
  id: string;
  roundNumber: number;
  type: RoundType;
  trackId: string;
  trackName: string;
  minutesPerProject: number;
  isActive: boolean;
  isComplete: boolean;
  startedAt: Date | null;
  totalAssignments: number;
  completedAssignments: number;
};

// Round page-specific round type (includes rubric info)
export type JudgingRound = {
  id: string;
  roundNumber: number;
  type: RoundType;
  trackName: string;
  minutesPerProject: number;
  isActive: boolean;
  isComplete: boolean;
  startedAt: Date | null;
  rankedSlots: number | null;
  rubric: {
    id: string;
    name: string;
    criteria: Criterion[];
  } | null;
};

// Round type configuration for UI display
export const ROUND_TYPE_CONFIG = {
  TRIAGE: {
    label: "Triage",
    description: "Quick 1-5 star screening",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
  },
  RUBRIC: {
    label: "Rubric",
    description: "Detailed criteria-based scoring",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  RANKED: {
    label: "Finals",
    description: "Ranked choice voting",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
} as const;
