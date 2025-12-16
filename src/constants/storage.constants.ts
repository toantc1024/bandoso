export const BUCKET_NAME = import.meta.env.VITE_STORAGE_BUCKET_NAME;
export const HOTSPOTS_FOLDER_NAME = import.meta.env
  .VITE_STORAGE_HOTSPOTS_FOLDER_NAME;
export const PANORAMAS_FOLDER_NAME = import.meta.env
  .VITE_STORAGE_PANORAMAS_FOLDER_NAME;
export const DOCUMENTS_FOLDER_NAME = import.meta.env
  .VITE_STORAGE_DOCUMENTS_FOLDER_NAME;
export const ASSETS_FOLDER_NAME =
  import.meta.env.VITE_STORAGE_ASSETS_FOLDER_NAME || "assets/base";

export const combinePath = (folder_name: string, scope: any) => {
  // replace the word "base" in by scope
  if (!scope) {
    return folder_name;
  }
  return folder_name.replace("base", scope);
};
