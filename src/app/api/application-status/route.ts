import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getAuthUser() {
    const session = await auth.api.getSession({ headers: headers() });
    return session?.user ?? null;
}

export async function POST(req: NextRequest) {
    try {
        const { name, email, school, graduationYear, resumeFile } = await req.json();

        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const existingApplication = await prisma.application.findFirst({
            where: {
                userId: user.id,
            },
        });

        let updatedApplication;

        if (existingApplication) {
            updatedApplication = await prisma.application.update({
                where: {
                    id: existingApplication.id,
                },
                data: {
                    name,
                    email,
                    school,
                    graduationYear,
                    resumeFile,
                },
            });
        }
        else {
            updatedApplication = await prisma.application.create({
                data: {
                    name,
                    school,
                    graduationYear,
                    userId: user.id,
                    email: email,
                    resumeFile,
                    applicationSubmitted: false,
                },
            });
        }

        return NextResponse.json({ message: 'Application progress saved successfully!', application: updatedApplication });

    }
    catch (error) {
        console.log("Failed to save application progress: ", error);
        return NextResponse.json({ error: 'Failed to save application progress' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const application = await prisma.application.findFirst({
            where: {
                userId: user.id,
            }
        });

        if (application) {
            return NextResponse.json({ application });
        }
        else {
            return NextResponse.json({ application: null });
        }

    }
    catch (error) {
        console.log("Failed to get application data: ", error);
        return NextResponse.json({ error: 'Failed to retrieve application data' }, { status: 500 });
    }
}