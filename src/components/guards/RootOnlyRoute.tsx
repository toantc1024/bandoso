import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { ROOT_ROLE } from "@/constants/role.constants";
import LoadingBlock from "@/components/blocks/LoadingBlock";

interface RootOnlyRouteProps {
  children: React.ReactNode;
}

export const RootOnlyRoute = ({ children }: RootOnlyRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingBlock message="Đang xác thực quyền truy cập..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Redirect to permission denied if not root user
  if (user?.role !== ROOT_ROLE) {
    return <Navigate to="/permission-denied" replace />;
  }

  return <>{children}</>;
};
