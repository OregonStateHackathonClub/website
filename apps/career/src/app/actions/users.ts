"use server";

import type {
  Application,
  Hackathon,
  HackathonParticipant,
  Submission,
  Team,
  TeamMember,
  Track,
  User,
} from "@repo/database";
import prisma from "@repo/database";
import { requireSponsor } from "./auth";

type TeamWithSubmission = Team & {
  submission:
    | (Submission & {
        tracks: Track[];
      })
    | null;
};

type TeamMemberWithTeam = TeamMember & {
  team: TeamWithSubmission;
};

type HackathonParticipantWithDetails = HackathonParticipant & {
  hackathon: Hackathon;
  teamMember: TeamMemberWithTeam | null;
};

export type UserWithDetails = User & {
  applications: Application[];
  hackathonParticipants: HackathonParticipantWithDetails[];
};

export async function getUsers(): Promise<UserWithDetails[]> {
  await requireSponsor();

  const users = await prisma.user.findMany({
    where: {
      applications: {
        some: {},
      },
    },
    include: {
      applications: true,
      hackathonParticipants: {
        include: {
          hackathon: true,
          teamMember: {
            include: {
              team: {
                include: {
                  submission: {
                    include: {
                      tracks: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return users as UserWithDetails[];
}
