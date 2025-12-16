import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | undefined;

function getPrisma() {
  if (_prisma) return _prisma;
  if (globalForPrisma.prisma) {
    _prisma = globalForPrisma.prisma;
    return _prisma;
  }
  
  _prisma = new PrismaClient();
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = _prisma;
  }
  
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});

export * from "@prisma/client";
export default prisma;
