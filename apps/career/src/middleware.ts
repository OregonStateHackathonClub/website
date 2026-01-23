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

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("sponsor-auth")?.value;
  const isLoginPage = request.nextUrl.pathname === "/";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Verify JWT token
  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, getJwtSecret());
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  // If no valid token and not on login page, redirect to login
  if (!isValidToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If has valid token and on login page, redirect to sponsors
  if (isValidToken && isLoginPage) {
    return NextResponse.redirect(new URL("/sponsors", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
