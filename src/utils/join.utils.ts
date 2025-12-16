import type { PaginationResult } from "@/types/pagination.type";

/**
 * Transforms joined data to a structured format:
 * - Main table columns stay at root level
 * - Joined tables become arrays under their table name as key
 * - Handles both one-to-one and one-to-many relationships
 */
export function structureJoinedData<T>(data: any[]): T[] {
  return data.map((item) => {
    const structured: any = {};

    // First, copy all primitive fields (main table columns)
    Object.keys(item).forEach((key) => {
      const value = item[key];

      // If it's not an object or is null/date, keep it as main table column
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value instanceof Date
      ) {
        structured[key] = value;
      }
    });

    // Then, structure joined table data
    Object.keys(item).forEach((key) => {
      const value = item[key];

      // If it's an object (joined table data) and not null/undefined/date
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        // Always make it an array for consistency (handles both one-to-one and one-to-many)
        structured[key] = [value];
      }
    });

    return structured as T;
  });
}

/**
 * Alternative version that preserves single objects for one-to-one relationships
 * and creates arrays only for actual arrays from one-to-many
 */
export function structureJoinedDataSmart<T>(data: any[]): T[] {
  return data.map((item) => {
    const structured: any = {};

    // First, copy all primitive fields (main table columns)
    Object.keys(item).forEach((key) => {
      const value = item[key];

      // If it's not an object or is null/date, keep it as main table column
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        value instanceof Date
      ) {
        structured[key] = value;
      }
    });

    // Then, structure joined table data
    Object.keys(item).forEach((key) => {
      const value = item[key];

      // If it's an object (joined table data) and not null/undefined/date
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        // Keep as single object if it's one-to-one
        structured[key] = value;
      } else if (Array.isArray(value)) {
        // Keep as array if it's already an array (one-to-many)
        structured[key] = value;
      }
    });

    return structured as T;
  });
}

/**
 * Utility to create a paginated service function with structured joins
 */
export function createStructuredService<TStructured = any>(
  tableName: string,
  queryDataFunction: Function
) {
  return async (
    filters?: any,
    pagination?: any,
    joinOptions?: any,
    forceArrays: boolean = true
  ): Promise<PaginationResult<TStructured>> => {
    const result = await queryDataFunction(
      tableName,
      filters,
      pagination,
      joinOptions
    );

    // Structure the data with table names as keys
    const structuredData = forceArrays
      ? structureJoinedData<TStructured>(result.data)
      : structureJoinedDataSmart<TStructured>(result.data);

    return {
      ...result,
      data: structuredData,
    };
  };
}
