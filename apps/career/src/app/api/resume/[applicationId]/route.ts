import prisma from "@repo/database";
import { downloadFile } from "@repo/storage";
import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

async function verifySponsorAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("sponsor-auth")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  if (!(await verifySponsorAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { resumePath: true, name: true },
  });
  if (!application?.resumePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { blob } = await downloadFile(application.resumePath);
    const safe = application.name.replace(/[^\w.-]/g, "_") || "resume";
    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safe}.pdf"`,
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
