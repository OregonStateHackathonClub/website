import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding hackathon simulation...\n");

  // =========================================================================
  // 1. HACKATHON + TRACKS + RUBRIC
  // =========================================================================

  const hackathon = await prisma.hackathon.create({
    data: {
      name: "BeaverHacks Winter 2026",
      description: "Oregon State University's winter hackathon",
    },
  });
  console.log(`Created hackathon: ${hackathon.name}`);

  const trackNames = [
    {
      name: "Best Overall",
      description: "Best overall hack across all categories",
      prize: "$500",
    },
    {
      name: "Best Use of AI",
      description: "Most innovative use of artificial intelligence",
      prize: "$300",
    },
    {
      name: "Best Social Impact",
      description: "Hack with the most positive social impact",
      prize: "$200",
    },
  ];

  const tracks = await Promise.all(
    trackNames.map((t) =>
      prisma.track.create({
        data: { ...t, hackathonId: hackathon.id },
      }),
    ),
  );
  console.log(`Created ${tracks.length} tracks`);

  // Create rubric for the "Best Overall" track (used in round 2)
  const rubric = await prisma.rubric.create({
    data: {
      name: "Overall Rubric",
      trackId: tracks[0].id,
      criteria: {
        create: [
          {
            name: "Technical Complexity",
            description: "How technically challenging is the project?",
            weight: 1.0,
            maxScore: 10,
          },
          {
            name: "Innovation",
            description: "How original and creative is the idea?",
            weight: 1.0,
            maxScore: 10,
          },
          {
            name: "Presentation",
            description: "How well is the project presented and demoed?",
            weight: 1.0,
            maxScore: 10,
          },
          {
            name: "Completion",
            description: "How complete and polished is the project?",
            weight: 1.0,
            maxScore: 10,
          },
        ],
      },
    },
    include: { criteria: true },
  });
  console.log(`Created rubric with ${rubric.criteria.length} criteria`);

  // =========================================================================
  // 2. CREATE 30 USERS, PARTICIPANTS, TEAMS, AND SUBMISSIONS
  // =========================================================================

  const projectIdeas = [
    { title: "EcoTrack", tagline: "Carbon footprint tracker for students", description: "A mobile-first web app that helps college students track and reduce their daily carbon footprint through gamification and social challenges." },
    { title: "StudyBuddy AI", tagline: "AI-powered study group matcher", description: "Uses NLP to match students based on course material, study habits, and learning styles for optimal study group formation." },
    { title: "CampusNav", tagline: "Indoor navigation for university buildings", description: "AR-based indoor navigation system using computer vision to help students find classrooms, offices, and facilities." },
    { title: "FoodShare OSU", tagline: "Reduce campus food waste", description: "Platform connecting dining halls, student orgs, and food banks to redistribute surplus food and reduce waste on campus." },
    { title: "BeaverBot", tagline: "Discord bot for OSU students", description: "An intelligent Discord bot that answers questions about OSU courses, deadlines, campus events, and provides academic advising tips." },
    { title: "AccessiLearn", tagline: "Accessible learning platform", description: "AI-powered tool that automatically generates captions, transcripts, and alternative text for course materials to improve accessibility." },
    { title: "GitViz", tagline: "Visualize your Git history", description: "Interactive 3D visualization of Git repositories showing commit history, branch topology, and contributor patterns." },
    { title: "MealPrep Pro", tagline: "Budget meal planning for students", description: "Generates weekly meal plans based on grocery store deals, dietary preferences, and a student budget constraint." },
    { title: "LabQueue", tagline: "Virtual office hours queue", description: "Real-time queue management system for TA office hours with estimated wait times and virtual check-in." },
    { title: "BeaverRide", tagline: "Campus carpooling app", description: "Connects students commuting from the same areas with real-time ride matching and safety verification." },
    { title: "CodeReview AI", tagline: "Automated code review assistant", description: "LLM-powered code review tool that provides constructive feedback on student programming assignments." },
    { title: "SafeWalk", tagline: "Campus safety companion", description: "App that connects students walking alone at night with volunteer walking companions and campus safety resources." },
    { title: "ResearchMatch", tagline: "Connect undergrads with research", description: "Platform matching undergraduate students with faculty research opportunities based on skills and interests." },
    { title: "CourseFlow", tagline: "Degree planning visualizer", description: "Interactive prerequisite graph that helps students plan their course sequence and explore different degree paths." },
    { title: "BeaverMarket", tagline: "Student marketplace", description: "Buy and sell textbooks, furniture, and supplies with other OSU students. Includes price history and fair pricing suggestions." },
    { title: "FocusForest", tagline: "Collaborative study timer", description: "Pomodoro timer with a shared virtual forest that grows when your study group stays focused together." },
    { title: "ClubHub", tagline: "Student org discovery platform", description: "Centralized platform for discovering, joining, and managing student organizations with event calendars and communication tools." },
    { title: "ParkingFinder", tagline: "Real-time campus parking", description: "Crowdsourced real-time parking availability map for campus lots using ML predictions based on historical patterns." },
    { title: "HealthTrack", tagline: "Student wellness dashboard", description: "Holistic wellness tracker integrating sleep, exercise, nutrition, and mental health check-ins designed for college students." },
    { title: "BeaverAlerts", tagline: "Smart campus notifications", description: "Personalized notification system that aggregates and prioritizes campus announcements, deadlines, and events." },
    { title: "TutorConnect", tagline: "Peer tutoring marketplace", description: "Platform connecting students who need help with peer tutors, featuring scheduling, ratings, and subject matching." },
    { title: "EventSync", tagline: "Campus event aggregator", description: "Aggregates events from all campus sources into one searchable, filterable feed with calendar integration." },
    { title: "BeaverBudget", tagline: "Student finance tracker", description: "Financial planning tool designed for students with features for tracking tuition, loans, part-time income, and expenses." },
    { title: "SkillSwap", tagline: "Trade skills with peers", description: "Barter-style platform where students trade skills - teach guitar in exchange for web development lessons." },
    { title: "GreenCampus", tagline: "Campus sustainability tracker", description: "Dashboard tracking OSU's sustainability metrics with suggestions for how students can contribute to green initiatives." },
    { title: "NotesAI", tagline: "AI lecture note enhancer", description: "Upload rough lecture notes and get organized, formatted, and enriched study materials with key concept highlighting." },
    { title: "RecCenter+", tagline: "Gym crowd predictor", description: "Predicts Dixon Rec Center crowdedness using historical data and provides optimal workout time suggestions." },
    { title: "BeaverLink", tagline: "Alumni networking platform", description: "Connects current students with OSU alumni for mentorship, career advice, and networking opportunities." },
    { title: "CrashCourse", tagline: "Quick concept explainer", description: "AI tool that generates concise, visual explanations of complex academic concepts tailored to your course level." },
    { title: "HackTracker", tagline: "Hackathon project manager", description: "Project management tool specifically designed for hackathons with timeline tracking, task assignment, and submission checklist." },
  ];

  const submissions: { id: string; title: string }[] = [];

  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Student ${i + 1}`,
        email: `student${i + 1}@oregonstate.edu`,
        emailVerified: true,
      },
    });

    const participant = await prisma.hackathonParticipant.create({
      data: {
        userId: user.id,
        hackathonId: hackathon.id,
      },
    });

    const team = await prisma.team.create({
      data: {
        name: `Team ${projectIdeas[i].title}`,
        hackathonId: hackathon.id,
        creatorId: user.id,
        members: {
          create: {
            participantId: participant.id,
          },
        },
      },
    });

    // Each submission goes into 1-2 tracks
    const trackSubset = [tracks[0]]; // Everyone is in "Best Overall"
    if (i % 3 === 0) trackSubset.push(tracks[1]); // Every 3rd in "Best Use of AI"
    if (i % 4 === 0) trackSubset.push(tracks[2]); // Every 4th in "Best Social Impact"

    const submission = await prisma.submission.create({
      data: {
        teamId: team.id,
        hackathonId: hackathon.id,
        title: projectIdeas[i].title,
        tagline: projectIdeas[i].tagline,
        description: projectIdeas[i].description,
        githubUrl: `https://github.com/team-${i + 1}/${projectIdeas[i].title.toLowerCase().replace(/\s+/g, "-")}`,
        videoUrl: i % 2 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : "",
        tableNumber: i + 1,
        tracks: {
          connect: trackSubset.map((t) => ({ id: t.id })),
        },
      },
    });

    submissions.push({ id: submission.id, title: submission.title });
  }
  console.log(`Created 30 users, teams, and submissions\n`);

  // =========================================================================
  // 3. CREATE 10 JUDGES
  // =========================================================================

  const judgeNames = [
    "Dr. Sarah Chen",
    "Prof. Michael Torres",
    "Dr. Aisha Patel",
    "Prof. James Wilson",
    "Dr. Lisa Zhang",
    "Prof. David Kim",
    "Dr. Emily Johnson",
    "Prof. Robert Garcia",
    "Dr. Priya Sharma",
    "Prof. Chris Anderson",
  ];

  const judges = await Promise.all(
    judgeNames.map((name) =>
      prisma.judge.create({
        data: {
          hackathonId: hackathon.id,
          name,
          email: `${name.toLowerCase().replace(/[.\s]+/g, ".")}@oregonstate.edu`,
        },
      }),
    ),
  );
  console.log(`Created ${judges.length} judges`);

  // Assign all judges to the "Best Overall" track
  await prisma.judgeTrackAssignment.createMany({
    data: judges.map((j) => ({
      judgeId: j.id,
      trackId: tracks[0].id,
    })),
  });
  console.log(`Assigned all judges to "${tracks[0].name}" track\n`);

  // =========================================================================
  // 4. JUDGING PLAN: 3 ROUNDS (TRIAGE → RUBRIC → RANKED)
  // =========================================================================
  // Operating on "Best Overall" track with all 30 submissions
  // Round 1 (Triage): 30 → 10 (eliminate 20)
  // Round 2 (Rubric): 10 → 5 (eliminate 5)
  // Round 3 (Ranked): 5 → 3 winners

  const plan = await prisma.judgingPlan.create({
    data: {
      trackId: tracks[0].id,
      rounds: {
        create: [
          {
            roundNumber: 1,
            type: "TRIAGE",
            advanceCount: 10,
            judgesPerProject: 3,
            minutesPerProject: 3,
          },
          {
            roundNumber: 2,
            type: "RUBRIC",
            advanceCount: 5,
            judgesPerProject: 3,
            minutesPerProject: 7,
            rubricId: rubric.id,
          },
          {
            roundNumber: 3,
            type: "RANKED",
            advanceCount: 3,
            judgesPerProject: 10, // all judges see all finalists
            minutesPerProject: 10,
            rankedSlots: 5,
          },
        ],
      },
    },
    include: {
      rounds: { orderBy: { roundNumber: "asc" } },
    },
  });

  const [round1, round2, round3] = plan.rounds;
  console.log("Created judging plan:");
  console.log(`  Round 1 (Triage): 30 → 10`);
  console.log(`  Round 2 (Rubric): 10 → 5`);
  console.log(`  Round 3 (Ranked): 5 → 3 winners\n`);

  // =========================================================================
  // 5. ROUND 1: TRIAGE — Each project gets 3 judges, score 1-5 stars
  // =========================================================================

  console.log("=== ROUND 1: TRIAGE ===");

  // Auto-assign: 3 judges per project, load-balanced across 10 judges
  const round1Assignments: {
    roundId: string;
    judgeId: string;
    submissionId: string;
  }[] = [];
  const judgeWorkload = new Map<string, number>();
  judges.forEach((j) => judgeWorkload.set(j.id, 0));

  for (const sub of submissions) {
    const sortedJudges = [...judges].sort(
      (a, b) => (judgeWorkload.get(a.id) || 0) - (judgeWorkload.get(b.id) || 0),
    );
    for (const judge of sortedJudges.slice(0, 3)) {
      round1Assignments.push({
        roundId: round1.id,
        judgeId: judge.id,
        submissionId: sub.id,
      });
      judgeWorkload.set(judge.id, (judgeWorkload.get(judge.id) || 0) + 1);
    }
  }

  await prisma.roundJudgeAssignment.createMany({ data: round1Assignments });
  console.log(`  Assigned ${round1Assignments.length} judge-submission pairs`);

  // Activate round
  await prisma.judgingRound.update({
    where: { id: round1.id },
    data: { isActive: true, startedAt: new Date() },
  });

  // Simulate scoring — give higher scores to the "better" projects (lower index = better)
  const r1Assignments = await prisma.roundJudgeAssignment.findMany({
    where: { roundId: round1.id },
  });

  for (const assignment of r1Assignments) {
    const subIndex = submissions.findIndex(
      (s) => s.id === assignment.submissionId,
    );
    // Top projects get 4-5 stars, middle get 2-4, bottom get 1-3
    const baseStar = subIndex < 10 ? 4 : subIndex < 20 ? 3 : 1;
    const stars = Math.min(5, Math.max(1, baseStar + Math.floor(Math.random() * 2)));

    await prisma.triageScore.create({
      data: { assignmentId: assignment.id, stars },
    });
    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: { completed: true },
    });
  }
  console.log(`  All ${r1Assignments.length} triage scores submitted`);

  // Complete round 1 — calculate advancements
  const r1AssignmentsWithScores = await prisma.roundJudgeAssignment.findMany({
    where: { roundId: round1.id },
    include: { triageScore: true },
  });

  const triageScores = new Map<string, number[]>();
  for (const a of r1AssignmentsWithScores) {
    if (a.triageScore) {
      const scores = triageScores.get(a.submissionId) || [];
      scores.push(a.triageScore.stars);
      triageScores.set(a.submissionId, scores);
    }
  }

  const triageSorted = [...triageScores.entries()]
    .map(([submissionId, scores]) => ({
      submissionId,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  const round1Advancing = triageSorted.slice(0, 10);

  await prisma.roundAdvancement.createMany({
    data: round1Advancing.map((s, i) => ({
      roundId: round1.id,
      submissionId: s.submissionId,
      rank: i + 1,
    })),
  });

  await prisma.judgingRound.update({
    where: { id: round1.id },
    data: { isComplete: true, isActive: false },
  });

  console.log(`  Top 10 advance (avg stars):`);
  for (const s of round1Advancing) {
    const title = submissions.find((sub) => sub.id === s.submissionId)?.title;
    console.log(`    ${s.rank}. ${title} — ${s.avg.toFixed(1)}★`);
  }
  console.log();

  // =========================================================================
  // 6. ROUND 2: RUBRIC — 10 submissions, 4 criteria (max 10 each), 3 judges
  // =========================================================================

  console.log("=== ROUND 2: RUBRIC ===");

  const advancedIds = round1Advancing.map((s) => s.submissionId);

  // Assign judges to the 10 advancing submissions
  const round2Assignments: {
    roundId: string;
    judgeId: string;
    submissionId: string;
  }[] = [];
  const judgeWorkload2 = new Map<string, number>();
  judges.forEach((j) => judgeWorkload2.set(j.id, 0));

  for (const subId of advancedIds) {
    const sortedJudges = [...judges].sort(
      (a, b) =>
        (judgeWorkload2.get(a.id) || 0) - (judgeWorkload2.get(b.id) || 0),
    );
    for (const judge of sortedJudges.slice(0, 3)) {
      round2Assignments.push({
        roundId: round2.id,
        judgeId: judge.id,
        submissionId: subId,
      });
      judgeWorkload2.set(
        judge.id,
        (judgeWorkload2.get(judge.id) || 0) + 1,
      );
    }
  }

  await prisma.roundJudgeAssignment.createMany({ data: round2Assignments });
  console.log(`  Assigned ${round2Assignments.length} judge-submission pairs`);

  // Activate round
  await prisma.judgingRound.update({
    where: { id: round2.id },
    data: { isActive: true, startedAt: new Date() },
  });

  // Simulate rubric scoring
  const r2Assignments = await prisma.roundJudgeAssignment.findMany({
    where: { roundId: round2.id },
  });

  for (const assignment of r2Assignments) {
    const advRank = advancedIds.indexOf(assignment.submissionId);
    // Higher ranked submissions from round 1 tend to score higher
    const baseScore = advRank < 3 ? 8 : advRank < 6 ? 6 : 4;

    for (const criterion of rubric.criteria) {
      const value = Math.min(
        criterion.maxScore,
        Math.max(1, baseScore + Math.floor(Math.random() * 3) - 1),
      );
      await prisma.score.create({
        data: {
          assignmentId: assignment.id,
          criteriaId: criterion.id,
          value,
        },
      });
    }

    await prisma.roundJudgeAssignment.update({
      where: { id: assignment.id },
      data: { completed: true },
    });
  }
  console.log(`  All ${r2Assignments.length} rubric scores submitted`);

  // Complete round 2
  const r2AssignmentsWithScores = await prisma.roundJudgeAssignment.findMany({
    where: { roundId: round2.id },
    include: { rubricScores: true },
  });

  const rubricTotals = new Map<string, number>();
  for (const a of r2AssignmentsWithScores) {
    const total = a.rubricScores.reduce((sum, s) => sum + s.value, 0);
    rubricTotals.set(
      a.submissionId,
      (rubricTotals.get(a.submissionId) || 0) + total,
    );
  }

  const rubricSorted = [...rubricTotals.entries()]
    .map(([submissionId, score]) => ({ submissionId, score }))
    .sort((a, b) => b.score - a.score);

  const round2Advancing = rubricSorted.slice(0, 5);

  await prisma.roundAdvancement.createMany({
    data: round2Advancing.map((s, i) => ({
      roundId: round2.id,
      submissionId: s.submissionId,
      rank: i + 1,
    })),
  });

  await prisma.judgingRound.update({
    where: { id: round2.id },
    data: { isComplete: true, isActive: false },
  });

  console.log(`  Top 5 advance (total rubric score across 3 judges, 4 criteria):`);
  for (const s of round2Advancing) {
    const title = submissions.find((sub) => sub.id === s.submissionId)?.title;
    console.log(`    ${s.rank}. ${title} — ${s.score} pts`);
  }
  console.log();

  // =========================================================================
  // 7. ROUND 3: RANKED — All 10 judges rank the 5 finalists
  // =========================================================================

  console.log("=== ROUND 3: RANKED ===");

  const finalistIds = round2Advancing.map((s) => s.submissionId);

  // All judges see all 5 finalists
  const round3Assignments: {
    roundId: string;
    judgeId: string;
    submissionId: string;
  }[] = [];
  for (const judge of judges) {
    for (const subId of finalistIds) {
      round3Assignments.push({
        roundId: round3.id,
        judgeId: judge.id,
        submissionId: subId,
      });
    }
  }

  await prisma.roundJudgeAssignment.createMany({ data: round3Assignments });
  console.log(
    `  Assigned ${round3Assignments.length} judge-submission pairs (all judges × all finalists)`,
  );

  // Activate round
  await prisma.judgingRound.update({
    where: { id: round3.id },
    data: { isActive: true, startedAt: new Date() },
  });

  // Simulate ranked voting — each judge ranks all 5 finalists
  // Most judges agree on ordering but with some variance
  for (const judge of judges) {
    // Shuffle finalists slightly for this judge (mostly agree on order)
    const rankings = [...finalistIds];
    // Swap 1-2 adjacent pairs randomly for variety
    if (Math.random() > 0.4) {
      const swapIdx = Math.floor(Math.random() * (rankings.length - 1));
      [rankings[swapIdx], rankings[swapIdx + 1]] = [
        rankings[swapIdx + 1],
        rankings[swapIdx],
      ];
    }

    for (let rank = 0; rank < rankings.length; rank++) {
      const assignment = await prisma.roundJudgeAssignment.findUnique({
        where: {
          roundId_judgeId_submissionId: {
            roundId: round3.id,
            judgeId: judge.id,
            submissionId: rankings[rank],
          },
        },
      });

      if (assignment) {
        await prisma.rankedVote.create({
          data: {
            assignmentId: assignment.id,
            rank: rank + 1,
          },
        });
        await prisma.roundJudgeAssignment.update({
          where: { id: assignment.id },
          data: { completed: true },
        });
      }
    }
  }
  console.log(`  All ${judges.length} judges submitted rankings`);

  // Complete round 3 — Borda count
  const r3AssignmentsWithVotes = await prisma.roundJudgeAssignment.findMany({
    where: { roundId: round3.id },
    include: { rankedVote: true },
  });

  const rankedSlots = 5;
  const bordaPoints = new Map<string, number>();
  for (const a of r3AssignmentsWithVotes) {
    if (a.rankedVote) {
      const points = rankedSlots - a.rankedVote.rank + 1;
      bordaPoints.set(
        a.submissionId,
        (bordaPoints.get(a.submissionId) || 0) + points,
      );
    }
  }

  const rankedSorted = [...bordaPoints.entries()]
    .map(([submissionId, points]) => ({ submissionId, points }))
    .sort((a, b) => b.points - a.points);

  const winners = rankedSorted.slice(0, 3);

  await prisma.roundAdvancement.createMany({
    data: rankedSorted.map((s, i) => ({
      roundId: round3.id,
      submissionId: s.submissionId,
      rank: i + 1,
    })),
  });

  // Create TrackWinner records
  await prisma.trackWinner.createMany({
    data: winners.map((s, i) => ({
      trackId: tracks[0].id,
      submissionId: s.submissionId,
      place: i + 1,
    })),
  });

  await prisma.judgingRound.update({
    where: { id: round3.id },
    data: { isComplete: true, isActive: false },
  });

  console.log(`  Final rankings (Borda count, ${rankedSlots} slots, ${judges.length} judges):`);
  for (const s of rankedSorted) {
    const title = submissions.find((sub) => sub.id === s.submissionId)?.title;
    const place = rankedSorted.indexOf(s) + 1;
    const medal = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : `${place}th`;
    console.log(`    ${medal}. ${title} — ${s.points} pts`);
  }

  console.log("\n=== WINNERS ===");
  for (const w of winners) {
    const title = submissions.find((sub) => sub.id === w.submissionId)?.title;
    const place = winners.indexOf(w) + 1;
    const medal = place === 1 ? "1st" : place === 2 ? "2nd" : "3rd";
    console.log(`  ${medal} Place: ${title}`);
  }

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
