import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Explicitly export Prisma types and enums (avoids Turbopack warning with `export *`)
export { PrismaClient, Prisma } from "@prisma/client";
export {
  UserRole,
  JudgeRole,
  ApplicationStatus,
  ShirtSize,
} from "@prisma/client";

export default prisma;
