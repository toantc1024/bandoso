import type { TableFilters, SortConfig, Column } from "@/types/table.type";
import type { Filters, SortOption } from "@/types/filters.type";

/**
 * Converts table filters and sort configuration to API filters format
 * @param tableFilters - The filters from the table component
 * @param sortConfig - The sort configuration from the table component
 * @param columns - The column definitions to help with search column resolution
 * @returns API-compatible filters object
 */
export function convertTableFiltersToApiFilters<T>(
  tableFilters: TableFilters,
  sortConfig?: SortConfig | null,
  columns?: Column<T>[]
): Filters<T> {
  const apiFilters: Filters<T> = {};

  // Handle search functionality
  if (tableFilters.search && tableFilters.search.trim()) {
    let searchColumn = tableFilters.searchColumn;

    // If no search column is specified, use the first filterable column
    if (!searchColumn && columns && columns.length > 0) {
      const firstSearchableColumn = columns.find(
        (col) => col.filterable === true
      );
      searchColumn = firstSearchableColumn?.key;
    }

    // Only add search if we have both query and column
    if (searchColumn) {
      apiFilters.search = {
        columns: [searchColumn as keyof T],
        query: tableFilters.search.trim(),
      };
    }
  }

  // Handle column filters
  if (
    tableFilters.columnFilters &&
    Object.keys(tableFilters.columnFilters).length > 0
  ) {
    apiFilters.conditions = Object.entries(tableFilters.columnFilters).map(
      ([column, value]) => ({
        column: column as keyof T,
        operator: "eq" as const,
        value,
      })
    );
  }

  // Handle sorting
  if (sortConfig) {
    apiFilters.sort = [
      {
        column: sortConfig.key as keyof T,
        ascending: sortConfig.direction === "asc",
      } as SortOption<T>,
    ];
  }

  return apiFilters;
}

/**
 * Gets the effective search column for table filters
 * @param tableFilters - The table filters
 * @param columns - The column definitions
 * @returns The search column key or undefined
 */
export function getEffectiveSearchColumn<T>(
  tableFilters: TableFilters,
  columns: Column<T>[]
): string | undefined {
  if (tableFilters.searchColumn) {
    return tableFilters.searchColumn;
  }

  const firstSearchableColumn = columns.find((col) => col.filterable === true);
  return firstSearchableColumn?.key;
}
