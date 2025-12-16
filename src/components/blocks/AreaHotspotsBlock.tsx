import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, MapPin } from "lucide-react";
import {
  getHotspotsByAreaId,
  addHotspotToArea,
  removeHotspotFromArea,
} from "@/services/hotspots.service";
import { getAreaById } from "@/services/areas.service";
import type { Hotspot } from "@/types/hotspots.service.type";
import type { Area } from "@/types/areas.service.type";
import type { WithJoins } from "@/types/pagination.type";
import type { Column, RowAction } from "@/types/table.type";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HotspotAddToAreaModal from "./HotspotAddToAreaModal";

// Extend Hotspot to have id field for DataTable compatibility
interface HotspotWithId extends WithJoins<Hotspot> {
  id: string;
}

const AreaHotspotsBlock = ({ areaId }: { areaId: string | undefined }) => {
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState<WithJoins<Hotspot>[]>([]);
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (areaId) {
      fetchData();
    }
  }, [areaId]);

  const fetchData = async () => {
    if (!areaId) return;

    setLoading(true);
    try {
      // Fetch both area info and hotspots
      const [areaData, hotspotsData] = await Promise.all([
        getAreaById(areaId),
        getHotspotsByAreaId(areaId),
      ]);
      setArea(areaData);
      setHotspots(hotspotsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotspot = async (hotspotId: string) => {
    if (!areaId) return;

    try {
      await addHotspotToArea(hotspotId, areaId);
      toast.success("Đã thêm địa điểm vào khu vực thành công");
      fetchData(); // Reload data
    } catch (error) {
      console.error("Error adding hotspot to area:", error);
      toast.error("Có lỗi xảy ra khi thêm địa điểm vào khu vực");
    }
  };

  const handleRemoveHotspot = async (hotspotId: string) => {
    try {
      await removeHotspotFromArea(hotspotId);
      toast.success("Đã xóa địa điểm khỏi khu vực thành công");
      fetchData(); // Reload data
    } catch (error) {
      console.error("Error removing hotspot from area:", error);
      toast.error("Có lỗi xảy ra khi xóa địa điểm khỏi khu vực");
    }
  };

  const handleViewHotspot = (hotspotId: number) => {
    navigate(`/quan-ly/dia-diem/${hotspotId}`);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const columns: Column<HotspotWithId>[] = [
    {
      key: "hotspot_id",
      label: "ID",
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      ),
    },
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {row.preview_image ? (
            <img
              src={row.preview_image}
              alt={value || "Hotspot"}
              className="w-8 h-8 object-cover rounded border"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded border flex items-center justify-center">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <span className="font-medium">{value || "Không có tiêu đề"}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (value) => {
        if (!value) return "Chưa có mô tả";
        return value.length > 50 ? `${value.substring(0, 50)}...` : value;
      },
    },
    {
      key: "address",
      label: "Địa chỉ",
      filterable: true,
      render: (value) => value || "Chưa có địa chỉ",
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value) => {
        if (!value) return "N/A";
        return new Date(value).toLocaleDateString("vi-VN");
      },
    },
  ];

  const rowActions: RowAction<HotspotWithId>[] = [
    {
      label: "Xem chi tiết",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => handleViewHotspot(row.hotspot_id),
    },
    {
      label: "Xóa khỏi khu vực",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => handleRemoveHotspot(row.hotspot_id.toString()),
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description:
          "Bạn có chắc chắn muốn xóa địa điểm này khỏi khu vực không? Địa điểm sẽ trở thành chưa được gán.",
        confirmText: "Xóa khỏi khu vực",
        cancelText: "Hủy",
      },
    },
  ];

  // Transform hotspots to include id field
  const hotspotsWithId: HotspotWithId[] = hotspots.map((hotspot) => ({
    ...hotspot,
    id: hotspot.hotspot_id?.toString() || "",
  }));

  // Apply filters to the data
  const filteredHotspots = hotspotsWithId.filter((hotspot) => {
    // Apply search filter if exists
    if (filters.search && filters.searchColumn) {
      const searchValue = hotspot[filters.searchColumn as keyof HotspotWithId];
      if (typeof searchValue === "string") {
        return searchValue.toLowerCase().includes(filters.search.toLowerCase());
      }
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản lý địa điểm trong khu vực</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {area?.area_name && (
                  <>
                    Khu vực:{" "}
                    <span className="font-medium">{area.area_name}</span>
                  </>
                )}
              </p>
            </div>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm địa điểm</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredHotspots}
            columns={columns}
            loading={loading}
            rowActions={rowActions}
            rowActionsDisplay="buttons"
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {/* Add Hotspot Modal */}
      <HotspotAddToAreaModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSelect={handleAddHotspot}
        areaName={area?.area_name}
      />
    </div>
  );
};

export default AreaHotspotsBlock;
