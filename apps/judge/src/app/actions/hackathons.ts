"use server";

import { prisma, UserRole } from "@repo/database";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isAdmin } from "./auth";

export async function createHackathon(formData: FormData) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();

  if (!isUserAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    throw new Error("Hackathon name is required");
  }

  await prisma.hackathon.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/console");
}

export async function getHackathonsForUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  // If admin, return all hackathons
  if (user?.role === UserRole.ADMIN) {
    return await prisma.hackathon.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            submissions: true,
            teams: true,
            participants: true,
          },
        },
      },
    });
  }

  // If not admin, return only hackathons they're a judge/manager for
  const hackathons = await prisma.hackathon.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
          judge: {
            isNot: null,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          submissions: true,
          teams: true,
          participants: true,
        },
      },
    },
  });

  return hackathons;
}
