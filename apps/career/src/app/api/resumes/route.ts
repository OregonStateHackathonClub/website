import { NextResponse } from "next/server";
import JSZip from "jszip";
import prisma from "@repo/database";
import { downloadFile } from "@repo/storage";

export async function GET() {
  const applications = await prisma.application.findMany({
    include: { user: true },
  });

  const zip = new JSZip();

  for (const application of applications) {
    try {
      const { blob } = await downloadFile(application.resumePath);
      zip.file(`${application.user.name}.pdf`, blob);
    } catch (err) {
      console.error(
        `Error fetching resume for user ${application.userId}`,
        err,
      );
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return new NextResponse(Buffer.from(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="resumes.zip"',
    },
  });
}
