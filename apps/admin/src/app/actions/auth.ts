"use server";

import { prisma, UserRole } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
};

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSession();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return user;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return admin;
}
