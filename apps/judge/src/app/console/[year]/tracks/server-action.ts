"use server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

interface TrackInput {
  name: string;
  description: string;
  prize?: string;
  hackathonId: string;
}

export async function createTrack(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized: Must be logged in");
  }

  // Check if user is an admin by querying Prisma
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const trackData: TrackInput = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    prize: formData.get("prize") as string,
    hackathonId: formData.get("hackathonId") as string,
  };

  await prisma.track.create({
    data: trackData,
  });

  revalidatePath(`/console/${trackData.hackathonId}/tracks`);
}
