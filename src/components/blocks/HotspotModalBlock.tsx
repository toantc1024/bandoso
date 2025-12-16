import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Loader2 } from "lucide-react";
import type { Area } from "@/types/areas.service.type";
import { createHotspot } from "@/services/hotspots.service";
import { getAreas } from "@/services/areas.service";
import { toast } from "sonner";
import { getAreasByAccountId } from "@/services/account_profiles.service";
import { useAuthStore } from "@/stores/auth.store";
import { ROOT_ROLE } from "@/constants/role.constants";

interface HotspotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (hotspot: any) => void;
}

export function HotspotModal({
  open,
  onOpenChange,
  onSuccess,
}: HotspotModalProps) {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    area_id: "",
  });
  const { user } = useAuthStore();
  // Get current user
  // eslint-disable-next-line @typescript-eslint/no-var-requires

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        if (!user) {
          setAreas([]);
          return;
        }

        let fetchedAreas: Area[] = [];

        if (user.role === ROOT_ROLE) {
          // Root user can access all areas
          const result = await getAreas({});
          fetchedAreas = result.data || [];
        } else {
          // Admin user can only access areas they manage
          if (!user.account_id) {
            setAreas([]);
            return;
          }
          // Get area IDs managed by user
          const areaIds = await getAreasByAccountId(user.account_id);
          if (!areaIds || areaIds.length === 0) {
            setAreas([]);
            return;
          }
          // Get all areas, then filter by areaIds
          const result = await getAreas({});
          fetchedAreas =
            result.data?.filter((area: Area) => areaIds.includes(area.area_id)) ||
            [];
        }

        setAreas(fetchedAreas);

        // Set the first area as default selection if areas exist and no area is selected
        if (fetchedAreas.length > 0 && !formData.area_id) {
          setFormData(prev => ({
            ...prev,
            area_id: fetchedAreas[0].area_id.toString()
          }));
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách khu vực");
        console.error("Error fetching areas:", error);
      }
    };

    if (open) {
      fetchAreas();
    }
  }, [open, user, formData.area_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.area_id) {
      toast.error("Vui lòng chọn khu vực");
      return;
    }

    setLoading(true);
    try {
      const hotspotData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        area_id: parseInt(formData.area_id),
      };

      const createdHotspot = await createHotspot(hotspotData);
      onSuccess(createdHotspot);
      resetForm();
    } catch (error) {
      toast.error("Lỗi khi tạo hotspot");
      console.error("Error creating hotspot:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      area_id: "",
    });
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo địa điểm mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo địa điểm mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_id">
                Khu vực <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={areas.map((area) => ({
                  value: area.area_id.toString(),
                  label: area.area_name,
                }))}
                value={formData.area_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, area_id: value })
                }
                placeholder="Chọn khu vực"
                searchPlaceholder="Tìm kiếm khu vực..."
                emptyText="Không tìm thấy khu vực nào."
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Nhập mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả"
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
