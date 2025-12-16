import { useEffect } from "react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface LoadingBlockProps {
  size?: number;
  message?: string;
  className?: string;
  variant?: "default" | "circle" | "pinwheel" | "circle-filled" | "ellipsis";
  preventBrowserClose?: boolean;
  progressMessages?: string[];
  currentStep?: number;
}

const LoadingBlock = ({
  size = 64,
  message = "Đang tải...",
  className = "",
  preventBrowserClose = false,
  progressMessages = [],
  currentStep = 0,
}: LoadingBlockProps) => {

  // Prevent browser close when critical operation is running
  useEffect(() => {
    if (!preventBrowserClose) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Đang thực hiện thao tác quan trọng. Bạn có chắc chắn muốn thoát không?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [preventBrowserClose]);
  const getCurrentMessage = () => {
    if (progressMessages.length > 0 && currentStep < progressMessages.length) {
      return progressMessages[currentStep];
    }
    return message;
  };

  return (
    <div
      className={`fixed h-screen inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}
    >
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          <Spinner className="text-primary" size={size} variant={"default"} />

          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-foreground animate-pulse">
              {getCurrentMessage()}
            </div>

            {progressMessages.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Bước {currentStep + 1} / {progressMessages.length}
              </div>
            )}

            {preventBrowserClose && (
              <div className="text-xs  rounded-md p-2 mt-4">
                Vui lòng không đóng trình duyệt trong quá trình này
              </div>
            )}
          </div>

          {/* Progress bar for multi-step operations */}
          {progressMessages.length > 1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / progressMessages.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact loading component for use inside modals
interface InModalLoadingProps {
  message?: string;
  size?: number;
  variant?: "default" | "circle" | "pinwheel" | "circle-filled" | "ellipsis";
  progressMessages?: string[];
  currentStep?: number;
}

export const InModalLoading = ({
  message = "Đang xử lý...",
  size = 32,
  variant = "default",
  progressMessages = [],
  currentStep = 0,
}: InModalLoadingProps) => {
  const getCurrentMessage = () => {
    if (progressMessages.length > 0 && currentStep < progressMessages.length) {
      return progressMessages[currentStep];
    }
    return message;
  };

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      <Spinner className="text-primary" size={size} variant={variant} />

      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-foreground animate-pulse">
          {getCurrentMessage()}
        </div>

        {progressMessages.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Bước {currentStep + 1} / {progressMessages.length}
          </div>
        )}
      </div>

      {/* Progress bar for multi-step operations */}
      {progressMessages.length > 1 && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / progressMessages.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LoadingBlock;
