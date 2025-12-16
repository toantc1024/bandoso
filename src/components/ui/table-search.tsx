"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X } from "lucide-react";
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

  // Get the current search column, defaulting to the first searchable column
  const currentSearchColumn =
    filters.searchColumn ||
    (searchableColumns.length > 0 ? searchableColumns[0].key : "");

  const handleSearchChange = (value: string) => {
    const updatedFilters = { ...filters, search: value };

    // If no search column is set, automatically set it to the first searchable column
    if (!filters.searchColumn && searchableColumns.length > 0) {
      updatedFilters.searchColumn = searchableColumns[0].key;
    }

    onFiltersChange(updatedFilters);
  };

  const handleColumnChange = (value: string) => {
    onFiltersChange({ ...filters, searchColumn: value });
  };

  const handleActionClick = (action: TableAction<T>) => {
    if (action.confirmation) {
      setConfirmationModal({
        open: true,
        action,
      });
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
    setConfirmationModal({
      open: false,
      action: null,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={currentSearchColumn}
              onValueChange={handleColumnChange}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Chọn cột" />
              </SelectTrigger>
              <SelectContent>
                {searchableColumns.map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                      className="flex rounded-r-none  items-center gap-2"
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
                    className="text-muted-foreground rounded-l-none  hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Hành động chung (luôn hiển thị) */}
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
        {filters.columnFilters &&
          Object.keys(filters.columnFilters).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Bộ lọc đang áp dụng:
              </span>
              {Object.entries(filters.columnFilters).map(
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
                        onClick={() => {
                          const newColumnFilters = { ...filters.columnFilters };
                          delete newColumnFilters[columnKey];
                          onFiltersChange({
                            ...filters,
                            columnFilters: newColumnFilters,
                          });
                        }}
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
                onClick={() =>
                  onFiltersChange({ ...filters, columnFilters: {} })
                }
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
