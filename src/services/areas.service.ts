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
  return data;
};

export const createArea = async (area: Partial<Area>): Promise<Area> => {
  const { data, error } = await supabase
    .from("areas")
    .insert(area)
    .select()
    .single();
  if (error) {
    throw new Error("Failed to create area: " + error.message);
  }
  return data;
};

export const updateArea = async (
  area_id: string,
  area: Partial<Area>
): Promise<Area> => {
  const { data, error } = await supabase
    .from("areas")
    .update(area)
    .eq("area_id", area_id)
    .select()
    .single();
  if (error) {
    throw new Error("Failed to update area: " + error.message);
  }
  return data;
};

export const getArea = async (area_id: string): Promise<Area> => {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .eq("area_id", area_id)
    .single();
  if (error) {
    throw new Error("Failed to get area: " + error.message);
  }
  return data;
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
