import type { TuyenDuong, NhaCoCong } from "./hotspots.service.type";

export interface AreaMetadata {
  bg_music_url?: string;
  nha_co_cong?: NhaCoCong[];
  tuyen_duong?: TuyenDuong[];
  [key: string]: any;
}

export interface Area {
  area_id: string;
  area_name: string;
  domain: string;
  main_hotspot_id?: string | null;
  created_at?: string;
  chatbot_limit_request?: number;
  is_active?: boolean;
  description?: string;
  metadata?: AreaMetadata | null;
}
