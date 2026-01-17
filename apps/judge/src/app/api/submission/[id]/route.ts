import { prisma } from "@repo/database";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const { id } = params;
  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        githubUrl: true,
        videoUrl: true,
        images: true,
        //status: true, deleted
      },
    });
    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ submission });
  } catch (e) {
    console.error("Fetch submission error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
