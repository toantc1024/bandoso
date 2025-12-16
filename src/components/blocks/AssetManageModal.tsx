import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  updateAsset,
  deleteAsset,
  uploadAsset,
} from "@/services/assets.service";
import { getPanoramasByHotspotId } from "@/services/panoramas.service";
import type { Asset } from "@/types/asset.type";
import type { Panorama } from "@/types/panoramas.service.type";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ImageUploaderBlock from "./ImageUploaderBlock";

interface AssetManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "edit" | "delete";
  asset: Asset | null;
  hotspotId: string;
  onSuccess?: () => void;
}

const AssetManageModal = ({
  open,
  onOpenChange,
  mode,
  asset,
  hotspotId,
  onSuccess,
}: AssetManageModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [panoramaId, setPanoramaId] = useState<string>("none");
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPanoramas, setLoadingPanoramas] = useState(false);

  const fetchPanoramas = async () => {
    if (!hotspotId) return;

    setLoadingPanoramas(true);
    try {
      const data = await getPanoramasByHotspotId(parseInt(hotspotId));
      setPanoramas(data);
    } catch (error) {
      console.error("Error fetching panoramas:", error);
      toast.error("Không thể tải danh sách panorama");
    } finally {
      setLoadingPanoramas(false);
    }
  };

  useEffect(() => {
    if (open && asset) {
      setTitle(asset.title || "");
      setDescription(asset.description || "");
      setPanoramaId(asset.panorama_id || "none");
      if (mode === "edit") {
        fetchPanoramas();
      }
    }
  }, [open, asset, mode, hotspotId]);

  const handleSubmit = async () => {
    if (!asset) return;

    setLoading(true);
    try {
      if (mode === "edit") {
        if (!title.trim()) {
          toast.error("Vui lòng nhập tiêu đề");
          setLoading(false);
          return;
        }

        // If a new file is selected, upload it as a new asset and delete the old one
        if (file) {
          await uploadAsset(
            {
              title: title.trim(),
              description: description.trim(),
              file,
              panorama_id: panoramaId === "none" ? undefined : panoramaId,
            },
            hotspotId
          );
          await deleteAsset(asset.asset_id, hotspotId);
          toast.success("Cập nhật ảnh thành công!");
        } else {
          // Just update the metadata
          await updateAsset(asset.asset_id, hotspotId, {
            title: title.trim(),
            description: description.trim(),
            panorama_id: panoramaId === "none" ? undefined : panoramaId,
          });
          toast.success("Cập nhật thông tin ảnh thành công!");
        }
      } else {
        await deleteAsset(asset.asset_id, hotspotId);
        toast.success("Xóa ảnh thành công!");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error managing asset:", error);
      toast.error(
        mode === "edit" ? "Không thể cập nhật ảnh" : "Không thể xóa ảnh"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setPanoramaId("none");
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Chỉnh sửa ảnh" : "Xóa ảnh"}
          </DialogTitle>
        </DialogHeader>

        {mode === "edit" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Thay thế ảnh (tuỳ chọn)</Label>
              <ImageUploaderBlock
                file={file}
                setFile={setFile}
                accept={{
                  "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
                }}
                placeholder="Chọn ảnh mới để thay thế"
                enableCrop={true}
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
              {!file && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                  <img
                    src={asset.image_url}
                    alt={asset.title}
                    className="w-42 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.jpg";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề ảnh"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả ảnh"
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panorama">Panorama (tuỳ chọn)</Label>
              {loadingPanoramas ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner size={20} />
                  <span className="ml-2">Đang tải panorama...</span>
                </div>
              ) : (
                <Select value={panoramaId} onValueChange={setPanoramaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn panorama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không liên kết</SelectItem>
                    {panoramas.map((panorama) => (
                      <SelectItem
                        key={panorama.panorama_id}
                        value={panorama.panorama_id}
                      >
                        {panorama.title || `Panorama ${panorama.panorama_id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Bạn có chắc chắn muốn xóa ảnh này?</p>

            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-start space-x-4">
                <img
                  src={asset.image_url}
                  alt={asset.title}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-image.jpg";
                  }}
                />
                <div>
                  <p className="font-medium">{asset.title}</p>
                  {asset.panorama_id && (
                    <p className="text-sm text-gray-600">
                      Panorama: {asset.panorama_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (mode === "edit" && !title.trim())}
            variant={mode === "delete" ? "destructive" : "default"}
          >
            {loading && <Spinner size={16} className="mr-2" />}
            {mode === "edit" ? "Cập nhật" : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetManageModal;
