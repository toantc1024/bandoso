import type { Asset } from "./asset.type";
import type { Document as DocumentType } from "./document.type";

export interface Hotspot {
  id: string; // Add this for DataTable compatibility
  hotspot_id: number;
  area_id: number | null;
  title: string | null;
  description: string;
  address: string | null;
  website: string | null;
  geolocation: Record<string, any> | null;
  documents: DocumentType[] | null;
  assets: Asset[] | null;
  preview_image: string | null;
  click_panorama_id: string | null;
  created_at: string | null;
  metadata: Record<string, any> | null;
}
