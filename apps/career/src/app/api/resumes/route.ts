import prisma from "@repo/database";
import { jwtVerify } from "jose";
import JSZip from "jszip";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export const maxDuration = 60;

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

function isTrustedBlobUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)
    );
  } catch {
    return false;
  }
}

function safeName(input: string): string {
  return input.replace(/[^a-zA-Z0-9_.-]+/g, "_").slice(0, 80) || "resume";
}

export async function GET(request: NextRequest) {
  const isAuthorized = await verifySponsorAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      where: { resumePath: { startsWith: "https://" } },
      select: {
        id: true,
        resumePath: true,
        user: { select: { name: true } },
      },
    });

    const zip = new JSZip();
    const usedNames = new Set<string>();

    for (const application of applications) {
      if (!isTrustedBlobUrl(application.resumePath)) continue;

      try {
        const response = await fetch(application.resumePath);
        if (!response.ok) continue;
        const buffer = new Uint8Array(await response.arrayBuffer());

        let name = `${safeName(application.user.name)}.pdf`;
        if (usedNames.has(name)) {
          name = `${safeName(application.user.name)}-${application.id.slice(-6)}.pdf`;
        }
        usedNames.add(name);
        zip.file(name, buffer);
      } catch (err) {
        console.error(
          `Error fetching resume for application ${application.id}`,
          err,
        );
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="resumes.zip"',
      },
    });
  } catch (err) {
    console.error("Bulk resume download failed", err);
    return NextResponse.json(
      { error: "Failed to build resume archive" },
      { status: 500 },
    );
  }
}
