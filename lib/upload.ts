import { randomUUID } from "crypto";
import { access, mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE ?? 5 * 1024 * 1024);

const getExtension = (file: File) => {
  const ext = path.extname(file.name || "").toLowerCase();
  if (ext) {
    return ext;
  }
  const typePart = file.type.split("/")[1];
  return typePart ? `.${typePart}` : ".png";
};

export async function saveUploadedImage(file: File, folder = "uploads") {
  if (!file || file.size === 0) {
    return null;
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image is too large.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${randomUUID()}${getExtension(file)}`;
  const customDir = process.env.UPLOAD_DIR;
  const uploadDir = customDir
    ? path.resolve(process.cwd(), customDir)
    : path.join(process.cwd(), "public", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/${folder}/${fileName}`;
}

async function removeIfExists(targetPath: string) {
  try {
    await access(targetPath);
    await unlink(targetPath);
  } catch {
    // Ignore missing files or permission errors.
  }
}

export async function deleteUploadedFile(fileUrl?: string | null) {
  if (!fileUrl) return;

  let pathname = fileUrl;
  if (fileUrl.startsWith("http")) {
    try {
      pathname = new URL(fileUrl).pathname;
    } catch {
      return;
    }
  }

  if (!pathname.startsWith("/")) return;

  const relative = pathname.replace(/^\/+/, "");
  if (!relative || relative.includes("..")) return;
  if (!relative.startsWith("uploads")) return;

  const customDir = process.env.UPLOAD_DIR
    ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
    : null;
  const publicPath = path.join(process.cwd(), "public", relative);
  const fileName = path.basename(relative);
  const candidates = new Set<string>();

  candidates.add(publicPath);
  if (customDir) {
    candidates.add(path.join(customDir, relative));
    candidates.add(path.join(customDir, fileName));
  }

  for (const target of candidates) {
    await removeIfExists(target);
  }
}
