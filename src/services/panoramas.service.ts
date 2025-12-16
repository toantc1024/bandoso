import { supabase } from "@/lib/supabase";
import type { Panorama } from "@/types/panoramas.service.type";

export const getPanoramasByHotspotId = async (
  hotspot_id: number | string
): Promise<Panorama[]> => {
  const { data, error } = await supabase
    .from("panoramas")
    .select("*")
    .eq("hotspot_id", hotspot_id);

  if (error) {
    throw new Error("Failed to fetch panoramas: " + (error as Error).message);
  }

  return data || [];
};

export const createPanorama = async (
  panorama: Omit<Panorama, "created_at">
): Promise<Panorama> => {
  const { data, error } = await supabase
    .from("panoramas")
    .insert(panorama)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create panorama: " + (error as Error).message);
  }

  return data;
};

export const updatePanorama = async (
  panorama_id: string,
  panorama: Partial<Panorama>
): Promise<Panorama> => {
  const { data, error } = await supabase
    .from("panoramas")
    .update(panorama)
    .eq("panorama_id", panorama_id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update panorama: " + (error as Error).message);
  }

  return data;
};

export const deletePanorama = async (panorama_id: string): Promise<void> => {
  const { error } = await supabase
    .from("panoramas")
    .delete()
    .eq("panorama_id", panorama_id);

  if (error) {
    throw new Error("Failed to delete panorama: " + (error as Error).message);
  }
};

export const countPanoramas = async (): Promise<any> => {
  const { count, error }: any = await supabase
    .from("panoramas")
    .select('*', { count: 'exact', head: true });
  if (error) {
    throw new Error("Failed to count panoramas: " + error.message);
  }
  return count
};

export const countPanoramasByAreaId = async (area_id: string): Promise<any> => {
  // Since panoramas are linked to hotspots, and hotspots are linked to areas,
  // we need to count panoramas through the hotspots table
  const { data: hotspotIds, error: hotspotError } = await supabase
    .from("hotspots")
    .select("hotspot_id")
    .eq("area_id", area_id);

  if (hotspotError) {
    throw new Error("Failed to get hotspot IDs for area: " + hotspotError.message);
  }

  if (!hotspotIds || hotspotIds.length === 0) {
    return 0;
  }

  const hotspotIdArray = hotspotIds.map(h => h.hotspot_id);
  const { count, error } = await supabase
    .from("panoramas")
    .select('*', { count: 'exact', head: true })
    .in('hotspot_id', hotspotIdArray);

  if (error) {
    throw new Error("Failed to count panoramas by area ID: " + error.message);
  }
  return count
};

export const countPanoramasByAccountId = async (account_id: string): Promise<any> => {
  // First get the areas assigned to this account
  const { data: accountAreas, error: accountError } = await supabase
    .from("account_areas")
    .select("area_id")
    .eq("account_id", account_id)

  if (accountError) {
    throw new Error("Failed to get account areas: " + accountError.message);
  }

  if (!accountAreas || accountAreas.length === 0) {
    return 0;
  }

  // Get panorama count for all assigned areas
  const areaIds = accountAreas.map(area => area.area_id);
  let totalCount = 0;

  for (const areaId of areaIds) {
    const count = await countPanoramasByAreaId(areaId);
    totalCount += count;
  }

  return totalCount;
};
