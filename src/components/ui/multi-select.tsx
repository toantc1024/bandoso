"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  label: string;
  value: string;
}

export interface MultipleSelectorProps {
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  maxWidth?: string;
  maxVisibleItems?: number;
}

export function MultipleSelector({
  options,
  value: controlledValue,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  className,
  maxWidth = "w-[480px]",
  maxVisibleItems = 2,
}: MultipleSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string[]>([]);

  const value = controlledValue ?? internalValue;
  const setValue = onChange ?? setInternalValue;

  const handleSetValue = (val: string) => {
    if (value.includes(val)) {
      setValue(value.filter((item) => item !== val));
    } else {
      setValue([...value, val]);
    }
  };

  const handleRemoveItem = (val: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(value.filter((item) => item !== val));
  };

  const visibleItems = value.slice(0, maxVisibleItems);
  const hiddenCount = value.length - maxVisibleItems;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(maxWidth, "justify-between", className)}
        >
          <div className="flex gap-2 justify-start flex-wrap">
            {value?.length ? (
              <>
                {visibleItems.map((val, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-1 px-2 py-1 rounded-xl border bg-white/20 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/30 transition-colors"
                  >
                    <span>
                      {options.find((option) => option.value === val)?.label}
                    </span>
                    <button
                      onClick={(e) => handleRemoveItem(val, e)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <div className="px-2 py-1 rounded-xl border bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
                    +{hiddenCount} khác
                  </div>
                )}
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(maxWidth, "p-0")}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSetValue(option.value);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
