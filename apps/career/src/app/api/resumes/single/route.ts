import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIX = ".public.blob.vercel-storage.com";

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

function isTrustedBlobUrl(input: string): URL | null {
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:") return null;
    if (!parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)) return null;
    if (!parsed.pathname.toLowerCase().endsWith(".pdf")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const isAuthorized = await verifySponsorAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const trusted = isTrustedBlobUrl(url);
  if (!trusted) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const upstream = await fetch(trusted.toString());
  if (!upstream.ok) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const filename = decodeURIComponent(
    trusted.pathname.split("/").pop() || "resume.pdf",
  );

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
