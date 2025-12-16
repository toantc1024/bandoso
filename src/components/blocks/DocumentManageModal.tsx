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
import { toast } from "sonner";
import { updateDocument, deleteDocument } from "@/services/documents.service";
import type { Document } from "@/types/document.type";

interface DocumentManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "edit" | "delete";
  document: Document | null;
  onSuccess?: () => void;
}

const DocumentManageModal = ({
  open,
  onOpenChange,
  mode,
  document,
  onSuccess,
}: DocumentManageModalProps) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document && mode === "edit") {
      setTitle(document.title);
    }
  }, [document, mode]);

  const handleSubmit = async () => {
    if (!document) return;

    setLoading(true);
    try {
      if (mode === "edit") {
        await updateDocument(document.id, { title: title.trim() });
      } else if (mode === "delete") {
        await deleteDocument(document.id);
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error(`Error ${mode} document:`, error);
      toast.error(
        `Có lỗi xảy ra khi ${mode === "edit" ? "cập nhật" : "xóa"} tài liệu`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Chỉnh sửa tài liệu" : "Xóa tài liệu"}
          </DialogTitle>
        </DialogHeader>

        {mode === "edit" ? (
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
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa tài liệu "{document.title}" không? Hành
              động này không thể hoàn tác.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              (mode === "edit" && (!title.trim() || title === document.title))
            }
            variant={mode === "delete" ? "destructive" : "default"}
          >
            {loading
              ? mode === "edit"
                ? "Đang cập nhật..."
                : "Đang xóa..."
              : mode === "edit"
                ? "Cập nhật"
                : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentManageModal;
