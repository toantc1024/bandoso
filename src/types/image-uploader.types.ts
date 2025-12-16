export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "error" | "cropping" | "ready";
  croppedImage?: string;
}

export interface ImageUploaderBlockProps {
  onFilesUploaded?: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  enableCrop?: boolean;
  className?: string;
}

export interface FileRejection {
  file: File;
  errors: Array<{
    code: string;
    message: string;
  }>;
}

export type UploadStatus = "uploading" | "error" | "cropping" | "ready";

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: UploadStatus;
}
