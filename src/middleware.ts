import { NextResponse, NextRequest } from "next/server";

type SessionToken = {
  id: number
  googleId: string
  email: string
  name: string
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
	if (request.method === "GET") {
		return NextResponse.next(

		);
	}
	const originHeader = request.headers.get("Origin");
	const hostHeader = request.headers.get("Host");

	if (originHeader === null || hostHeader === null) {
		return new NextResponse(null, {
			status: 403
		});
	}

	let origin: URL;
	try {
		origin = new URL(originHeader);
	} catch {
		return new NextResponse(null, {
			status: 403
		});
	}

	if (origin.host !== hostHeader) {
		return new NextResponse(null, {
			status: 403
		});
	}

	return NextResponse.next();
}