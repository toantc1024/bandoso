import { LoginForm } from "@/components/blocks/LoginFormBlock";
import LoadingBlock from "@/components/blocks/LoadingBlock";
import { useAuthStore } from "@/stores/auth.store";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const { login, logout, isLoading, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const navigate = useNavigate();
  const { getSession } = useAuthStore();
  // Auto redirect authenticated users
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        navigate("/quan-ly", { replace: true });
      }
    })();
  }, [isAuthenticated, navigate, isNavigating]);

  const handleLogout = async () => {
    try {
      await logout();
      toast("Đã đăng xuất thành công!", {
        description: "Bạn đã được đăng xuất khỏi hệ thống",
      });
    } catch (error) {
      toast("Lỗi khi đăng xuất", {
        description: "Đã xảy ra lỗi trong quá trình đăng xuất",
      });
    }
  };

  const handleGoToDashboard = () => {
    setIsNavigating(true);
    navigate("/quan-ly", { replace: true });
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(""); // Clear any previous errors

      // Show loading toast
      toast("Đang đăng nhập...", {
        description:
          "Vui lòng chờ trong khi chúng tôi xác minh thông tin đăng nhập của bạn",
      });

      await login(email, password);

      toast("Đăng nhập thành công!", {
        description: `Chào mừng bạn trở lại, ${email}`,
      });

      // Set navigating state and navigate to admin dashboard
      setIsNavigating(true);
      setTimeout(() => {
        navigate("/quan-ly", { replace: true });
      }, 1500); // Show success message for 1.5 seconds before navigating
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi trong quá trình đăng nhập";
      setError(errorMessage);
      toast("Đăng nhập thất bại", {
        description: errorMessage,
        action: {
          label: "Thử lại",
          onClick: () => console.log("Retry login"),
        },
      });
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* Show loading when navigating to dashboard */}
      {isNavigating && (
        <LoadingBlock
          message="Đang chuyển hướng đến trang quản lý..."
        // variant="circle"
        />
      )}

      <div className="flex w-full max-w-sm flex-col gap-6">
        {isAuthenticated ? (
          <Dialog open={true}>
            <DialogContent showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Bạn đã đăng nhập</DialogTitle>
                <DialogDescription>
                  Chào mừng {user?.email}! Bạn đã đăng nhập vào hệ thống. Bạn
                  muốn làm gì tiếp theo?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading || isNavigating}
                >
                  {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
                </Button>
                <Button onClick={handleGoToDashboard} disabled={isNavigating}>
                  {isNavigating ? "Đang chuyển hướng..." : "Đi tới Dashboard"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
