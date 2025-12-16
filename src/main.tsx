import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/layouts/AdminLayout.tsx";
import ManageChatbot from "./components/pages/admin/ManageChatbot.tsx";
import ManageUserPage from "./components/pages/admin/ManageUserPage.tsx";
import LoginPage from "./components/pages/common/LoginPage.tsx";
import NotFoundPage from "./components/pages/error/NotFoundPage.tsx";
import PermissionDeniedPage from "./components/pages/error/PermissionDeniedPage.tsx";
import LandingPage from "./components/pages/common/LandingPage.tsx";
import { Toaster } from "sonner";
import ManageAreaPage from "./components/pages/admin/manage-areas/ManageAreaPage.tsx";
import AreaDetailPage from "./components/pages/admin/manage-areas/AreaDetailPage.tsx";
import { RootOnlyRoute } from "./components/guards/RootOnlyRoute.tsx";
import MainManagePage from "./components/pages/admin/MainManagePage.tsx";
import ManageHotspotsPage from "./components/pages/admin/manage-hotspots/ManageHotspotsPage.tsx";
import HotspotDetailPage from "./components/pages/admin/manage-hotspots/HotspotDetailPage.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Toaster />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/quan-ly" element={<AdminLayout />}>
        <Route index element={<MainManagePage />} />
        <Route
          path="nguoi-dung"
          element={
            <RootOnlyRoute>
              <ManageUserPage />
            </RootOnlyRoute>
          }
        />
        <Route
          path="khu-vuc"
          element={
            <RootOnlyRoute>
              <ManageAreaPage />
            </RootOnlyRoute>
          }
        />
        <Route path="khu-vuc/:areaId" element={<AreaDetailPage />} />
        <Route path="tro-ly-ao" element={<ManageChatbot />} />
        <Route path="dia-diem" element={<ManageHotspotsPage />} />
        <Route path="dia-diem/:hotspotId" element={<HotspotDetailPage />} />
      </Route>
      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/403" element={<PermissionDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
