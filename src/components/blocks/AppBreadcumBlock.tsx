import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Path translations
const pathTranslations: Record<string, string> = {
  "quan-ly": "Quản lý",
  "nguoi-dung": "Người dùng",
  "khu-vuc": "Khu vực",
  "tro-ly-ao": "Trợ lý ảo",
  "dia-diem": "Địa điểm",
  "thong-tin": "Thông tin",
  "tai-lieu": "Tài liệu",
  panorama: "Panorama",
  "403": "Truy cập bị từ chối",
};

export function AppBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const title = pathTranslations[segment] || segment;

    return {
      path,
      title,
      isLast,
    };
  });

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item) => (
            <>
              <div key={item.path} className="flex items-center">
                <BreadcrumbItem className=" text-lg">
                  {item.isLast ? (
                    <BreadcrumbPage className="">{item.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => navigate(item.path)}
                      className="cursor-pointer"
                    >
                      {item.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
              {!item.isLast && <BreadcrumbSeparator className="" />}
            </>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
