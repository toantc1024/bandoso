import { supabase } from "@/lib/supabase";
import type { Filters } from "@/types/filters.type";
import type {
  PaginationOptions,
  PaginationResult,
  JoinOptions,
} from "@/types/pagination.type";
import { applyFilters, applyPagination } from "@/utils/query.utils";
import { structureJoinedData } from "@/utils/join.utils";

export interface QueryBase {
  key: string;
  value: string;
}
export interface GetVectorRequest {
  queries: QueryBase[];
  limit?: number;
  offset?: string;
}


export async function queryData<T>(
  tableName: string,
  filters?: Filters<T>,
  pagination?: PaginationOptions,
  joinOptions?: JoinOptions,
  autoStructure: boolean = true
): Promise<PaginationResult<T>> {
  // Determine what columns to select
  const selectColumns = joinOptions?.columns || "*";

  // Build the select string with joins
  let selectString = selectColumns;
  if (joinOptions?.joins && joinOptions.joins.length > 0) {
    // Build joins using the new structure
    const joinStrings = joinOptions.joins.map((join) => {
      const columns = join.columns || "*";
      const tableName = join.alias || join.table;

      // Use table name as the key, with foreignKey for relationship definition
      if (join.foreignKey) {
        return `${tableName}:${join.table}!${join.foreignKey}(${columns})`;
      } else {
        return `${tableName}(${columns})`;
      }
    });

    const joinString = joinStrings.join(",");
    selectString = `${selectColumns},${joinString}`;
  }

  let countQuery = supabase
    .from(tableName)
    .select(selectColumns, { count: "exact", head: true });
  countQuery = applyFilters(countQuery, filters);

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw new Error(countError.message);
  }

  let dataQuery = supabase.from(tableName).select(selectString);
  dataQuery = applyFilters(dataQuery, filters);
  dataQuery = applyPagination(dataQuery, pagination);

  const { data, error } = await dataQuery;

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;
  const limit = pagination?.limit || 10;
  const page = pagination?.page || 1;
  const totalPages = Math.ceil(total / limit);

  // Auto-structure joined data if joins are present and autoStructure is enabled
  let processedData = data as T[];
  console.log("Raw data from query:", data);
  if (
    autoStructure &&
    joinOptions &&
    (joinOptions.joins?.length || joinOptions.columns?.includes("("))
  ) {
    processedData = structureJoinedData<T>(data || []);
  }

  return {
    data: processedData,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
