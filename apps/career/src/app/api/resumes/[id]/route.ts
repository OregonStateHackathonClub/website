import { downloadFile } from "@repo/storage";
import { jwtVerify } from "jose";
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

function isValidFilename(filename: string): boolean {
  // Prevent path traversal - only allow alphanumeric, dash, underscore, and dot
  // Must end with .pdf and not contain path separators
  const safePattern = /^[a-zA-Z0-9_-]+\.pdf$/;
  return safePattern.test(filename) && !filename.includes("..");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAuthorized = await verifySponsorAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: filename } = await params;

  if (!isValidFilename(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const { blob } = await downloadFile(filename);
    const buffer = await blob.arrayBuffer();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume not found" }, { status: 400 });
  }
}
