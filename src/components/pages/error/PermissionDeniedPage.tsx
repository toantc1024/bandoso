import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";

const PermissionDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldX className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Truy cập bị từ chối
        </h1>
        <p className="mt-4 text-muted-foreground">
          Bạn không có quyền truy cập vào trang này. Chỉ người dùng có quyền
          Root mới có thể truy cập chức năng này.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <Button
            onClick={() => navigate("/quan-ly/dia-diem")}
            className="flex items-center gap-2"
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDeniedPage;
