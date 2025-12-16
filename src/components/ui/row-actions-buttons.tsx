"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "./confirmation-modal";
import type { RowAction } from "@/types/table.type";

interface RowActionsButtonsProps<T> {
  row: T;
  actions: RowAction<T>[];
}

export function RowActionsButtons<T>({
  row,
  actions,
}: RowActionsButtonsProps<T>) {
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
      <div className="flex items-center gap-1">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={
              action.variant === "destructive" ? "destructive" : "outline"
            }
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={action.disabled?.(row)}
            className="h-8 px-2"
            title={action.label} // Add tooltip for accessibility
          >
            {action.icon && <span className="">{action.icon}</span>}
            {action.label === "" ? null : (
              <span className="hidden sm:inline">{action.label}</span>
            )}
          </Button>
        ))}
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
