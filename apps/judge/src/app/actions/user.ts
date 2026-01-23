"use server";
import { prisma, UserRole } from "@repo/database";
import { isAdmin } from "./auth";

export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  judges: {
    id: string;
    hackathonId: string;
  }[];
};

export async function userSearch(
  search: string,
  hackathonId: string = "",
  role: UserRole | null = null,
): Promise<UserSearchResult[] | false> {
  if (!(await isAdmin())) return false;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        // Filter by hackathon (as participant)
        ...(hackathonId
          ? [
              {
                hackathonParticipants: {
                  some: {
                    hackathonId: hackathonId,
                  },
                },
              },
            ]
          : []),
        // Filter by User/Admin role
        ...(role && Object.values(UserRole).includes(role as UserRole)
          ? [{ role: role as UserRole }]
          : []),
        // Search by name, id, email
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { id: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      name: true,
      id: true,
      email: true,
      role: true,
    },
  });

  if (!users) {
    return false;
  }

  // Fetch judge records for these users by email
  const emails = users.map((u) => u.email);
  const judges = await prisma.judge.findMany({
    where: {
      email: { in: emails },
      ...(hackathonId ? { hackathonId } : {}),
    },
    select: {
      id: true,
      email: true,
      hackathonId: true,
    },
  });

  return users.map((user) => ({
    ...user,
    judges: judges
      .filter((j) => j.email === user.email)
      .map((j) => ({
        id: j.id,
        hackathonId: j.hackathonId,
      })),
  }));
}

export async function removeUser(id: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return false;

    if (!(await isAdmin())) return false;

    await prisma.user.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function setAdmin(
  adminValue: boolean,
  userId: string,
): Promise<boolean> {
  if (!(await isAdmin())) return false;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: adminValue ? UserRole.ADMIN : UserRole.USER,
    },
  });

  return false;
}
