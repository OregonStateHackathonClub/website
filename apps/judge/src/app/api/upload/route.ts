import { auth } from "@repo/auth";
import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function isVercelBlobUrl(urlStr: string) {
  try {
    const u = new URL(urlStr);
    return u.host.endsWith("vercel-storage.com");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  // Check if user is logged in to upload a image
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to upload files." },
      { status: 401 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Server not configured for Blob uploads." },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const entries = form.getAll("file");
  const files: File[] = entries.filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `File too large. Max ${Math.floor(MAX_BYTES / (1024 * 1024))}MB`,
        },
        { status: 413 },
      );
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 415 },
      );
    }
  }

  function guessExt(file: File) {
    const fromName = file.name?.split(".").pop()?.toLowerCase();
    if (fromName) return fromName;
    if (file.type === "image/png") return "png";
    if (file.type === "image/jpeg") return "jpg";
    if (file.type === "image/webp") return "webp";
    if (file.type === "application/pdf") return "pdf";
    return "bin";
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const ext = guessExt(file);
        const filename = `uploads/${crypto.randomUUID()}.${ext}`;
        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type,
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
        });
        return blob.url;
      }),
    );
    if (uploads.length === 1) {
      return NextResponse.json({ url: uploads[0] }, { status: 201 });
    }
    return NextResponse.json({ urls: uploads }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // Check if user is logged in to delete blob
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to delete files." },
      { status: 401 },
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Server not configured for Blob deletes." },
      { status: 500 },
    );
  }
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url || !isVercelBlobUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
