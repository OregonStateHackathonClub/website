import { put, del, list } from "@vercel/blob";

export async function uploadFile(
  file: File,
  folder?: string
): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;
  const path = folder ? `${folder}/${filename}` : filename;

  const blob = await put(path, file, {
    access: "public",
  });

  return blob.url;
}

export async function downloadFile(url: string): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const filename = url.split("/").pop() || "download";

  return { blob, filename };
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
