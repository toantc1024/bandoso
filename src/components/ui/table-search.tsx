"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, X, Filter, Check } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { Column, TableFilters, TableAction } from "@/types/table.type";

interface TableSearchProps<T> {
  columns: Column<T>[];
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
  onCreateClick?: () => void;
  createButtonLabel?: string;
  selectedRows?: T[];
  actions?: TableAction<T>[];
  onClearSelection?: () => void;
}

export function TableSearch<T>({
  columns,
  filters,
  onFiltersChange,
  onCreateClick,
  createButtonLabel = "Tạo mới",
  selectedRows = [],
  actions = [],
  onClearSelection,
}: TableSearchProps<T>) {
  const searchableColumns = columns.filter((col) => col.filterable === true);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    action: TableAction<T> | null;
  }>({
    open: false,
    action: null,
  });

  const handleSearchChange = (value: string) => {
    const updatedFilters = { ...filters, search: value };
    if (!filters.searchColumn && searchableColumns.length > 0) {
      updatedFilters.searchColumn = searchableColumns[0].key;
    }
    onFiltersChange(updatedFilters);
  };

  const handleFilterSelect = (columnKey: string, value: string) => {
    const newColumnFilters = { ...filters.columnFilters };
    if (value === "" || value === "all") {
      delete newColumnFilters[columnKey];
    } else {
      newColumnFilters[columnKey] = value;
    }
    onFiltersChange({
      ...filters,
      columnFilters: Object.keys(newColumnFilters).length > 0 ? newColumnFilters : undefined,
      search: filters.search,
      searchColumn: filters.searchColumn,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search,
      searchColumn: filters.searchColumn,
    });
  };

  const handleActionClick = (action: TableAction<T>) => {
    if (action.confirmation) {
      setConfirmationModal({ open: true, action });
    } else {
      action.onClick(selectedRows);
    }
  };

  const handleConfirm = () => {
    if (confirmationModal.action) {
      confirmationModal.action.onClick(selectedRows);
    }
  };

  const closeConfirmation = () => {
    setConfirmationModal({ open: false, action: null });
  };

  const columnsWithFilters = columns.filter(
    (col) => col.filterable && col.filterOptions && col.filterOptions.length > 0
  );

  const hasActiveFilters =
    filters.columnFilters && Object.keys(filters.columnFilters).length > 0;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter funnel dropdowns — one per filterable column with options */}
            {columnsWithFilters.map((column) => {
              const currentValue = filters.columnFilters?.[column.key];
              const currentOption = column.filterOptions?.find(
                (opt) => opt.value === currentValue
              );
              const isFiltered = !!currentValue;

              return (
                <DropdownMenu key={column.key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isFiltered ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-1.5 h-9 ${
                        isFiltered ? "" : "text-muted-foreground"
                      }`}
                    >
                      <Filter className={`h-4 w-4 ${isFiltered ? "" : ""}`} />
                      {isFiltered && currentOption ? (
                        <span className="max-w-[120px] truncate text-xs">
                          {currentOption.label}
                        </span>
                      ) : (
                        <span className="text-xs">{column.label}</span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem
                      onClick={() => handleFilterSelect(column.key, "")}
                      className="flex items-center justify-between"
                    >
                      <span>Tất cả {column.label}</span>
                      {!isFiltered && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {column.filterOptions?.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleFilterSelect(column.key, option.value)}
                        className="flex items-center justify-between"
                      >
                        <span>{option.label}</span>
                        {currentValue === option.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}

            {/* Hành động đa lựa chọn */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-0 ml-4 border-[1px] rounded-lg">
                {actions
                  .filter((action) => action.variant === "destructive")
                  .map((action, index) => (
                    <Button
                      key={index}
                      variant="destructive"
                      size="sm"
                      onClick={() => handleActionClick(action)}
                      className="flex rounded-r-none items-center gap-2"
                    >
                      {action.icon}
                      {action.label} ({selectedRows.length})
                    </Button>
                  ))}
                {onClearSelection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                    className="text-muted-foreground rounded-l-none hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Hành động chung */}
          <div className="flex items-center gap-2">
            {actions
              .filter((action) => action.variant !== "destructive")
              .map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
          </div>

          {onCreateClick && (
            <Button onClick={onCreateClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {createButtonLabel}
            </Button>
          )}
        </div>

        {/* Hiển thị bộ lọc đang hoạt động */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Bộ lọc đang áp dụng:
            </span>
            {Object.entries(filters.columnFilters!).map(
              ([columnKey, filterValue]) => {
                const column = columns.find((col) => col.key === columnKey);
                const filterOption = column?.filterOptions?.find(
                  (opt) => opt.value === filterValue
                );
                if (!column || !filterOption) return null;
                return (
                  <Badge
                    key={columnKey}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <span className="font-medium">{column.label}:</span>
                    <span>{filterOption.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleFilterSelect(columnKey, "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              }
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>

      {confirmationModal.action && (
        <ConfirmationModal
          open={confirmationModal.open}
          onOpenChange={closeConfirmation}
          title={confirmationModal.action.confirmation!.title}
          description={confirmationModal.action.confirmation!.description}
          confirmText={confirmationModal.action.confirmation!.confirmText}
          cancelText={confirmationModal.action.confirmation!.cancelText}
          onConfirm={handleConfirm}
          variant={
            confirmationModal.action.variant === "destructive"
              ? "destructive"
              : "default"
          }
        />
      )}
    </>
  );
}
