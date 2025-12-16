"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ConfirmationModal } from "./confirmation-modal";
import type { RowAction } from "@/types/table.type";

interface RowActionsDropdownProps<T> {
  row: T;
  actions: RowAction<T>[];
}

export function RowActionsDropdown<T>({
  row,
  actions,
}: RowActionsDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    action: RowAction<T> | null;
  }>({
    open: false,
    action: null,
  });

  if (actions.length === 0) return null;

  const handleActionClick = (action: RowAction<T>) => {
    if (action.confirmation) {
      setConfirmationModal({
        open: true,
        action,
      });
    } else {
      action.onClick(row);
    }
    setOpen(false);
  };

  const handleConfirm = () => {
    if (confirmationModal.action) {
      confirmationModal.action.onClick(row);
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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled?.(row)}
              className={
                action.variant === "destructive" ? "text-destructive" : ""
              }
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
