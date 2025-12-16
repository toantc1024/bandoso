import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { UploadIcon, FileIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/services/documents.service";
import type { Document } from "@/types/document.type";
import { InModalLoading } from "./LoadingBlock";

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotspotId: number;
  onSuccess?: (document: Document) => void;
}

const DocumentUploadModal = ({
  open,
  onOpenChange,
  hotspotId,
  onSuccess,
}: DocumentUploadModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [letChatbotLearn, setLetChatbotLearn] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      //   "application/msword": [".doc"],
      //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      //     [".docx"],
      //   "application/vnd.ms-excel": [".xls"],
      //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      //     ".xlsx",
      //   ],
      //   "application/vnd.ms-powerpoint": [".ppt"],
      //   "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      //     [".pptx"],
      //   "text/plain": [".txt"],
      //   "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async () => {
    if (!selectedFile || !title.trim()) return;

    setUploading(true);
    setUploadStep(0);

    try {
      setUploadStep(1); // Step 1: Uploading document

      const document = await uploadDocument(
        {
          title: title.trim(),
          file: selectedFile,
        },
        hotspotId,
        letChatbotLearn
      );

      if (letChatbotLearn) {
        setUploadStep(2); // Step 2: Training chatbot (if enabled)
        // Add a small delay to show the training step
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      onSuccess?.(document);
      handleClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Có lỗi xảy ra khi tải lên tài liệu");
    } finally {
      setUploading(false);
      setUploadStep(0);
    }
  };

  const handleClose = () => {
    setTitle("");
    setSelectedFile(null);
    setLetChatbotLearn(false);
    setUploadStep(0);
    onOpenChange(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={uploading ? undefined : onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tải lên tài liệu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề tài liệu</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề tài liệu..."
              />
            </div>

            <div className="space-y-2">
              <Label>Tệp tài liệu</Label>
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center space-y-2">
                    <UploadIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Thả tệp vào đây..."
                        : "Kéo thả tệp vào đây hoặc nhấp để chọn"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Hỗ trợ: PDF (tối đa 10MB)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-6 w-6 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">
                          {selectedFile.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="chatbot-learn"
                checked={letChatbotLearn}
                onCheckedChange={(checked) => setLetChatbotLearn(checked === "indeterminate" ? false : checked)}
                disabled={uploading}
              />
              <Label
                htmlFor="chatbot-learn"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Cho phép chatbot học từ tài liệu này
              </Label>
            </div>
          </div>

          {/* Show in-modal loading when uploading */}
          {uploading && (
            <InModalLoading
              progressMessages={[
                "Đang chuẩn bị tài liệu...",
                "Đang tải lên tài liệu...",
                ...(letChatbotLearn ? ["Đang dạy chatbot học từ tài liệu..."] : [])
              ]}
              currentStep={uploadStep}
              variant="default"
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || !title.trim() || uploading}
            >
              {uploading ? "Đang tải lên..." : "Tải lên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentUploadModal;
