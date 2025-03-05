/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'CHECKED_IN');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED';
