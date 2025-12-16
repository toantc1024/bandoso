"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import ImageUploaderBlock from "@/components/blocks/ImageUploaderBlock";
import type { Panorama } from "@/types/panoramas.service.type";
import {
  createPanorama,
  updatePanorama,
  deletePanorama,
} from "@/services/panoramas.service";
import { uploadFile, retrievePublicUrl } from "@/services/storage.service";
import {
  BUCKET_NAME,
  combinePath,
  HOTSPOTS_FOLDER_NAME,
  PANORAMAS_FOLDER_NAME,
} from "@/constants/storage.constants";
import { getHotspotById } from "@/services/hotspots.service";

interface PanoramaCRUDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "delete";
  panorama?: Panorama | null;
  hotspotId: string;
  onSuccess: () => void;
}

interface PanoramaFormData {
  panorama_id: string;
  title: string;
  preview_image: string;
}

const PanoramaCRUDModal = ({
  open,
  onOpenChange,
  mode,
  panorama,
  hotspotId,
  onSuccess,
}: PanoramaCRUDModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PanoramaFormData>({
    panorama_id: "",
    title: "",
    preview_image: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImageData, setCroppedImageData] = useState<string | null>(null);

  // Reset form when modal opens/closes or panorama changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && panorama) {
        setFormData({
          panorama_id: panorama.panorama_id,
          title: panorama.title,
          preview_image: panorama.preview_image,
        });
      } else {
        setFormData({
          panorama_id: "",
          title: "",
          preview_image: "",
        });
      }
      setSelectedFile(null);
      setCroppedImageData(null);
    }
  }, [open, mode, panorama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (mode !== "delete") {
      if (!formData.panorama_id.trim()) {
        toast.error("Vui lòng nhập ID panorama");
        return;
      }

      if (!formData.title.trim()) {
        toast.error("Vui lòng nhập tiêu đề");
        return;
      }

      if (mode === "create" && !selectedFile && !croppedImageData) {
        toast.error("Vui lòng chọn ảnh xem trước");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "delete" && panorama) {
        await deletePanorama(panorama.panorama_id);
        toast.success("Xóa panorama thành công");
      } else if (mode === "create") {
        let imageUrl = formData.preview_image;

        // Upload image if file is selected
        if (selectedFile) {
          let fileToUpload = selectedFile;
          const fileName = `${Date.now()}-${selectedFile.name}`;

          // If we have cropped image data, convert it to a file
          if (croppedImageData) {
            const response = await fetch(croppedImageData);
            const blob = await response.blob();
            fileToUpload = new File([blob], selectedFile.name, {
              type: selectedFile.type,
            });
          }

          let hotspot = await getHotspotById(hotspotId)

          await uploadFile(
            fileToUpload,
            BUCKET_NAME,
            combinePath(PANORAMAS_FOLDER_NAME, hotspot?.area_id),
            fileName,
            true
          );

          imageUrl = retrievePublicUrl(
            BUCKET_NAME,
            combinePath(PANORAMAS_FOLDER_NAME, hotspot?.area_id),
            fileName
          );
        }

        await createPanorama({
          panorama_id: formData.panorama_id,
          title: formData.title,
          preview_image: imageUrl,
          hotspot_id: hotspotId,
        });
        toast.success("Tạo panorama thành công");
      } else if (mode === "edit" && panorama) {
        let imageUrl = formData.preview_image;

        // Upload new image if file is selected
        if (selectedFile) {
          let fileToUpload = selectedFile;
          const fileName = `${Date.now()}-${selectedFile.name}`;

          // If we have cropped image data, convert it to a file
          if (croppedImageData) {
            const response = await fetch(croppedImageData);
            const blob = await response.blob();
            fileToUpload = new File([blob], selectedFile.name, {
              type: selectedFile.type,
            });
          }

          await uploadFile(
            fileToUpload,
            BUCKET_NAME,
            HOTSPOTS_FOLDER_NAME,
            fileName,
            true
          );

          imageUrl = retrievePublicUrl(
            BUCKET_NAME,
            HOTSPOTS_FOLDER_NAME,
            fileName
          );
        }

        await updatePanorama(panorama.panorama_id, {
          panorama_id: formData.panorama_id,
          title: formData.title,
          preview_image: imageUrl,
        });
        toast.success("Cập nhật panorama thành công");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Tạo panorama mới";
      case "edit":
        return "Chỉnh sửa panorama";
      case "delete":
        return "Xóa panorama";
      default:
        return "";
    }
  };

  // const getModalDescription = () => {
  //   switch (mode) {
  //     case "create":
  //       return "Tạo một panorama mới cho hotspot này.";
  //     case "edit":
  //       return "Chỉnh sửa thông tin panorama.";
  //     case "delete":
  //       return "Bạn có chắc chắn muốn xóa panorama này? Hành động này không thể hoàn tác.";
  //     default:
  //       return "";
  //   }
  // };

  const getSubmitButtonText = () => {
    if (loading) {
      return mode === "delete" ? "Đang xóa..." : "Đang lưu...";
    }
    switch (mode) {
      case "create":
        return "Tạo panorama";
      case "edit":
        return "Cập nhật";
      case "delete":
        return "Xóa";
      default:
        return "Lưu";
    }
  };

  const getSubmitButtonVariant = () => {
    return mode === "delete" ? "destructive" : "default";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" && <Plus className="h-5 w-5" />}
            {mode === "edit" && <Edit className="h-5 w-5" />}
            {mode === "delete" && <Trash2 className="h-5 w-5" />}
            {getModalTitle()}
          </DialogTitle>
          {/* <DialogDescription>{getModalDescription()}</DialogDescription> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode !== "delete" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="panorama_id">ID Panorama *</Label>
                <Input
                  id="panorama_id"
                  value={formData.panorama_id}
                  onChange={(e) =>
                    setFormData({ ...formData, panorama_id: e.target.value })
                  }
                  placeholder="Nhập ID panorama"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề panorama"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Ảnh xem trước {mode === "create" && "*"}</Label>
                <ImageUploaderBlock
                  file={selectedFile}
                  setFile={setSelectedFile}
                  multiple={false}
                  enableCrop={true}
                  placeholder="Tải lên ảnh xem trước"
                  onCroppedImageChange={setCroppedImageData}
                />
                {mode === "edit" && formData.preview_image && !selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                    <img
                      src={formData.preview_image}
                      alt="Current preview"
                      className="w-42 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant={getSubmitButtonVariant()}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getSubmitButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PanoramaCRUDModal;
