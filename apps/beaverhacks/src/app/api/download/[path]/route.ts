import { NextResponse } from "next/server";
import { downloadFile } from "@repo/storage";

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string }> },
) {
  const { params } = context;
  const { path } = await params;

  const { blob, filename } = await downloadFile(path);
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}
