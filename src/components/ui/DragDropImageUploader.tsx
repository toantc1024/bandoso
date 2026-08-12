import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Trash2, Loader2, Plus } from "lucide-react";
import { uploadFile, retrievePublicUrl } from "@/services/storage.service";
import { BUCKET_NAME } from "@/constants/storage.constants";
import { toast } from "sonner";

interface DragDropImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folderPath: string; // e.g. "base/nhacocong/1"
}

export const DragDropImageUploader: React.FC<DragDropImageUploaderProps> = ({
  images,
  onChange,
  folderPath,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileName = `img_${Date.now()}_${i}.png`;
        const result = await uploadFile(file, BUCKET_NAME, folderPath, fileName, true);
        const publicUrl = retrievePublicUrl(
          BUCKET_NAME,
          folderPath,
          result.normalizedFileName
        );
        uploadedUrls.push(publicUrl);
      }

      onChange([...images, ...uploadedUrls]);
      toast.success(`Đã tải lên ${uploadedUrls.length} hình ảnh!`);
    } catch (err: any) {
      console.error("Error uploading images:", err);
      toast.error("Lỗi khi tải ảnh lên Supabase Storage");
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading,
  });

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* ── Dropzone & Thumbnails Grid ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Uploaded Square Thumbnails (Ô Vuông) */}
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-2xl border bg-slate-900 overflow-hidden shadow-xs group"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                title="Xóa hình ảnh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Drag & Drop Square Box */}
        <div
          {...getRootProps()}
          className={`aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center p-3 cursor-pointer ${
            isDragActive
              ? "border-primary bg-primary/10 scale-105"
              : "border-muted-foreground/30 hover:border-primary hover:bg-muted/40"
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-1 text-primary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-[10px] font-medium">Đang tải...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <UploadCloud className="w-6 h-6 text-primary" />
              <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Plus className="w-3 h-3" /> Thêm ảnh
              </div>
              <span className="text-[9px] italic text-muted-foreground hidden sm:inline">
                Kéo thả nhiều ảnh vào đây
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropImageUploader;
