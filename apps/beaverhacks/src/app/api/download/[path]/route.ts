import { NextResponse } from "next/server"
import { downloadFile } from "@repo/storage"

export async function GET(request: Request, { params }: { params: { path: string }}): Promise<Response> {
  const { blob, filename } = await downloadFile(params.path)
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`
    }
  })
}