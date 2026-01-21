import prisma from "@repo/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        applications: {
          some: {}, // Only return users with applications
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

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
