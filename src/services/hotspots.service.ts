import type { Filters } from "@/types/filters.type";
import type { Hotspot } from "@/types/hotspots.service.type";
import type {
  JoinOptions,
  PaginationOptions,
  PaginationResult,
  WithJoins,
} from "@/types/pagination.type";
import { queryData } from "./base.service";
import { supabase } from "@/lib/supabase";
import { addChatDocument, deleteChatDocument } from "./documents.service";

export const getHotspotById = async (
  hotspot_id: string,
  joinOptions?: JoinOptions
): Promise<WithJoins<Hotspot> | null> => {
  try {
    const result = await queryData<WithJoins<Hotspot>>(
      "hotspots",
      {
        conditions: [
          {
            column: "hotspot_id",
            operator: "eq",
            value: hotspot_id,
          },
        ],
      },
      { page: 1, limit: 1 },
      joinOptions
    );

    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    throw new Error("Failed to get hotspot by ID: " + (error as Error).message);
  }
};

export const getHotspots = async ({
  filters,
  pagination,
  joinOptions,
}: {
  filters?: Filters<Hotspot>;
  pagination?: PaginationOptions;
  joinOptions?: JoinOptions;
}): Promise<PaginationResult<WithJoins<Hotspot>>> => {
  try {
    let result = await queryData<WithJoins<Hotspot>>(
      "hotspots",
      filters,
      pagination,
      joinOptions
    );

    // Transform data to include id field for DataTable compatibility
    result.data = result.data.map((item) => ({
      ...item,
      id: item.hotspot_id?.toString() || "",
    }));

    return result;
  } catch (error) {
    throw new Error("Failed to get hotspots: " + (error as Error).message);
  }
};

export const getHotspotsByAreaId = async (
  area_id: string,
  joinOptions?: JoinOptions
): Promise<WithJoins<Hotspot>[]> => {
  try {
    const result = await queryData<WithJoins<Hotspot>>(
      "hotspots",
      {
        conditions: [
          {
            column: "area_id",
            operator: "eq",
            value: area_id,
          },
        ],
      },
      undefined,
      joinOptions
    );

    return result.data;
  } catch (error) {
    throw new Error(
      "Failed to get hotspots by area ID: " + (error as Error).message
    );
  }
};

export const getUnassignedHotspots = async (
  joinOptions?: JoinOptions
): Promise<WithJoins<Hotspot>[]> => {
  try {
    const result = await queryData<WithJoins<Hotspot>>(
      "hotspots",
      {
        conditions: [
          {
            column: "area_id",
            operator: "is",
            value: null,
          },
        ],
      },
      undefined,
      joinOptions
    );

    return result.data;
  } catch (error) {
    throw new Error(
      "Failed to get unassigned hotspots: " + (error as Error).message
    );
  }
};

export const addHotspotToArea = async (
  hotspot_id: string,
  area_id: string
): Promise<Hotspot> => {
  try {
    const updatedHotspot = await updateHotspot(hotspot_id, {
      area_id: parseInt(area_id),
    });
    return updatedHotspot;
  } catch (error) {
    throw new Error(
      "Failed to add hotspot to area: " + (error as Error).message
    );
  }
};

export const removeHotspotFromArea = async (
  hotspot_id: string
): Promise<Hotspot> => {
  try {
    const updatedHotspot = await updateHotspot(hotspot_id, {
      area_id: null,
    });
    return updatedHotspot;
  } catch (error) {
    throw new Error(
      "Failed to remove hotspot from area: " + (error as Error).message
    );
  }
};

export const pageContentBuilder = (hotspot: Hotspot) => {
  // fields that empty or undefined will not add to final string.
  let pageContent = "";
  for (const entry in Object.entries(hotspot)) {
    if (entry[1] && entry[1] !== "") {
      pageContent += `${entry[0]}: ${entry[1]}\n`;
    }
  }
  return pageContent;
};

