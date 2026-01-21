"use server";

import { prisma, UserRole } from "@repo/database";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  _count: {
    hackathonParticipants: number;
  };
};

export async function getUsers(options?: {
  search?: string;
  role?: UserRole;
  limit?: number;
  offset?: number;
}): Promise<{ users: UserListItem[]; total: number }> {
  await requireAdmin();

  const where = {
    AND: [
      options?.search
        ? {
            OR: [
              { name: { contains: options.search, mode: "insensitive" as const } },
              { email: { contains: options.search, mode: "insensitive" as const } },
            ],
          }
        : {},
      options?.role ? { role: options.role } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        _count: { select: { hackathonParticipants: true } },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

export async function getUserById(userId: string) {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      applications: {
        include: {
          hackathon: true,
        },
        orderBy: { createdAt: "desc" },
      },
      hackathonParticipants: {
        include: {
          hackathon: true,
          teamMember: {
            include: {
              team: true,
            },
          },
        },
      },
    },
  });
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  // Prevent self-demotion
  if (admin.id === userId && role !== UserRole.ADMIN) {
    return { success: false, error: "Cannot remove your own admin role" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/users");
  return { success: true };
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();

  // Prevent self-deletion
  if (admin.id === userId) {
    return { success: false, error: "Cannot delete your own account" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/users");
  return { success: true };
}
