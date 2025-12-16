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
import { uploadAsset } from "@/services/assets.service";
import { getPanoramasByHotspotId } from "@/services/panoramas.service";
import type { Asset } from "@/types/asset.type";
import type { Panorama } from "@/types/panoramas.service.type";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import ImageUploaderBlock from "./ImageUploaderBlock";

interface AssetUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspotId: string;
  onSuccess?: (asset: Asset) => void;
}

const AssetUploadModal = ({
  open,
  onOpenChange,
  hotspotId,
  onSuccess,
}: AssetUploadModalProps) => {
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
    if (open && hotspotId) {
      fetchPanoramas();
    }
  }, [open, hotspotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (!file) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }

    setLoading(true);
    try {
      const asset = await uploadAsset(
        {
          title: title.trim(),
          description: description.trim(),
          file,
          panorama_id: panoramaId === "none" ? undefined : panoramaId,
        },
        hotspotId
      );
      toast.success("Tải lên ảnh thành công!");
      onSuccess?.(asset);
      handleClose();
    } catch (error) {
      console.error("Error uploading asset:", error);
      toast.error("Không thể tải lên ảnh: " + (error as Error).message);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm ảnh vật phẩm mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Chọn ảnh *</Label>
            <ImageUploaderBlock
              file={file}
              setFile={setFile}
              accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
              placeholder="Tải lên ảnh"
              enableCrop={true}
              maxFileSize={10 * 1024 * 1024} // 10MB
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !file || !title.trim()}>
              {loading && <Spinner size={16} className="mr-2" />}
              Tải lên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetUploadModal;
