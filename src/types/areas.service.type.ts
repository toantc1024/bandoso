export interface Area {
  area_id: string;
  area_name: string;
  domain: string;
  main_hotspot_id?: string | null;
  created_at?: string;
  chatbot_limit_request?: number;
  is_active?: boolean;
  description?: string;
}
