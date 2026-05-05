import { del, list, put } from "@vercel/blob";

export async function uploadFile(file: File, folder?: string): Promise<string> {
  const ext = file.name.match(/\.[^./\\]+$/)?.[0]?.toLowerCase() ?? "";
  const filename = `${crypto.randomUUID()}${ext}`;
  const path = folder ? `${folder}/${filename}` : filename;

  const blob = await put(path, file, {
    access: "public",
  });

  return blob.url;
}

const ALLOWED_BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export async function downloadFile(
  url: string,
): Promise<{ blob: Blob; filename: string; contentType: string }> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(ALLOWED_BLOB_HOST_SUFFIX)
  ) {
    throw new Error("Untrusted URL");
  }

  const response = await fetch(parsed.toString());
  if (!response.ok) {
    throw new Error(`Upstream blob fetch failed: ${response.status}`);
  }
  const blob = await response.blob();
  const filename = parsed.pathname.split("/").pop() || "download";
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";

  return { blob, filename, contentType };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export async function listFiles(folder?: string) {
  const { blobs } = await list({
    prefix: folder,
  });

  return blobs;
}

export * from "@vercel/blob";
