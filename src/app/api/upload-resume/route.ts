import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob"
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const config = {
    api: {
        bodyParser: false,
    },
};

// async function getAuthUser() {
//     const session = await auth.api.getSession({ headers: headers() });
//     return session?.user ?? null;
// }

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: 'public', allowOverwrite: true })

    return NextResponse.json(blob)
}

// export async function GET(request: NextRequest) {
//     try {
//         const user = await getAuthUser();
//         if (!user) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         const application = await prisma.application.findFirst({
//             where: {
//                 userId: user.id,
//             }
//         });

//         if (application) {
            // const blobURL = application.resumeFile;
            // const response = await fetch(blobURL);
//             if (!response.ok) {
//                 return NextResponse.json({ error: 'Failed to retrieve resume blob' }, { status: 500 });
//             }
//             const blob = await response.blob();
//             const resumeBlob = new File([blob], "hello.pdf")
//             return NextResponse.json({ resumeBlob: resumeBlob })
//         }
//         else {
//             return NextResponse.json({ blob: null });
//         }

//     }
//     catch (error) {
//         console.log("Failed to get resume blob: ", error);
//         return NextResponse.json({ error: 'Failed to retrieve resume blob' }, { status: 500 });
//     }
// }