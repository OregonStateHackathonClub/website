"use server";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/app/actions/auth";

interface TrackInput {
  name: string;
  description: string;
  prize?: string;
  hackathonId: string;
}

export async function createTrack(formData: FormData) {
  if (!(await isAdmin())) {
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
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const trackId = formData.get("trackId") as string;
  const rubricName = formData.get("rubricName") as string;

  const criteria: Array<{ name: string; weight: number; maxScore: number }> =
    [];
  let index = 0;

  while (formData.get(`criteria[${index}].name`)) {
    criteria.push({
      name: formData.get(`criteria[${index}].name`) as string,
      weight: parseFloat(formData.get(`criteria[${index}].weight`) as string),
      maxScore: parseInt(
        formData.get(`criteria[${index}].maxScore`) as string,
        10,
      ),
    });
    index++;
  }

  // Check if rubric already exists for this track
  const existingRubric = await prisma.rubric.findUnique({
    where: { trackId: trackId },
    include: { criteria: true },
  });

  if (existingRubric) {
    // Update existing rubric
    await prisma.rubric.update({
      where: { id: existingRubric.id },
      data: {
        name: rubricName,
        criteria: {
          deleteMany: {}, // Delete all existing criteria
          create: criteria.map((c) => ({
            name: c.name,
            weight: c.weight,
            maxScore: c.maxScore,
          })),
        },
      },
    });
  } else {
    // Create new rubric
    await prisma.rubric.create({
      data: {
        name: rubricName,
        trackId: trackId,
        criteria: {
          create: criteria.map((c) => ({
            name: c.name,
            weight: c.weight,
            maxScore: c.maxScore,
          })),
        },
      },
    });
  }

  revalidatePath(`/console/${formData.get("hackathonId")}/tracks`);
}
