import { supabase } from "@/lib/supabase";
import type { FileBody } from "@/types/storage.service.type";

// Generate a UUID v4
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Normalize filename: remove spaces, special characters, and add UUID prefix
const normalizeFileName = (fileName: string): string => {
  // Get file extension
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : "";
  const nameWithoutExt =
    lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // Remove special characters and spaces, keep only alphanumeric, hyphens, and underscores
  const normalized = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-_]/g, "") // Remove special characters
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Generate UUID and combine with normalized name
  const uuid = generateUUID();
  return `${uuid}-${normalized}${extension}`;
};

export const uploadFile = async (
  file: FileBody,
  bucket: string,
  folder: string,
  file_name: string,
  upsert: boolean = false
) => {
  // Normalize the filename
  const normalizedFileName = normalizeFileName(file_name);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${folder}/${normalizedFileName}`, file, {
      upsert: upsert,
    });
  if (error) {
    throw error;
  }
  return { ...data, normalizedFileName };
};

export const retrievePublicUrl = (
  bucket: string,
  folder: string,
  file_name: string
) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(`${folder}/${file_name}`);
  const publicURL = data.publicUrl;
  return publicURL;
};
