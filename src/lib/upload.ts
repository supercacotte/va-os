import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// D11 révisée (23/07) : le filesystem Vercel est éphémère — le stockage disque
// local ci-dessous sera remplacé par Vercel Blob avant le premier usage réel.
// La validation type/taille est à conserver telle quelle.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const MAX_JSON_SIZE = 5 * 1024 * 1024;

export type UploadedMedia = { mediaType: "IMAGE"; mediaUrl: string };
export type UploadedFile = { fileUrl: string; fileName: string };

export async function saveMediaFile(file: File): Promise<UploadedMedia> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format de fichier non supporté (JPG, PNG, WEBP ou GIF uniquement).");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Fichier trop volumineux (max ${MAX_IMAGE_SIZE / (1024 * 1024)} Mo).`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return {
    mediaType: "IMAGE",
    mediaUrl: `/uploads/${filename}`,
  };
}

export async function saveJsonFile(file: File): Promise<UploadedFile> {
  const isJson = file.name.toLowerCase().endsWith(".json") || file.type === "application/json";
  if (!isJson) {
    throw new Error("Format de fichier non supporté (JSON uniquement).");
  }

  if (file.size > MAX_JSON_SIZE) {
    throw new Error(`Fichier trop volumineux (max ${MAX_JSON_SIZE / (1024 * 1024)} Mo).`);
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${crypto.randomUUID()}.json`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return {
    fileUrl: `/uploads/${filename}`,
    fileName: file.name,
  };
}
