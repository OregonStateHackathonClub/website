import { headers } from "next/headers";
import { prisma } from "@repo/database";
import { auth } from "@repo/auth";
import { ApplicationStatus } from "@repo/database";

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await request.json();
  const { applicationId, status } = data;

  if (!applicationId || !status) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status as ApplicationStatus,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json(updatedApplication);
  } catch (error) {
    console.error("Failed to update check-in status:", error);
    return new Response("Failed to update check-in status", { status: 500 });
  }
}
