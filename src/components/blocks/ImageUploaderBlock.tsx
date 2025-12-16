"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
} from "@/components/ui/kibo-ui/image-crop";
import { UploadIcon, XIcon, FileImageIcon, Crop } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface ImageUploaderBlockProps {
  file?: File | null;
  setFile?: (file: File | null) => void;
  files?: File[];
  setFiles?: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  accept?: Record<string, string[]>;
  onFilesUploaded?: (files: File[]) => void;
  enableCrop?: boolean;
  className?: string;
  placeholder?: string;
  onCroppedImageChange?: (croppedImageData: string | null) => void;
}

const ImageUploaderBlock = ({
  file = null,
  setFile,
  files = [],
  setFiles,
  multiple = false,
  maxFiles = 5,
  maxFileSize = 75 * 1024 * 1024, // 75 MB
  accept = {
    "image/*": [".jpeg", ".jpg", ".png"],
  },
  enableCrop = true,
  className,
  placeholder = "Tải lên ảnh",
  onCroppedImageChange,
}: ImageUploaderBlockProps) => {
  const [cropModalFile, setCropModalFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedImages, setCroppedImages] = useState<Map<string, string>>(
    new Map()
  );

  // Use files/setFiles for multiple mode, file/setFile for single mode
  const currentFiles = multiple ? files : file ? [file] : [];
  const isAtMaxCapacity = multiple ? files.length >= maxFiles : !!file;
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (multiple) {
        if (!setFiles) return;
        const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
        setFiles(newFiles);

        if (enableCrop && acceptedFiles.length > 0) {
          setCropModalFile(acceptedFiles[0]);
        }
      } else {
        if (!setFile) return;
        const newFile = acceptedFiles[0];
        setFile(newFile);

        if (enableCrop) {
          setCropModalFile(newFile);
        }
      }
    },
    [multiple, files, setFiles, setFile, maxFiles, enableCrop]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles - files.length : 1,
    maxSize: maxFileSize,
    multiple,
    disabled: isAtMaxCapacity,
  });

  const removeFile = (index?: number) => {
    if (multiple) {
      if (!setFiles || index === undefined) return;
      const fileToRemove = files[index];
      const fileKey = getFileKey(fileToRemove);

      // Remove cropped image if exists
      setCroppedImages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(fileKey);
        return newMap;
      });

      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
    } else {
      if (!setFile) return;
      setCroppedImage(null);
      setFile(null);
      // Notify parent component that cropped image is cleared
      if (onCroppedImageChange) {
        onCroppedImageChange(null);
      }
    }
  };

  const openCropModal = (fileToEdit: File) => {
    setCropModalFile(fileToEdit);
  };

  const handleCropComplete = (croppedImageData: string) => {
    if (multiple) {
      if (cropModalFile) {
        const fileKey = getFileKey(cropModalFile);
        setCroppedImages((prev) =>
          new Map(prev).set(fileKey, croppedImageData)
        );
      }
    } else {
      setCroppedImage(croppedImageData);
      // Notify parent component about the cropped image
      if (onCroppedImageChange) {
        onCroppedImageChange(croppedImageData);
      }
    }
    setCropModalFile(null);
  };

  const handleCropSkip = () => {
    setCropModalFile(null);
  };

  const getFileKey = (file: File) => file.name + file.size;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Area - Hide for single file mode when file exists */}
      {(multiple || !file) && (
        <Card className="border-2 border-dashed transition-colors">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center text-center cursor-pointer transition-colors rounded-lg p-6",
                isDragActive && !isDragReject && "bg-primary/10 border-primary",
                isDragReject && "bg-red-50 border-red-300",
                isAtMaxCapacity && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-gray-100 rounded-full">
                  <UploadIcon className="h-6 w-6 text-gray-600" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-medium">
                    {isDragActive ? "Thả file vào đây" : placeholder}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {multiple
                      ? `Kéo thả tối đa ${maxFiles} ảnh hoặc nhấp để chọn`
                      : "Kéo thả ảnh hoặc nhấp để chọn"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Hỗ trợ JPEG, PNG, GIF, WebP tối đa{" "}
                    {Math.round(maxFileSize / 1024 / 1024)}MB
                  </p>
                </div>

                {!isAtMaxCapacity && (
                  <Button type="button" variant="outline" size="sm">
                    <FileImageIcon className="mr-2 h-4 w-4" />
                    Chọn file
                  </Button>
                )}
              </div>
            </div>

            {fileRejections.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 font-medium">
                  Một số file bị từ chối:
                </p>
                <ul className="mt-1 text-xs text-red-500">
                  {fileRejections.map(({ file, errors }, index) => (
                    <li key={index}>
                      {file.name}: {errors.map((e) => e.message).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Preview */}
      {currentFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {multiple ? `${files.length}/${maxFiles} tập tin` : "Ảnh đã chọn"}
          </p>

          <div
            className={cn(
              "grid gap-3",
              multiple
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                : "grid-cols-1 max-w-xs"
            )}
          >
            {currentFiles.map((fileItem, index) => {
              const fileKey = getFileKey(fileItem);
              const fileImage = multiple
                ? croppedImages.get(fileKey)
                : croppedImage;
              const preview = fileImage || URL.createObjectURL(fileItem);

              return (
                <div
                  key={multiple ? index : 0}
                  className="relative group aspect-4/3   overflow-hidden rounded-lg border bg-gray-100"
                >
                  <img
                    src={preview}
                    alt={fileItem.name}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      if (!fileImage) {
                        URL.revokeObjectURL(preview);
                      }
                    }}
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    {enableCrop && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openCropModal(fileItem)}
                        title="Cắt ảnh"
                        className="bg-white/90 hover:bg-white text-gray-900"
                      >
                        <Crop className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => removeFile(multiple ? index : undefined)}
                      title="Xóa ảnh"
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalFile && (
        <Dialog
          open={!!cropModalFile}
          onOpenChange={() => setCropModalFile(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Crop className="h-5 w-5" />
                <span>Cắt ảnh</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <ImageCrop
                aspect={4 / 3}
                file={cropModalFile}
                maxImageSize={1600 * 1200}
                onCrop={handleCropComplete}
              >
                <div className="flex justify-center">
                  <ImageCropContent className="max-w-full max-h-96" />
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <ImageCropApply className="w-auto p-2 bg-primary text-white hover:bg-primary/90">
                    Áp dụng
                  </ImageCropApply>
                  {/* <ImageCropReset className="w-auto p-2 bg-white text-gray-800 hover:bg-gray-300">
                    Đặt lại
                  </ImageCropReset> */}
                  <Button
                    type="button"
                    onClick={handleCropSkip}
                    variant="outline"
                  >
                    Bỏ qua
                  </Button>
                  {/* <Button
                    onClick={() => setCropModalFile(null)}
                    variant="ghost"
                  >
                    Hủy
                  </Button> */}
                </div>
              </ImageCrop>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageUploaderBlock;
