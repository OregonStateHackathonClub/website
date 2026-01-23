"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SPONSOR_PASSWORD = process.env.SPONSOR_PASSWORD;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function login(
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  if (password !== SPONSOR_PASSWORD) {
    return { success: false, error: "Invalid password" };
  }

  const token = await new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set("sponsor-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("sponsor-auth");
}

export async function requireSponsor(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sponsor-auth")?.value;

  if (!token) {
    throw new Error("Unauthorized: Sponsor access required");
  }

  try {
    await jwtVerify(token, getJwtSecret());
  } catch {
    throw new Error("Unauthorized: Invalid or expired token");
  }
}

export async function verifySponsorToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}
