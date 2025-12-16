import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  Check,
} from "lucide-react";
import type { Column, SortConfig, TableFilters } from "@/types/table.type";

interface ColumnHeaderProps<T> {
  column: Column<T>;
  sortConfig?: SortConfig;
  onSortChange?: (sortConfig: SortConfig | null) => void;
  filters?: TableFilters;
  onFiltersChange?: (filters: TableFilters) => void;
}

export function ColumnHeader<T>({
  column,
  sortConfig,
  onSortChange,
  filters,
  onFiltersChange,
}: ColumnHeaderProps<T>) {
  const [filterOpen, setFilterOpen] = useState(false);
  const isSorted = sortConfig?.key === column.key;
  const sortDirection = isSorted ? sortConfig.direction : null;
  const isFiltered = filters?.columnFilters?.[column.key];

  const handleSort = (direction: "asc" | "desc") => {
    if (onSortChange) {
      if (isSorted && sortDirection === direction) {
        onSortChange(null); // Xóa sắp xếp
      } else {
        onSortChange({ key: column.key, direction });
      }
    }
  };

  const handleFilter = (value: string) => {
    if (onFiltersChange && filters) {
      const newColumnFilters = { ...filters.columnFilters };
      if (value === "all" || value === "") {
        delete newColumnFilters[column.key];
      } else {
        newColumnFilters[column.key] = value;
      }
      onFiltersChange({
        ...filters,
        columnFilters: newColumnFilters,
      });
    }
    setFilterOpen(false);
  };

  const clearFilter = () => {
    if (onFiltersChange && filters) {
      const newColumnFilters = { ...filters.columnFilters };
      delete newColumnFilters[column.key];
      onFiltersChange({
        ...filters,
        columnFilters: newColumnFilters,
      });
    }
  };

  const getSortIcon = () => {
    if (!isSorted) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        {column.sortable && onSortChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
              >
                <span>{column.label}</span>
                {getSortIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleSort("asc")}>
                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Tăng dần
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("desc")}>
                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Giảm dần
              </DropdownMenuItem>
              {isSorted && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSortChange(null)}>
                    <X className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                    Xóa sắp xếp
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="font-medium">{column.label}</span>
        )}
      </div>

      {column.filterable && column.filterOptions && onFiltersChange && (
        <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${
                isFiltered ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <Filter
                className={`h-4 w-4 ${isFiltered ? "fill-current" : ""}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => handleFilter("all")}
              className="flex items-center justify-between"
            >
              <span>Tất cả</span>
              {!isFiltered && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {column.filterOptions.map((option) => {
              const isSelected =
                filters?.columnFilters?.[column.key] === option.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleFilter(option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              );
            })}
            {isFiltered && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearFilter}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-3.5 w-3.5" />
                  Xóa bộ lọc
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
