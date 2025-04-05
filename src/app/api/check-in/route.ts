import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { ApplicationStatus } from "@prisma/client";

export async function POST(request: Request): Promise<Response> {
  const { user } = await getCurrentSession();

  if (!user || user.role !== "ADMIN") {
    return new Response('Unauthorized', { status: 401 });
  }

  const data = await request.json();
  const { applicationId, status } = data;

  if (!applicationId || !status) {
    return new Response('Missing required fields', { status: 400 });
  }

  try {
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        status: status as ApplicationStatus
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return Response.json(updatedApplication);
  } catch (error) {
    console.error('Failed to update check-in status:', error);
    return new Response('Failed to update check-in status', { status: 500 });
  }
}