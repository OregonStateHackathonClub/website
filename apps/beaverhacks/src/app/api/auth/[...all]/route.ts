import { auth, toNextJsHandler } from "@repo/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

function isAllowedOrigin(origin: string): boolean {
  if (origin.match(/^http:\/\/localhost:\d+$/)) return true;
  if (origin === "https://beaverhacks.org") return true;
  if (origin.match(/^https:\/\/[\w-]+\.beaverhacks\.org$/)) return true;
  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && isAllowedOrigin(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = await handler.GET(req);
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const res = await handler.POST(req);
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
