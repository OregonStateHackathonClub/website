import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
);

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
      await jwtVerify(token, JWT_SECRET);
      isValidToken = true;
    } catch (error) {
      console.error("JWT verification failed:", error);
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
