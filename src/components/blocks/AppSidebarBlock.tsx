import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Bot, LogOut, User, Home, MapIcon, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { ROOT_ROLE } from "@/constants/role.constants";

// Menu items based on user role
const getMenuItems = (userRole: "root" | "admin") => {
  const dashboardItem = {
    title: "Tổng quan",
    value: "tong-quan",
    url: "/quan-ly",
    icon: Home,
  };

  const commonItems = [
    {
      title: "Địa điểm",
      value: "dia-diem",
      url: "/quan-ly/dia-diem",
      icon: MapPin,
    },
    {
      title: "Trợ lý ảo",
      value: "tro-ly-ao",
      url: "/quan-ly/tro-ly-ao",
      icon: Bot,
    },
  ];

  const rootOnlyItems = [
    {
      title: "Người dùng",
      value: "nguoi-dung",
      url: "/quan-ly/nguoi-dung",
      icon: User,
    },
    {
      title: "Khu vực",
      value: "khu-vuc",
      url: "/quan-ly/khu-vuc",
      icon: MapIcon,
    },
  ];

  const allItems =
    userRole === ROOT_ROLE
      ? [dashboardItem, ...rootOnlyItems, ...commonItems]
      : [dashboardItem, ...commonItems];

  return allItems;
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = getMenuItems(user?.role || "admin");

  // Get current active tab based on pathname
  const getCurrentTab = () => {
    const currentPath = location.pathname;
    if (currentPath === "/quan-ly") {
      return "tong-quan";
    } else if (currentPath.startsWith("/quan-ly/dia-diem")) {
      return "dia-diem";
    } else if (currentPath.startsWith("/quan-ly/tro-ly-ao")) {
      return "tro-ly-ao";
    } else if (currentPath.startsWith("/quan-ly/khu-vuc")) {
      return "khu-vuc";
    } else if (currentPath.startsWith("/quan-ly/nguoi-dung")) {
      return "nguoi-dung";
    }
    return menuItems[0]?.value || "tong-quan";
  };

  const handleTabChange = (value: string) => {
    const item = menuItems.find((item) => item.value === value);
    if (item) {
      navigate(item.url);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Đăng xuất thành công!", {
        description: "Bạn đã được đăng xuất khỏi hệ thống",
      });
      navigate("/dang-nhap");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Đăng xuất thất bại", {
        description: "Đã xảy ra lỗi trong quá trình đăng xuất",
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Navigation Tabs */}
          <div className="flex-1 p-0 rounded-xl">
            <Tabs
              orientation="vertical"
              value={getCurrentTab()}
              onValueChange={handleTabChange}
              className="w-full flex flex-col"
            >
              <TabsList className="shrink-0 grid grid-cols-1 h-auto w-full gap-1">
                {menuItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="py-2 px-3 justify-start"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <User className="h-4 w-4" />
            <span className="text-sm text-sidebar-foreground truncate">
              {user?.email}
            </span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogoutClick}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </SidebarFooter>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleLogoutCancel}
              disabled={isLoggingOut}
            >
              Hủy
            </Button>
            <Button onClick={handleLogoutConfirm} disabled={isLoggingOut}>
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
