"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSearch } from "@/components/ui/table-search";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { TablePagination } from "@/components/ui/table-pagination";
import { RowActionsButtons } from "@/components/ui/row-actions-buttons";
import { RowActionsDropdown } from "@/components/ui/row-actions-dropdown";
import { ColumnHeader } from "@/components/ui/column-header";
import type { DataTableProps } from "@/types/table.type";

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  onPaginationChange,
  filters = {},
  onFiltersChange,
  sortConfig,
  onSortChange,
  actions = [],
  rowActions = [],
  rowActionsDisplay = "buttons",
  onCreateClick,
  createButtonLabel,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r.id !== row.id));
    }
  };

  const isRowSelected = (row: T) => selectedRows.some((r) => r.id === row.id);
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const clearSelection = () => setSelectedRows([]);

  return (
    <div className="space-y-4">
      {onFiltersChange && (
        <TableSearch
          columns={columns}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onCreateClick={onCreateClick}
          createButtonLabel={createButtonLabel}
          selectedRows={selectedRows}
          actions={actions}
          onClearSelection={clearSelection}
        />
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el)
                      (el as HTMLInputElement).indeterminate = isIndeterminate;
                  }}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  <ColumnHeader
                    column={column}
                    sortConfig={sortConfig ?? undefined}
                    onSortChange={onSortChange}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                  />
                </TableHead>
              ))}
              {rowActions.length > 0 && (
                <TableHead
                  className={rowActionsDisplay === "buttons" ? "w-32" : "w-12"}
                >
                  <span className="sr-only">Hành động</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton
                rows={5}
                columns={columns.length + (rowActions.length > 0 ? 1 : 0)}
              />
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Checkbox
                      checked={isRowSelected(row)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(row, checked as boolean)
                      }
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] || "")}
                    </TableCell>
                  ))}
                  {rowActions.length > 0 && (
                    <TableCell>
                      {rowActionsDisplay === "buttons" ? (
                        <RowActionsButtons row={row} actions={rowActions} />
                      ) : (
                        <RowActionsDropdown row={row} actions={rowActions} />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPaginationChange && (
        <TablePagination
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      )}
    </div>
  );
}
