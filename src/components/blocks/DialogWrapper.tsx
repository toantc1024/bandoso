import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DialogWrapperProps {
  // Trigger
  trigger: ReactNode;

  // Content
  children: ReactNode;

  // Header props
  showHeader?: boolean;
  headerIcon?: ReactNode;
  title?: string;
  description?: string;
  customHeader?: ReactNode; // Custom header content (replaces icon, title, description)

  // Footer props
  showFooter?: boolean;
  footerContent?: ReactNode;

  // Close button
  showCloseButton?: boolean;

  // Dialog sizing
  size?: "sm" | "md" | "lg" | "xl" | "full" | "entire";
  mobileSize?: "sm" | "md" | "lg" | "full" | "entire";

  // Custom styling
  className?: string;
  contentClassName?: string;

  // Custom scrollbar
  useCustomScrollbar?: boolean;

  // Custom close
  customClose?: boolean;

  // Controlled open state
  opened?: boolean;
  setOpened?: (open: boolean) => void;
}

const DialogWrapper = ({
  trigger,
  children,
  showHeader = true,
  headerIcon,
  title,
  description,
  customHeader,
  showFooter = false,
  footerContent,
  showCloseButton = true,
  size = "lg",
  mobileSize = "full",
  className = "",
  contentClassName = "",
  useCustomScrollbar = false,
  opened,
  setOpened,
}: DialogWrapperProps) => {
  const getSizeClasses = () => {
    // Mobile-first sizing (base classes)
    const mobileSizeMap = {
      sm: "max-w-sm w-[95vw] h-[70vh]",
      md: "max-w-md w-[95vw] h-[75vh]",
      lg: "max-w-lg w-[95vw] h-[85vh]",
      full: "w-[95vw] h-[95vh]",
      entire: "w-screen h-screen",
    };

    // Desktop/larger screen sizing (sm: breakpoint and above)
    const desktopSizeMap = {
      sm: "sm:max-w-sm sm:w-[400px] sm:h-[60vh]",
      md: "sm:max-w-md sm:w-[500px] sm:h-[75vh]",
      lg: "sm:max-w-lg sm:w-[600px] sm:h-[80vh]",
      xl: "sm:max-w-xl sm:w-[700px] sm:h-[85vh]",
      full: "sm:w-[95vw] sm:h-[95vh] sm:max-w-none",
      entire: "sm:w-screen sm:h-screen sm:max-w-none",
    };

    return `${mobileSizeMap[mobileSize]} ${desktopSizeMap[size]}`;
  };

  const scrollbarClass = useCustomScrollbar
    ? "hotspot-dialog-scroll"
    : "scrollbar-hide";

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className={`glass ${
          size !== "entire" ? "rounded-2xl !p-0" : "rounded-none"
        } border border-white/20 p-0 overflow-hidden flex flex-col ${getSizeClasses()} ${className}`}
        showCloseButton={false}
      >
        {/* Always include DialogTitle for accessibility */}
        {(!showHeader || !title) && (
          <VisuallyHidden.Root>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden.Root>
        )}

        {/* Header - Fixed */}
        {showHeader && (
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 border-b border-white/10">
            <div className="flex items-center justify-between">
              {customHeader ? (
                // Custom header content
                <div className="flex-1 min-w-0">{customHeader}</div>
              ) : (
                // Default header content
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {headerIcon && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl glass-light flex items-center justify-center flex-shrink-0">
                      {headerIcon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <DialogTitle className="text-white text-base sm:text-lg font-bold truncate">
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <DialogDescription className="text-white/60 text-xs sm:text-sm truncate">
                        {description}
                      </DialogDescription>
                    )}
                  </div>
                </div>
              )}
              {showCloseButton && (
                <DialogClose className="h-full" asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-7 h-7  sm:w-8 sm:h-8 p-0 glass-light glass-hover text-white/60 hover:text-white flex-shrink-0 ml-2"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DialogClose>
              )}
            </div>
          </DialogHeader>
        )}

        {/* Content - Scrollable */}
        <div
          className={`flex-1 overflow-y-auto ${scrollbarClass} px-4 pb-4 sm:px-6 ${
            size === "entire" ? "!p-0" : ""
          } ${contentClassName}`}
        >
          {children}
        </div>

        {/* Footer - Fixed */}
        {showFooter && footerContent && (
          <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex-shrink-0 border-t border-white/10 bg-black/20 ">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;
