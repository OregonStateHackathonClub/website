export type Track = {
  id: string;
  name: string;
  description: string;
  prize: string | null;
  rubric: {
    id: string;
    name: string;
    criteria: {
      id: string;
      name: string;
      weight: number;
      maxScore: number;
    }[];
  } | null;
  _count: {
    submissions: number;
  };
};

export type CriterionInput = {
  name: string;
  weight: number;
  maxScore: number;
};
