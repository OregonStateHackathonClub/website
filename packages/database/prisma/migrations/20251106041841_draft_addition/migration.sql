-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "ShirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- CreateEnum
CREATE TYPE "JudgeRole" AS ENUM ('JUDGE', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "shirtSize" "ShirtSize" NOT NULL,
    "resumePath" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rubric" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_participant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lookingForTeammates" BOOLEAN NOT NULL DEFAULT false,
    "contact" TEXT,
    "creatorId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT,
    "tagline" TEXT,
    "description" TEXT,
    "githubUrl" TEXT,
    "videoUrl" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_track" (
    "draftId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "draft_track_pkey" PRIMARY KEY ("draftId","trackId")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "githubUrl" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "prize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_track" (
    "submissionId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "submission_track_pkey" PRIMARY KEY ("submissionId","trackId")
);

-- CreateTable
CREATE TABLE "judge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "magicLinkToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "judge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_assignment" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "role" "JudgeRole" NOT NULL DEFAULT 'JUDGE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "judge_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "rubricScores" JSONB NOT NULL DEFAULT '{}',
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "application_userId_key" ON "application"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_name_key" ON "hackathon"("name");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_participant_userId_hackathonId_key" ON "hackathon_participant"("userId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_participantId_key" ON "team_member"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "invite_code_key" ON "invite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "draft_teamId_key" ON "draft"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "submission_teamId_key" ON "submission"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "judge_email_key" ON "judge"("email");

-- CreateIndex
CREATE UNIQUE INDEX "judge_magicLinkToken_key" ON "judge"("magicLinkToken");

-- CreateIndex
CREATE UNIQUE INDEX "judge_assignment_judgeId_hackathonId_key" ON "judge_assignment"("judgeId", "hackathonId");

-- CreateIndex
CREATE UNIQUE INDEX "score_submissionId_judgeId_key" ON "score"("submissionId", "judgeId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_participant" ADD CONSTRAINT "hackathon_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_participant" ADD CONSTRAINT "hackathon_participant_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "hackathon_participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft" ADD CONSTRAINT "draft_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_track" ADD CONSTRAINT "draft_track_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_track" ADD CONSTRAINT "draft_track_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_track" ADD CONSTRAINT "submission_track_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_track" ADD CONSTRAINT "submission_track_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignment" ADD CONSTRAINT "judge_assignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_assignment" ADD CONSTRAINT "judge_assignment_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score" ADD CONSTRAINT "score_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score" ADD CONSTRAINT "score_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
