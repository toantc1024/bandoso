import type { Filters } from "@/types/filters.type";
import type {
  PaginationOptions,
  PaginationResult,
  JoinOptions,
  WithJoins,
} from "@/types/pagination.type";
import { queryData } from "./base.service";
import type { Area } from "@/types/areas.service.type";
import { supabase } from "@/lib/supabase";

export const getAreas = async ({
  filters,
  pagination,
  joinOptions,
}: {
  filters?: Filters<Area>;
  pagination?: PaginationOptions;
  joinOptions?: JoinOptions;
}): Promise<PaginationResult<WithJoins<Area>>> => {
  try {
    let result = await queryData<WithJoins<Area>>(
      "areas",
      filters,
      pagination,
      joinOptions
    );
    return result;
  } catch (error) {
    throw new Error("Failed to get areas: " + (error as Error).message);
  }
};

export const getAreaById = async (area_id: string): Promise<Area> => {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .eq("area_id", area_id)
    .single();
  if (error) {
    throw new Error("Failed to get area: " + error.message);
  }

  // Fetch metadata from main hotspot if exists
  if (data.main_hotspot_id) {
    const { data: mainHotspot } = await supabase
      .from("hotspots")
      .select("metadata")
      .eq("hotspot_id", data.main_hotspot_id)
      .single();
    if (mainHotspot?.metadata) {
      data.metadata = mainHotspot.metadata;
    }
  }
  return data;
};

export const createArea = async (areaData: Partial<Area>): Promise<Area> => {
  const { metadata, ...dbFields } = areaData;
  const { data, error } = await supabase
    .from("areas")
    .insert(dbFields)
    .select()
    .single();
  if (error) {
    throw new Error("Failed to create area: " + error.message);
  }
  return data;
};

export const updateArea = async (
  area_id: string,
  areaData: Partial<Area>
): Promise<Area> => {
  const { metadata, ...dbAreaFields } = areaData;

  const { data, error } = await supabase
    .from("areas")
    .update(dbAreaFields)
    .eq("area_id", area_id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update area: " + error.message);
  }

  // Store metadata inside main hotspot's metadata column
  if (metadata !== undefined && data.main_hotspot_id) {
    const { error: metaError } = await supabase
      .from("hotspots")
      .update({ metadata })
      .eq("hotspot_id", data.main_hotspot_id);

    if (!metaError) {
      data.metadata = metadata;
    } else {
      console.warn("Failed to update main hotspot metadata:", metaError.message);
    }
  }

  return data;
};

export const getArea = async (area_id: string): Promise<Area> => {
  return getAreaById(area_id);
};

export const deleteArea = async (area_id: string): Promise<void> => {
  const { error } = await supabase
    .from("areas")
    .delete()
    .eq("area_id", area_id);
  if (error) {
    throw new Error("Failed to delete area: " + error.message);
  }
};

export const deleteMultipleAreas = async (
  area_ids: string[]
): Promise<void> => {
  const { error } = await supabase
    .from("areas")
    .delete()
    .in("area_id", area_ids);
  if (error) {
    throw new Error("Failed to delete areas: " + error.message);
  }
};

export const countAreas = async (): Promise<any> => {
  const { count, error }: any = await supabase
    .from("areas")
    .select("*", { count: "exact", head: true });
  if (error) {
    throw new Error("Failed to count areas: " + error.message);
  }
  return count;
};

export const countAreasByAccountId = async (
  account_id: string
): Promise<any> => {
  const { count, error }: any = await supabase
    .from("account_areas")
    .select("*", { count: "exact", head: true })
    .eq("account_id", account_id);
  if (error) {
    throw new Error("Failed to count areas by account ID: " + error.message);
  }
  return count;
};

export const getPreviewAreas = async () => {
  const { data, error } = await supabase.from("areas").select("*").limit(20);
  if (error) {
    throw new Error("Failed to get preview areas: " + error.message);
  }
  return data;
};
