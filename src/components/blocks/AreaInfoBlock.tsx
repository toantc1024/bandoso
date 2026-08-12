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
import { RotateCcw, Save, MapPin, Music, Loader2, Trash2 } from "lucide-react";
import HotspotSelectionModal from "./HotspotSelectionModal";
import { Spinner } from "../ui/shadcn-io/spinner";
import AudioPlayer from "../ui/AudioPlayer";
import { uploadFile, retrievePublicUrl } from "@/services/storage.service";
import { BUCKET_NAME } from "@/constants/storage.constants";

const AreaInfoBlock = ({ areaId }: { areaId: string | undefined }) => {
  const [area, setArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Area>>({});
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isLoadingHotspot, setIsLoadingHotspot] = useState(false);

  // Nhạc nền Khu vực state
  const [bgMusicUrl, setBgMusicUrl] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

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
      setBgMusicUrl(data.metadata?.bg_music_url || "");
      setPendingFile(null);
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

  // Select local file without uploading immediately until user clicks "Cập nhật"
  const handleFileSelectBgMusic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    const localPreviewUrl = URL.createObjectURL(file);
    setBgMusicUrl(localPreviewUrl);
    toast.info("Đã chọn file nhạc nền. Hãy nhấn 'Cập nhật' để lưu lại.");
  };

  const handleDeleteBgMusic = () => {
    setBgMusicUrl("");
    setPendingFile(null);
    toast.success("Đã xóa nhạc nền hiện tại. Hãy nhấn 'Cập nhật' để lưu thay đổi.");
  };

  const handleUpdate = async () => {
    if (!areaId || !formData) return;

    try {
      setIsLoading(true);
      let finalBgUrl = bgMusicUrl;

      // Upload pending file ONLY when user clicks "Cập nhật"
      if (pendingFile) {
        setIsUploadingBg(true);
        const fileName = `area_${areaId}_bg_music_${Date.now()}.mp3`;
        const uploadResult = await uploadFile(
          pendingFile,
          BUCKET_NAME,
          `base/audio/area_${areaId}`,
          fileName,
          true
        );

        finalBgUrl = retrievePublicUrl(
          BUCKET_NAME,
          `base/audio/area_${areaId}`,
          uploadResult.normalizedFileName
        );
        setIsUploadingBg(false);
      }

      const currentMetadata = area?.metadata || {};
      const newMetadata = {
        ...currentMetadata,
        ...(formData.metadata || {}),
        bg_music_url: finalBgUrl.trim() ? finalBgUrl.trim() : null,
      };

      const updateData: Partial<Area> = {
        ...formData,
        metadata: newMetadata,
      };

      const updatedArea = await updateArea(areaId, updateData);
      setArea(updatedArea);
      setFormData(updatedArea);
      setBgMusicUrl(updatedArea.metadata?.bg_music_url || "");
      setPendingFile(null);
      toast.success("Cập nhật thông tin khu vực thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật khu vực");
      console.error("Error updating area:", error);
    } finally {
      setIsLoading(false);
      setIsUploadingBg(false);
    }
  };

  const handleReset = () => {
    setFormData(area || {});
    setBgMusicUrl(area?.metadata?.bg_music_url || "");
    setPendingFile(null);
    toast.info("Đã đặt lại thông tin về ban đầu");
  };

  const handleHotspotSelect = (hotspotId: string) => {
    setFormData((prev) => ({
      ...prev,
      main_hotspot_id: hotspotId || null,
    }));
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

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(area) ||
    bgMusicUrl !== (area?.metadata?.bg_music_url || "") ||
    pendingFile !== null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Thông tin chung khu vực</CardTitle>
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
              {isLoading || isUploadingBg ? "Đang cập nhật..." : "Cập nhật"}
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

      {/* ── Cấu Hình Nhạc Nền Khu Vực ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music className="w-5 h-5 text-primary" />
            Nhạc Nền Khu Vực
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Tải Lên File Nhạc Nền (MP3)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav"
                  onChange={handleFileSelectBgMusic}
                  disabled={isUploadingBg}
                  className="cursor-pointer"
                />
                {isUploadingBg && (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-primary" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area-bg-url" className="font-semibold">
                Hoặc Nhập Đường Dẫn Nhạc Nền (URL MP3)
              </Label>
              <Input
                id="area-bg-url"
                placeholder="https://..."
                value={bgMusicUrl}
                onChange={(e) => {
                  setBgMusicUrl(e.target.value);
                  setPendingFile(null);
                }}
              />
            </div>
          </div>

          {/* Hiển thị Trình Phát & Nút Xóa Nhạc Nền Hiện Tại */}
          {bgMusicUrl ? (
            <div className="pt-3 border-t space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {pendingFile ? "Nhạc nền đã chọn (chưa lưu):" : "Nhạc nền hiện tại của khu vực:"}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteBgMusic}
                  className="h-8 text-xs text-destructive hover:text-destructive gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Xóa nhạc nền
                </Button>
              </div>

              <AudioPlayer
                src={bgMusicUrl}
                title={`Nhạc nền: ${area?.area_name}`}
                autoPlay={false}
              />
            </div>
          ) : (
            <div className="pt-2 border-t text-xs text-muted-foreground italic">
              Khu vực chưa có nhạc nền riêng. Khi vào VR, hệ thống sẽ chỉ phát nhạc khi khu vực được cài đặt nhạc nền.
            </div>
          )}
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
    </div>
  );
};

export default AreaInfoBlock;
