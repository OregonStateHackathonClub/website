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

export async function createRubric(formData: FormData) {
    // Authentication and authorization checks
     const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized: Must be logged in");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }

    const trackId = formData.get("trackId") as string;
    const rubricName = formData.get("rubricName") as string;

    const criteria: Array<{name: string; weight: number; maxScore: number;}> = [];
    let index = 0

    while (formData.get(`criteria[${index}].name`)) {
        criteria.push({
            name: formData.get(`criteria[${index}].name`) as string,
            weight: parseFloat(formData.get(`criteria[${index}].weight`) as string),
            maxScore: parseInt(formData.get(`criteria[${index}].maxScore`) as string, 10)
        })
        index++;
    }

    await prisma.rubric.create({
        data: {
            name: rubricName,
            trackId: trackId,
            criteria: {
                create: criteria.map(c=> ({
                    name: c.name,
                    weight: c.weight,
                    maxScore: c.maxScore
                }))
            }
        }
    })

    revalidatePath(`/console/${formData.get("hackathonId")}/tracks`);
}