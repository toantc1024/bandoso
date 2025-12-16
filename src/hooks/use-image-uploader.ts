import { useState, useCallback } from "react";
import type { UploadedFile } from "@/types/image-uploader.types";

interface UseImageUploaderOptions {
  maxFiles?: number;
  onFilesUploaded?: (files: File[]) => void;
  simulateUpload?: boolean;
}

export const useImageUploader = ({
  maxFiles = 5,
  onFilesUploaded,
  simulateUpload = true,
}: UseImageUploaderOptions = {}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const simulateFileUpload = useCallback((fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: 100, status: "ready" as const }
              : f
          )
        );
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 200);
    return interval;
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const filesToAdd = newFiles
        .slice(0, maxFiles - uploadedFiles.length)
        .map((file) => {
          const id = Math.random().toString(36).substr(2, 9);
          return {
            id,
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "uploading" as const,
          };
        });

      setUploadedFiles((prev) => [...prev, ...filesToAdd]);

      if (simulateUpload) {
        filesToAdd.forEach((newFile) => {
          simulateFileUpload(newFile.id);
        });
      }

      if (onFilesUploaded) {
        onFilesUploaded(filesToAdd.map((f) => f.file));
      }

      return filesToAdd;
    },
    [
      uploadedFiles.length,
      maxFiles,
      onFilesUploaded,
      simulateUpload,
      simulateFileUpload,
    ]
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const updateFileProgress = useCallback((fileId: string, progress: number) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
    );
  }, []);

  const updateFileStatus = useCallback(
    (fileId: string, status: UploadedFile["status"]) => {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status } : f))
      );
    },
    []
  );

  const updateFileCrop = useCallback((fileId: string, croppedImage: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, croppedImage } : f))
    );
  }, []);

  const clearAllFiles = useCallback(() => {
    uploadedFiles.forEach((file) => {
      URL.revokeObjectURL(file.preview);
    });
    setUploadedFiles([]);
  }, [uploadedFiles]);

  const getCompletedFiles = useCallback(() => {
    return uploadedFiles.filter((f) => f.status === "ready");
  }, [uploadedFiles]);

  const getUploadingFiles = useCallback(() => {
    return uploadedFiles.filter((f) => f.status === "uploading");
  }, [uploadedFiles]);

  return {
    uploadedFiles,
    addFiles,
    removeFile,
    updateFileProgress,
    updateFileStatus,
    updateFileCrop,
    clearAllFiles,
    getCompletedFiles,
    getUploadingFiles,
    canAddMoreFiles: uploadedFiles.length < maxFiles,
    totalFiles: uploadedFiles.length,
    completedCount: uploadedFiles.filter((f) => f.status === "ready").length,
    uploadingCount: uploadedFiles.filter((f) => f.status === "uploading")
      .length,
  };
};
