"use server";
import { JudgeRole, prisma, UserRole } from "@repo/database";
import { isAdmin } from "./auth";

export type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hackathonParticipants: {
    id: string;
    hackathonId: string;
    judge: {
      role: JudgeRole;
      id: string;
    } | null;
  }[];
};

export async function userSearch(
  search: string,
  hackathonId: string = "",
  role: UserRole | JudgeRole | null = null,
): Promise<UserSearchResult[] | false> {
  if (!isAdmin()) return false;
  const users = await prisma.user.findMany({
    where: {
      AND: [
        // Filter by hackathon
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
        // Filter by User/Superadmin
        ...(role && Object.values(UserRole).includes(role as UserRole)
          ? [{ role: role as UserRole }]
          : []),

        // Filter by Judge/Admin
        ...(role && Object.values(JudgeRole).includes(role as JudgeRole)
          ? [
              {
                hackathonParticipants: {
                  some: {
                    judge: {
                      is: {
                        role: role as JudgeRole,
                      },
                    },
                  },
                },
              },
            ]
          : []),

        // Search by name, id, email
        {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              id: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    select: {
      name: true,
      id: true,
      email: true,
      role: true,
      hackathonParticipants: {
        select: {
          id: true,
          hackathonId: true,
          judge: {
            select: {
              role: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!users) {
    return false;
  }

  return users;
}

export async function removeUser(id: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return false;

    if (!isAdmin()) return false;

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
  if (!isAdmin()) return false;

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
