import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Edit, Trash2 } from "lucide-react";
import type { Hotspot } from "@/types/hotspots.service.type";
import { getPanoramasByHotspotId } from "@/services/panoramas.service";
import type { Panorama } from "@/types/panoramas.service.type";
import PanoramaCRUDModal from "./PanoramaCRUDModal";
import type { Column, RowAction } from "@/types/table.type";
import { ImageZoom } from "../ui/shadcn-io/image-zoom";

// Extend Panorama to have id field for DataTable compatibility
interface PanoramaWithId extends Panorama {
  id: string;
}

const HotspotPanoramaBlock = ({
  currentHotspot,
}: {
  currentHotspot: Partial<Hotspot>;
}) => {
  const [panoramas, setPanoramas] = useState<Panorama[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">(
    "create"
  );
  const [selectedPanorama, setSelectedPanorama] = useState<Panorama | null>(
    null
  );
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchPanoramas = async () => {
    if (!currentHotspot.hotspot_id) return;

    setLoading(true);
    try {
      const data = await getPanoramasByHotspotId(currentHotspot.hotspot_id);
      setPanoramas(data);
    } catch (error) {
      console.error("Error fetching panoramas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanoramas();
  }, [currentHotspot]);

  const handleCreateClick = () => {
    setSelectedPanorama(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditClick = (panorama: PanoramaWithId) => {
    setSelectedPanorama(panorama);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeleteClick = (panorama: PanoramaWithId) => {
    setSelectedPanorama(panorama);
    setModalMode("delete");
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchPanoramas();
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Transform panoramas to include id field
  const panoramasWithId: PanoramaWithId[] = panoramas.map((panorama) => ({
    ...panorama,
    id: panorama.panorama_id,
  }));

  // Apply filters to the data
  const filteredPanoramas = panoramasWithId.filter((panorama) => {
    // Apply search filter if exists
    if (filters.search && filters.searchColumn) {
      const searchValue = filters.search.toLowerCase();
      const columnValue = String(
        panorama[filters.searchColumn as keyof PanoramaWithId] || ""
      ).toLowerCase();
      if (!columnValue.includes(searchValue)) {
        return false;
      }
    }

    // Apply column-specific filters
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "search" && key !== "searchColumn" && value) {
        const columnValue = String(
          panorama[key as keyof PanoramaWithId] || ""
        ).toLowerCase();
        const filterValue = String(value).toLowerCase();
        if (!columnValue.includes(filterValue)) {
          return false;
        }
      }
    }

    return true;
  });

  const columns: Column<PanoramaWithId>[] = [
    {
      key: "panorama_id",
      label: "ID",
      sortable: true,
      filterable: true,
    },
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      filterable: true,
    },
    {
      key: "preview_image",
      label: "Ảnh xem trước",
      render: (value: string) => (
        <div className="w-16 h-auto overflow-hidden rounded-lg border">
          <ImageZoom>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </ImageZoom>
        </div>
      ),
    },

    {
      key: "created_at",
      label: "Ngày tạo",
      sortable: true,
      render: (value: string) => (
        <span>{new Date(value).toLocaleDateString("vi-VN")}</span>
      ),
    },
  ];

  const rowActions: RowAction<PanoramaWithId>[] = [
    {
      label: "Chỉnh sửa",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditClick,
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteClick,
      variant: "destructive",
    },
  ];

  return (
    <div className="space-y-0">
      <Card>
        <CardContent>
          <DataTable
            data={filteredPanoramas}
            columns={columns}
            loading={loading}
            rowActions={rowActions}
            rowActionsDisplay="buttons"
            onCreateClick={handleCreateClick}
            createButtonLabel="Thêm panorama"
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {currentHotspot.hotspot_id && (
        <PanoramaCRUDModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          panorama={selectedPanorama}
          hotspotId={currentHotspot.hotspot_id.toString()}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default HotspotPanoramaBlock;
