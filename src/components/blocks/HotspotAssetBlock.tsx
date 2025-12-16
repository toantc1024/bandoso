import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Download, ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Hotspot } from "@/types/hotspots.service.type";
import type { Asset } from "@/types/asset.type";
import type { Column, RowAction } from "@/types/table.type";
import { getAssetsByHotspotId } from "@/services/assets.service";
import AssetUploadModal from "./AssetUploadModal";
import AssetManageModal from "./AssetManageModal";

// Extend Asset to have id field for DataTable compatibility
interface AssetWithId extends Asset {
  id: string;
}

const HotspotAssetBlock = ({
  currentHotspot,
}: {
  currentHotspot: Partial<Hotspot>;
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [manageModalMode, setManageModalMode] = useState<"edit" | "delete">(
    "edit"
  );
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchAssets = async () => {
    if (!currentHotspot.hotspot_id) return;

    setLoading(true);
    try {
      const data = await getAssetsByHotspotId(
        currentHotspot.hotspot_id.toString()
      );
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentHotspot]);

  const handleCreateClick = () => {
    setUploadModalOpen(true);
  };

  const handleEditClick = (asset: AssetWithId) => {
    setSelectedAsset(asset);
    setManageModalMode("edit");
    setManageModalOpen(true);
  };

  const handleDeleteClick = (asset: AssetWithId) => {
    setSelectedAsset(asset);
    setManageModalMode("delete");
    setManageModalOpen(true);
  };

  const handleDownloadClick = (asset: AssetWithId) => {
    window.open(asset.image_url, "_blank");
  };

  const handleModalSuccess = () => {
    fetchAssets();
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Transform assets to include id field
  const assetsWithId: AssetWithId[] = assets.map((asset) => ({
    ...asset,
    id: asset.asset_id,
  }));

  // Apply filters to the data
  const filteredAssets = assetsWithId.filter((asset) => {
    // Apply search filter if exists
    if (filters.search && filters.searchColumn) {
      const searchValue = filters.search.toLowerCase();
      const columnValue = String(
        asset[filters.searchColumn as keyof AssetWithId] || ""
      ).toLowerCase();
      if (!columnValue.includes(searchValue)) {
        return false;
      }
    }

    // Apply column-specific filters
    for (const [key, value] of Object.entries(filters)) {
      if (key !== "search" && key !== "searchColumn" && value) {
        const columnValue = String(
          asset[key as keyof AssetWithId] || ""
        ).toLowerCase();
        const filterValue = String(value).toLowerCase();
        if (!columnValue.includes(filterValue)) {
          return false;
        }
      }
    }

    return true;
  });

  const columns: Column<AssetWithId>[] = [
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      filterable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value
            ? value.length > 50
              ? `${value.substring(0, 50)}...`
              : value
            : "Không có mô tả"}
        </span>
      ),
    },
    {
      key: "image_url",
      label: "Hình ảnh",
      render: (value: string) => (
        <div className="w-16 h-16">
          <img
            src={value}
            alt="Asset"
            className="w-full h-full object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
            }}
          />
        </div>
      ),
    },
    {
      key: "panorama_id",
      label: "Panorama",
      filterable: true,
      render: (value?: string) => (
        <span className={value ? "text-green-600" : "text-gray-400"}>
          {value || "Không có"}
        </span>
      ),
    },
    {
      key: "asset_id",
      label: "Liên kết",
      render: (_: string, row: AssetWithId) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(row.image_url, "_blank")}
          className="h-8 px-2"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  const rowActions: RowAction<AssetWithId>[] = [
    {
      label: "Tải xuống",
      icon: <Download className="h-4 w-4" />,
      onClick: handleDownloadClick,
    },
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
            data={filteredAssets}
            columns={columns}
            loading={loading}
            rowActions={rowActions}
            rowActionsDisplay="buttons"
            onCreateClick={handleCreateClick}
            createButtonLabel="Thêm ảnh"
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </CardContent>
      </Card>

      {currentHotspot.hotspot_id && (
        <>
          <AssetUploadModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            hotspotId={currentHotspot.hotspot_id.toString()}
            onSuccess={handleModalSuccess}
          />

          <AssetManageModal
            open={manageModalOpen}
            onOpenChange={setManageModalOpen}
            mode={manageModalMode}
            asset={selectedAsset}
            hotspotId={currentHotspot.hotspot_id.toString()}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </div>
  );
};

export default HotspotAssetBlock;
