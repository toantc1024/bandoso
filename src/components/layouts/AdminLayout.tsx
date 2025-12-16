import { Outlet, Navigate } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/blocks/AppSidebarBlock";
import { AppBreadcrumb } from "@/components/blocks/AppBreadcumBlock";
import { useAuthStore } from "@/stores/auth.store";
import LoadingBlock from "@/components/blocks/LoadingBlock";
import { useEffect } from "react";
import { getCurrentUser } from "@/services/auth.service";

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    (async () => {
      let session = await getCurrentUser();
      if (session) {
        // User is logged in
      } else {
        // logout user
        useAuthStore.getState().clearUser();
      }
    })();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingBlock message="Đang tải..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-2">
            <AppBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
