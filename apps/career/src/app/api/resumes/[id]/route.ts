import { downloadFile } from "@repo/storage";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: filename } = await params;
  try {
    const { blob } = await downloadFile(filename);
    const buffer = await blob.arrayBuffer();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume not found" }, { status: 400 });
  }
}
