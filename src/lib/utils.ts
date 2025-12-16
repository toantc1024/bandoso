import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  Filters,
  FilterCondition,
  SortOption,
} from "@/types/filters.type";
import type { PaginationOptions } from "@/types/pagination.type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for creating filters and pagination
export function createFilter<T>(
  conditions: FilterCondition<T>[] = []
): Filters<T> {
  return { conditions };
}

export function createFilterCondition<T>(
  column: keyof T,
  operator: FilterCondition<T>["operator"],
  value: any
): FilterCondition<T> {
  return { column, operator, value };
}

export function createSort<T>(
  column: keyof T,
  ascending: boolean = true
): SortOption<T> {
  return { column, ascending };
}

export function createSearch<T>(
  columns: (keyof T)[],
  query: string
): { columns: (keyof T)[]; query: string } {
  return { columns, query };
}

export function createPagination(
  page: number = 1,
  limit: number = 10
): PaginationOptions {
  return { page, limit };
}

// Helper function to build complex filters
export function buildFilters<T>(options: {
  conditions?: FilterCondition<T>[];
  sort?: SortOption<T>[];
  search?: { columns: (keyof T)[]; query: string };
}): Filters<T> {
  return {
    conditions: options.conditions,
    sort: options.sort,
    search: options.search,
  };
}

// Helper function for role-based access control
export function isUserAdmin(role?: string): boolean {
  return role === "admin";
}

export function isUserRoot(role?: string): boolean {
  return role === "root";
}

export function canUserAccessAllHotspots(role?: string): boolean {
  return isUserRoot(role);
}
