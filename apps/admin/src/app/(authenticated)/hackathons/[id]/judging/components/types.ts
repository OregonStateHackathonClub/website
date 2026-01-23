export type JudgingRoundType = "TRIAGE" | "RUBRIC" | "RANKED";

export type Round = {
  id: string;
  roundNumber: number;
  type: JudgingRoundType;
  advanceCount: number | null;
  advancePercent: number | null;
  judgesPerProject: number;
  minutesPerProject: number;
  rubricId: string | null;
  rankedSlots: number | null;
  isActive: boolean;
  isComplete: boolean;
};

export type JudgingPlan = {
  id: string;
  rounds: Round[];
};

export type Track = {
  id: string;
  name: string;
  judgingPlan: JudgingPlan | null;
  judgeAssignments: {
    judge: {
      id: string;
      name: string;
    };
  }[];
  _count: {
    submissions: number;
  };
};

export type Judge = {
  id: string;
  name: string;
  email: string;
  trackAssignments: {
    trackId: string;
  }[];
  _count: {
    roundAssignments: number;
  };
};

export type RoundInput = {
  type: JudgingRoundType;
  advanceCount?: number;
  advancePercent?: number;
  judgesPerProject: number;
  minutesPerProject: number;
  rubricId?: string;
  rankedSlots?: number;
};

export const ROUND_TYPE_CONFIG = {
  TRIAGE: {
    label: "Triage",
    description: "Quick 1-5 star screening",
  },
  RUBRIC: {
    label: "Rubric",
    description: "Full rubric-based scoring",
  },
  RANKED: {
    label: "Ranked",
    description: "Final ranked choice voting",
  },
} as const;
