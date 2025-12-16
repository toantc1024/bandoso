import { getAreaById, updateArea } from "@/services/areas.service";
import { getHotspotById } from "@/services/hotspots.service";
import type { Area } from "@/types/areas.service.type";
import type { Hotspot } from "@/types/hotspots.service.type";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RotateCcw, Save, MapPin } from "lucide-react";
import HotspotSelectionModal from "./HotspotSelectionModal";
import { Spinner } from "../ui/shadcn-io/spinner";

const AreaInfoBlock = ({ areaId }: { areaId: string | undefined }) => {
  const [area, setArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Area>>({});
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isLoadingHotspot, setIsLoadingHotspot] = useState(false);

  useEffect(() => {
    if (areaId) {
      fetchAreaData();
    }
  }, [areaId]);

  useEffect(() => {
    if (formData.main_hotspot_id) {
      fetchHotspotData(formData.main_hotspot_id);
    } else {
      setSelectedHotspot(null);
    }
  }, [formData.main_hotspot_id]);

  const fetchAreaData = async () => {
    try {
      setIsLoading(true);
      const data = await getAreaById(areaId || "");
      setArea(data);
      setFormData(data);
    } catch (error) {
      toast.error("Không thể tải thông tin khu vực");
      console.error("Error fetching area:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotspotData = async (hotspotId: string) => {
    try {
      setIsLoadingHotspot(true);
      const data = await getHotspotById(hotspotId);
      setSelectedHotspot(data);
    } catch (error) {
      console.error("Error fetching hotspot:", error);
      setSelectedHotspot(null);
    } finally {
      setIsLoadingHotspot(false);
    }
  };

  const handleInputChange = (field: keyof Area, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!areaId || !formData) return;

    try {
      setIsLoading(true);
      const updatedArea = await updateArea(areaId, formData);
      setArea(updatedArea);
      setFormData(updatedArea);
      toast.success("Cập nhật khu vực thành công");
    } catch (error) {
      toast.error("Không thể cập nhật khu vực");
      console.error("Error updating area:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(area || {});
    toast.info("Đã đặt lại form về giá trị ban đầu");
  };

  const handleHotspotSelect = (hotspotId: string) => {
    setFormData((prev) => ({
      ...prev,
      main_hotspot_id: hotspotId || null,
    }));
    // Clear selected hotspot to trigger fresh fetch
    if (hotspotId) {
      setSelectedHotspot(null);
    }
  };

  if (isLoading && !area) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="text-primary" size={64} variant="default" />
          <div className="text-lg font-medium text-foreground animate-pulse">
            Đang tải thông tin khu vực...
          </div>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-muted-foreground">
            Không tìm thấy thông tin khu vực
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(area);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Thông tin khu vực</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading || !hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Đặt lại
            </Button>
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading || !hasChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area_id">Mã khu vực</Label>
              <Input
                id="area_id"
                value={area.area_id}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_name">Tên khu vực</Label>
              <Input
                id="area_name"
                value={formData.area_name || ""}
                onChange={(e) => handleInputChange("area_name", e.target.value)}
                placeholder="Nhập tên khu vực"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Tên miền</Label>
              <Input
                id="domain"
                value={formData.domain || ""}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                placeholder="Nhập tên miền"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_hotspot_id">Mã địa điểm chính</Label>
              <div className="flex gap-2">
                <Input
                  id="main_hotspot_id"
                  value={
                    isLoadingHotspot
                      ? "Đang tải..."
                      : selectedHotspot
                      ? `${selectedHotspot.title || "Không có tên"} (ID: ${
                          selectedHotspot.hotspot_id
                        })`
                      : formData.main_hotspot_id
                      ? `ID: ${formData.main_hotspot_id}`
                      : "Chưa chọn địa điểm chính"
                  }
                  placeholder="Chưa chọn địa điểm chính"
                  disabled
                  className="bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHotspotModalOpen(true)}
                  className="flex-shrink-0"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Chọn
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotspot Selection Modal */}
      <HotspotSelectionModal
        isOpen={isHotspotModalOpen}
        onClose={() => setIsHotspotModalOpen(false)}
        onSelect={handleHotspotSelect}
        areaId={area?.area_id || ""}
        currentHotspotId={formData.main_hotspot_id || ""}
      />
    </>
  );
};

export default AreaInfoBlock;
