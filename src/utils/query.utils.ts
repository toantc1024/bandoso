import type { Filters, FilterCondition } from "@/types/filters.type";
import type { PaginationOptions } from "@/types/pagination.type";

// Helper function to apply filters to a query
export function applyFilters<T>(query: any, filters?: Filters<T>) {
  if (!filters) return query;

  // Apply filter conditions
  if (filters.conditions) {
    filters.conditions.forEach((condition: FilterCondition<T>) => {
      const column = condition.column as string;

      switch (condition.operator) {
        case "eq":
          query = query.eq(column, condition.value);
          break;
        case "neq":
          query = query.neq(column, condition.value);
          break;
        case "gt":
          query = query.gt(column, condition.value);
          break;
        case "gte":
          query = query.gte(column, condition.value);
          break;
        case "lt":
          query = query.lt(column, condition.value);
          break;
        case "lte":
          query = query.lte(column, condition.value);
          break;
        case "like":
          query = query.like(column, condition.value);
          break;
        case "ilike":
          query = query.ilike(column, condition.value);
          break;
        case "in":
          query = query.in(column, condition.value);
          break;
        case "is":
          query = query.is(column, condition.value);
          break;
        case "not":
          query = query.not(column, condition.value);
          break;
      }
    });
  }

  // Apply search across multiple columns
  if (filters.search && filters.search.query) {
    const searchConditions = filters.search.columns
      .map((column) => `${column as string}.ilike.%${filters.search!.query}%`)
      .join(",");
    query = query.or(searchConditions);
  }

  // Apply sorting
  if (filters.sort) {
    filters.sort.forEach((sortOption) => {
      const column = sortOption.column as string;
      query = query.order(column, { ascending: sortOption.ascending ?? true });
    });
  }

  return query;
}

// Helper function to apply pagination to a query
export function applyPagination(query: any, pagination?: PaginationOptions) {
  if (!pagination) return query;

  const { page = 1, limit = 10, offset } = pagination;

  if (offset !== undefined) {
    query = query.range(offset, offset + limit - 1);
  } else {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);
  }

  return query;
}
