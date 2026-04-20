import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: hackathonId } = await params;
  const roundId = request.nextUrl.searchParams.get("round");

  // Build where clause
  const where: Record<string, unknown> = {};
  if (roundId) {
    // Verify the round belongs to this hackathon before trusting the ID.
    const round = await prisma.judgingRound.findUnique({
      where: { id: roundId },
      select: { plan: { select: { track: { select: { hackathonId: true } } } } },
    });
    if (!round || round.plan.track.hackathonId !== hackathonId) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    where.roundId = roundId;
  } else {
    where.round = { plan: { track: { hackathonId } } };
  }

  const assignments = await prisma.roundJudgeAssignment.findMany({
    where,
    include: {
      judge: { select: { name: true, email: true } },
      submission: {
        select: {
          title: true,
          team: { select: { name: true } },
          tracks: { select: { name: true } },
        },
      },
      round: { select: { roundNumber: true, type: true } },
      triageScore: { select: { stars: true } },
      rubricScores: { select: { value: true } },
      rankedVote: { select: { rank: true } },
    },
    orderBy: [
      { round: { roundNumber: "asc" } },
      { submission: { title: "asc" } },
      { judge: { name: "asc" } },
    ],
  });

  // Build CSV
  const header = [
    "Project",
    "Team",
    "Track",
    "Round",
    "Judge Name",
    "Judge Email",
    "Status",
    "Skip Reason",
    "Triage Score",
    "Rubric Total",
    "Ranked Position",
    "Notes",
  ].join(",");

  const rows = assignments.map((a) => {
    const status = a.completed
      ? a.skippedReason
        ? "skipped"
        : "completed"
      : "not_started";

    const rubricTotal =
      a.rubricScores.length > 0
        ? a.rubricScores.reduce((sum, s) => sum + s.value, 0).toString()
        : "";

    const fields = [
      a.submission.title,
      a.submission.team?.name || "",
      a.submission.tracks[0]?.name || "",
      `R${a.round.roundNumber} ${a.round.type}`,
      a.judge.name,
      a.judge.email,
      status,
      a.skippedReason || "",
      a.triageScore?.stars?.toString() || "",
      rubricTotal,
      a.rankedVote?.rank?.toString() || "",
      a.notes || "",
    ];

    // Escape CSV fields
    return fields
      .map((f) => {
        if (f.includes(",") || f.includes('"') || f.includes("\n")) {
          return `"${f.replace(/"/g, '""')}"`;
        }
        return f;
      })
      .join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="judging-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
