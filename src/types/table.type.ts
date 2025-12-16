import type React from "react";

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: Array<{ label: string; value: string }>;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export interface RowAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive" | "outline";
  disabled?: (row: T) => boolean;
  confirmation?: ConfirmationConfig;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: "default" | "destructive" | "outline";
  confirmation?: ConfirmationConfig;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface TableFilters {
  search?: string;
  searchColumn?: string;
  columnFilters?: Record<string, string>;
  [key: string]: any;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPaginationChange?: (page: number, pageSize: number) => void;
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
  sortConfig?: SortConfig | null;
  onSortChange?: (sortConfig: SortConfig | null) => void;
  actions?: TableAction<T>[];
  rowActions?: RowAction<T>[];
  rowActionsDisplay?: "buttons" | "dropdown";
  onCreateClick?: () => void;
  createButtonLabel?: string;
}
