import { getSessionCookie } from "@repo/auth";
import { type NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: [/*"/console/:path*",*/ "/create-team", "/invite"],
};

export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
	// THIS IS NOT SECURE!
	// This is the recommended approach to optimistically redirect users
	// We recommend handling auth checks in each page/route
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	return NextResponse.next();
}
