import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { downloadFile } from "@repo/storage";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, resumePath: true, name: true },
  });
  if (!application?.resumePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (application.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { blob, contentType } = await downloadFile(application.resumePath);
    const safe = application.name.replace(/[^\w.-]/g, "_") || "resume";
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/jpeg"
          ? "jpg"
          : "pdf";
    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${safe}.${ext}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Resume not available" },
      { status: 502 },
    );
  }
}
