import type { Asset } from "./asset.type";
import type { Document as DocumentType } from "./document.type";

export interface NhaCoCong {
  id: string;
  nha_cua_ai: string;
  ten_liet_si: string;
  ngay_sinh?: string;
  ngay_mat?: string;
  que_quan?: string;
  tieu_su?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

export interface TuyenDuong {
  id: string;
  name: string;
  description?: string;
  ngay_sinh?: string;
  ngay_mat?: string;
  que_quan?: string;
  color?: string;
  points: [number, number][];
  images?: string[];
}

export interface HotspotMetadata {
  ids?: string[];
  audio_url?: string | null;
  [key: string]: any;
}

export interface Hotspot {
  id: string;
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
  metadata: HotspotMetadata | null;
}