export const createHotspot = async (
  hotspot: Partial<Hotspot>
): Promise<Hotspot> => {
  let ids = [];
  // generate uuid
  try {
    let response = await addChatDocument({
      page_content: `Tiêu đề: ${hotspot.title}\nMô tả: ${hotspot.description}\nĐịa chỉ: ${hotspot.address}\nWebsite: ${hotspot.website}`,
      metadata: {
        hotspot_id: hotspot.hotspot_id,
      },
    });
    ids = response.ids;
  } catch (error) {
    console.log("Failed to add hotspot to chat: " + (error as Error).message);
  }
  const { data, error } = await supabase
    .from("hotspots")
    .insert({
      ...hotspot,
      metadata: {
        ids: ids,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create hotspot: " + (error as Error).message);
  }

  return data;
};
export const updateHotspot = async (
  hotspot_id: string,
  hotspot: Partial<Hotspot>
): Promise<Hotspot> => {
  let currentHotspot = await getHotspotById(hotspot_id);
  let ids = currentHotspot?.metadata?.ids;
  let newIds = [];
  try {
    if (ids) {
      await deleteChatDocument(ids);
    }
  } catch (error) {
    console.log("Failed to delete hotspot chunks: " + (error as Error).message);
  }
  try {
    let response = await addChatDocument({
      page_content: `Tiêu đề: ${hotspot.title}\nMô tả: ${hotspot.description}\nĐịa chỉ: ${hotspot.address}\nWebsite: ${hotspot.website}`,
      metadata: {
        hotspot_id: hotspot_id,
      },
    });
    newIds = response.ids;
  } catch (error) {
    console.log("Failed to add hotspot to chat: " + (error as Error).message);
  }

  const { data, error } = await supabase
    .from("hotspots")
    .update({
      ...hotspot,
      metadata: {
        ids: newIds,
      },
    })
    .eq("hotspot_id", hotspot_id)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update hotspot: " + (error as Error).message);
  }

  return data;
};

export const deleteHotspot = async (hotspot_id: string): Promise<void> => {
  try {
    let hotspot = await getHotspotById(hotspot_id);
    let ids = hotspot?.metadata?.ids;
    if (ids) {
      await deleteChatDocument(ids);
    }
  } catch (error) {
    console.log("Failed to get hotspot: " + (error as Error).message);
  }

  const { error } = await supabase
    .from("hotspots")
    .delete()
    .eq("hotspot_id", hotspot_id);

  if (error) {
    throw new Error("Failed to delete hotspot: " + (error as Error).message);
  }
};

export const bulkDeleteHotspots = async (
  hotspot_ids: string[]
): Promise<void> => {
  const { error } = await supabase
    .from("hotspots")
    .delete()
    .in("hotspot_id", hotspot_ids);

  if (error) {
    throw new Error(
      "Failed to bulk delete hotspots: " + (error as Error).message
    );
  }
};

export const countHotspots = async (): Promise<any> => {
  const { count, error }: any = await supabase
    .from("hotspots")
    .select("*", { count: "exact", head: true });
  if (error) {
    throw new Error("Failed to count hotspots: " + error.message);
  }
  return count;
};

export const countHotspotsByAreaId = async (area_id: string): Promise<any> => {
  const { count, error }: any = await supabase
    .from("hotspots")
    .select("*", { count: "exact", head: true })
    .eq("area_id", area_id);
  if (error) {
    throw new Error("Failed to count hotspots by area ID: " + error.message);
  }
  return count;
};

export const countHotspotsByAccountId = async (
  account_id: string
): Promise<any> => {
  // First get the areas assigned to this account
  const { data: accountAreas, error: accountError } = await supabase
    .from("account_areas")
    .select("area_id")
    .eq("account_id", account_id);

  if (accountError) {
    throw new Error("Failed to get account areas: " + accountError.message);
  }

  if (!accountAreas || accountAreas.length === 0) {
    return 0;
  }

  // Get hotspot count for all assigned areas
  const areaIds = accountAreas.map((area) => area.area_id);
  let totalCount = 0;

  for (const areaId of areaIds) {
    const count = await countHotspotsByAreaId(areaId);
    totalCount += count;
  }

  return totalCount;
};

export const getPreviewHotspots = async (
  area_id: string
): Promise<Hotspot[]> => {
  const { data, error } = await supabase
    .from("hotspots")
    .select("*")
    .limit(5)
    .eq("area_id", area_id);
  if (error) {
    throw new Error("Failed to get preview hotspots: " + error.message);
  }
  return data;
};

export const getPreviewHotspotsWithAreas = async (): Promise<
  WithJoins<Hotspot>[]
> => {
  try {
    const result = await queryData<WithJoins<Hotspot>>(
      "hotspots",
      undefined,
      { limit: 20 },
      {
        joins: [
          {
            table: "areas",
            columns: "area_name",
            foreignKey: "area_id",
            alias: "area",
          },
        ],
      }
    );
    return result.data;
  } catch (error) {
    throw new Error(
      "Failed to get preview hotspots with areas: " + (error as Error).message
    );
  }
};
