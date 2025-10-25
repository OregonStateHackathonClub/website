import prisma from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        application: {
          isNot: null, // Only return users with applications
        },
      },
      include: {
        application: true,
        hackathonParticipants: {
          include: {
            hackathon: true,
            teamMember: {
              include: {
                team: {
                  include: {
                    submission: {
                      include: {
                        submissionTracks: {
                          include: {
                            track: true,
                          },
                        },
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
