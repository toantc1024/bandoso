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
import { getUnassignedHotspots } from "@/services/hotspots.service";
import type { Hotspot } from "@/types/hotspots.service.type";
import { toast } from "sonner";
import { Loader2, Search, MapPin, CheckCircle } from "lucide-react";

interface HotspotAddToAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (hotspotId: string) => void;
  areaName?: string;
}

const HotspotAddToAreaModal: React.FC<HotspotAddToAreaModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  areaName,
}) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [filteredHotspots, setFilteredHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchUnassignedHotspots();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter hotspots based on search term
    if (searchTerm) {
      const filtered = hotspots.filter(
        (hotspot) =>
          hotspot.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotspot.hotspot_id
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          hotspot.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHotspots(filtered);
    } else {
      setFilteredHotspots(hotspots);
    }
  }, [searchTerm, hotspots]);

  const fetchUnassignedHotspots = async () => {
    setIsLoading(true);
    try {
      const data = await getUnassignedHotspots();
      setHotspots(data);
      setFilteredHotspots(data);
    } catch (error) {
      console.error("Error fetching unassigned hotspots:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách địa điểm chưa được gán");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    onSelect(selectedHotspotId);
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedHotspotId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm địa điểm vào khu vực</DialogTitle>
          <DialogDescription>
            Chọn địa điểm chưa được gán để thêm vào khu vực {areaName || "này"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-1 space-y-4 overflow-hidden">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="hotspot-search">Tìm kiếm địa điểm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="hotspot-search"
                placeholder="Tìm theo tên, địa chỉ hoặc ID địa điểm..."
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
              <span>Đang tải danh sách địa điểm...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredHotspots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mb-2" />
              <p className="text-lg font-medium">
                {searchTerm
                  ? "Không tìm thấy địa điểm nào"
                  : "Không có địa điểm chưa được gán"}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Tất cả địa điểm đã được gán vào các khu vực"}
              </p>
            </div>
          )}

          {/* Hotspot List */}
          {!isLoading && filteredHotspots.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredHotspots.map((hotspot) => (
                <Card
                  key={hotspot.hotspot_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedHotspotId === hotspot.hotspot_id.toString()
                      ? "border-blue-200 border-1 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    // Allow deselecting by clicking on the already selected hotspot
                    if (selectedHotspotId === hotspot.hotspot_id.toString()) {
                      setSelectedHotspotId("");
                    } else {
                      setSelectedHotspotId(hotspot.hotspot_id.toString());
                    }
                  }}
                  title={
                    selectedHotspotId === hotspot.hotspot_id.toString()
                      ? "Nhấp để bỏ chọn"
                      : "Nhấp để chọn"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Preview Image */}
                      <div className="flex-shrink-0">
                        {hotspot.preview_image ? (
                          <img
                            src={hotspot.preview_image}
                            alt={hotspot.title || "Hotspot"}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Hotspot Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {hotspot.title || "Không có tiêu đề"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              ID: {hotspot.hotspot_id}
                            </p>
                            {hotspot.address && (
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                📍 {hotspot.address}
                              </p>
                            )}
                            {hotspot.description && (
                              <p className="text-xs text-gray-400 mt-1 overflow-hidden">
                                <span className="line-clamp-2">
                                  {hotspot.description.length > 100
                                    ? hotspot.description.substring(0, 100) +
                                      "..."
                                    : hotspot.description}
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Tạo lúc:{" "}
                              {hotspot.created_at
                                ? new Date(
                                    hotspot.created_at
                                  ).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Không có thông tin"}
                            </p>
                          </div>
                          {selectedHotspotId ===
                            hotspot.hotspot_id.toString() && (
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
            <Button
              type="button"
              onClick={handleSelect}
              disabled={!selectedHotspotId}
            >
              {selectedHotspotId ? "Thêm vào khu vực" : "Chọn một địa điểm"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HotspotAddToAreaModal;
