import prisma from "@repo/database";
import { downloadFile } from "@repo/storage";
import { jwtVerify } from "jose";
import JSZip from "jszip";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const isAuthorized = await verifySponsorAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    include: { user: true },
  });

  const zip = new JSZip();

  for (const application of applications) {
    try {
      const { blob } = await downloadFile(application.resumePath);
      zip.file(`${application.user.name}.pdf`, blob);
    } catch (err) {
      console.error(
        `Error fetching resume for user ${application.userId}`,
        err,
      );
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return new NextResponse(Buffer.from(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="resumes.zip"',
    },
  });
}
