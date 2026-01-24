"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { type DraftInput, draftSchema, submissionSchema } from "./schema";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getSubmissionContext(hackathonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Not authenticated" } as const;
  }

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { userId: session.user.id, hackathonId },
    select: {
      id: true,
      teamMember: { select: { teamId: true } },
    },
  });

  if (!participant) {
    return { success: false, error: "Not registered for this hackathon" } as const;
  }

  return {
    success: true,
    participantId: participant.id,
    teamId: participant.teamMember?.teamId ?? null,
  } as const;
}

export async function saveDraft(
  hackathonId: string,
  data: DraftInput
): Promise<ActionResult<{ draftId: string }>> {
  const context = await getSubmissionContext(hackathonId);
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const validated = draftSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0]?.message ?? "Invalid input" };
  }

  const { teamId, participantId } = context;

  try {
    const whereClause = teamId ? { teamId } : { participantId };

    const draft = await prisma.draft.upsert({
      where: whereClause,
      create: {
        hackathonId,
        teamId,
        participantId: teamId ? null : participantId,
        title: validated.data.title ?? null,
        tagline: validated.data.tagline ?? null,
        description: validated.data.description ?? null,
        videoUrl: validated.data.videoUrl ?? null,
        githubUrl: validated.data.githubUrl ?? null,
        deploymentUrl: validated.data.deploymentUrl || null,
        otherLinks: validated.data.otherLinks ?? [],
        images: validated.data.images ?? [],
        tracks: validated.data.trackIds?.length
          ? { connect: validated.data.trackIds.map((id) => ({ id })) }
          : undefined,
      },
      update: {
        title: validated.data.title ?? null,
        tagline: validated.data.tagline ?? null,
        description: validated.data.description ?? null,
        videoUrl: validated.data.videoUrl ?? null,
        githubUrl: validated.data.githubUrl ?? null,
        deploymentUrl: validated.data.deploymentUrl || null,
        otherLinks: validated.data.otherLinks ?? [],
        images: validated.data.images ?? [],
        tracks: validated.data.trackIds?.length
          ? { set: validated.data.trackIds.map((id) => ({ id })) }
          : { set: [] },
      },
      select: { id: true },
    });

    return { success: true, data: { draftId: draft.id } };
  } catch (error) {
    console.error("Save draft error:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

export async function submitProject(
  hackathonId: string
): Promise<ActionResult<{ submissionId: string }>> {
  const context = await getSubmissionContext(hackathonId);
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const { teamId, participantId } = context;

  try {
    const whereClause = teamId ? { teamId } : { participantId };

    const draft = await prisma.draft.findFirst({
      where: whereClause,
      include: { tracks: { select: { id: true } } },
    });

    if (!draft) {
      return { success: false, error: "No draft found" };
    }

    const validated = submissionSchema.safeParse({
      title: draft.title,
      tagline: draft.tagline,
      description: draft.description,
      videoUrl: draft.videoUrl,
      images: draft.images,
      githubUrl: draft.githubUrl,
      deploymentUrl: draft.deploymentUrl,
      otherLinks: draft.otherLinks,
      trackIds: draft.tracks.map((t) => t.id),
    });

    if (!validated.success) {
      return {
        success: false,
        error: `Incomplete submission: ${validated.error.errors[0]?.message}`,
      };
    }

    const submissionWhereClause = teamId ? { teamId } : { participantId };
    const existingSubmission = await prisma.submission.findFirst({
      where: submissionWhereClause,
      select: { id: true },
    });

    let tableNumber: number | undefined;
    if (!existingSubmission) {
      const maxTable = await prisma.submission.aggregate({
        where: { hackathonId },
        _max: { tableNumber: true },
      });
      tableNumber = (maxTable._max.tableNumber ?? 0) + 1;
    }

    const submission = await prisma.submission.upsert({
      where: submissionWhereClause,
      create: {
        hackathonId,
        teamId,
        participantId: teamId ? null : participantId,
        title: validated.data.title,
        tagline: validated.data.tagline,
        description: validated.data.description,
        videoUrl: validated.data.videoUrl,
        githubUrl: validated.data.githubUrl,
        deploymentUrl: validated.data.deploymentUrl || null,
        otherLinks: validated.data.otherLinks,
        images: validated.data.images,
        tableNumber,
        tracks: { connect: validated.data.trackIds.map((id) => ({ id })) },
      },
      update: {
        title: validated.data.title,
        tagline: validated.data.tagline,
        description: validated.data.description,
        videoUrl: validated.data.videoUrl,
        githubUrl: validated.data.githubUrl,
        deploymentUrl: validated.data.deploymentUrl || null,
        otherLinks: validated.data.otherLinks,
        images: validated.data.images,
        tracks: { set: validated.data.trackIds.map((id) => ({ id })) },
      },
      select: { id: true },
    });

    revalidatePath(`/${hackathonId}`);
    revalidatePath(`/${hackathonId}/submission`);

    return { success: true, data: { submissionId: submission.id } };
  } catch (error) {
    console.error("Submit project error:", error);
    return { success: false, error: "Failed to submit project" };
  }
}

export async function uploadImages(
  hackathonId: string,
  formData: FormData
): Promise<ActionResult<{ urls: string[] }>> {
  const context = await getSubmissionContext(hackathonId);
  if (!context.success) {
    return { success: false, error: context.error };
  }

  const files = formData.getAll("file") as File[];
  if (files.length === 0) {
    return { success: false, error: "No files provided" };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Use PNG, JPG, or WEBP" };
    }
    if (file.size > maxSize) {
      return { success: false, error: "File too large. Maximum 5MB" };
    }
  }

  try {
    const urls: string[] = [];

    for (const file of files) {
      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      });
      urls.push(blob.url);
    }

    return { success: true, data: { urls } };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to upload images" };
  }
}

export async function deleteImage(url: string): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  if (!url.includes("vercel-storage.com")) {
    return { success: false, error: "Invalid URL" };
  }

  try {
    await del(url);
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
