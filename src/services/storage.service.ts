import { supabase } from "@/lib/supabase";
import type { FileBody } from "@/types/storage.service.type";

export const uploadFile = async (
  file: FileBody,
  bucket: string,
  folder: string,
  file_name: string,
  upsert: boolean = false
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${folder}/${file_name}`, file, {
      upsert: upsert,
    });
  if (error) {
    throw error;
  }
  return data;
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
