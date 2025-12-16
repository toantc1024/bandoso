import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getPanoramasByHotspotId } from "@/services/panoramas.service";
import type { Panorama } from "@/types/panoramas.service.type";
import { toast } from "sonner";
import { Loader2, Search, ImageIcon, CheckCircle } from "lucide-react";

interface PanoramaSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (panoramaId: string) => void;
  hotspotId: string | number;
  currentPanoramaId?: string;
}

const PanoramaSelectionModal: React.FC<PanoramaSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  hotspotId,
  currentPanoramaId,
}) => {
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [filteredPanoramas, setFilteredPanoramas] = useState<Panorama[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPanoramaId, setSelectedPanoramaId] = useState<string>("");

  useEffect(() => {
    if (isOpen && hotspotId) {
      fetchPanoramas();
    }
  }, [isOpen, hotspotId]);

  useEffect(() => {
    if (currentPanoramaId) {
      setSelectedPanoramaId(currentPanoramaId);
    }
  }, [currentPanoramaId]);

  useEffect(() => {
    // Filter panoramas based on search term
    if (searchTerm) {
      const filtered = panoramas.filter(
        (panorama) =>
          panorama.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          panorama.panorama_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPanoramas(filtered);
    } else {
      setFilteredPanoramas(panoramas);
    }
  }, [searchTerm, panoramas]);

  const fetchPanoramas = async () => {
    setIsLoading(true);
    try {
      const data = await getPanoramasByHotspotId(hotspotId);
      setPanoramas(data);
      setFilteredPanoramas(data);
    } catch (error) {
      console.error("Error fetching panoramas:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách panorama");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    onSelect(selectedPanoramaId);
    onClose();
  };

  const handleClear = () => {
    onSelect("");
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedPanoramaId(currentPanoramaId || "");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=" sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn Panorama</DialogTitle>
          <DialogDescription>
            Chọn panorama sẽ được mở khi người dùng nhấp vào địa điểm này
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-1 space-y-4 overflow-hidden">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="panorama-search">Tìm kiếm panorama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="panorama-search"
                placeholder="Tìm theo tên hoặc ID panorama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Đang tải danh sách panorama...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredPanoramas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p className="text-lg font-medium">
                {searchTerm
                  ? "Không tìm thấy panorama nào"
                  : "Không có panorama nào"}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Hãy tạo panorama mới cho hotspot này"}
              </p>
            </div>
          )}

          {/* Panorama List */}
          {!isLoading && filteredPanoramas.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredPanoramas.map((panorama) => (
                <Card
                  key={panorama.panorama_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPanoramaId === panorama.panorama_id
                      ? "border-blue-200 border-1 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    // Allow deselecting by clicking on the already selected panorama
                    if (selectedPanoramaId === panorama.panorama_id) {
                      setSelectedPanoramaId("");
                    } else {
                      setSelectedPanoramaId(panorama.panorama_id);
                    }
                  }}
                  title={
                    selectedPanoramaId === panorama.panorama_id
                      ? "Nhấp để bỏ chọn"
                      : "Nhấp để chọn"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Preview Image */}
                      <div className="flex-shrink-0">
                        {panorama.preview_image ? (
                          <img
                            src={panorama.preview_image}
                            alt={panorama.title}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Panorama Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {panorama.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              ID: {panorama.panorama_id}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Tạo lúc:{" "}
                              {new Date(panorama.created_at).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          {selectedPanoramaId === panorama.panorama_id && (
                            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            {selectedPanoramaId && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Xóa lựa chọn
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSelect}
              disabled={!selectedPanoramaId}
            >
              {selectedPanoramaId ? "Xác nhận chọn" : "Chọn một panorama"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PanoramaSelectionModal;
