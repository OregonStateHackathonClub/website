import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const SPONSOR_PASSWORD = process.env.SPONSOR_PASSWORD;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === SPONSOR_PASSWORD) {
      // Create a signed JWT token
      const token = await new SignJWT({ authorized: true })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .setIssuedAt()
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true });

      // Set httpOnly cookie with the JWT token
      response.cookies.set("sponsor-auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}
