import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAreas,
  createArea,
  updateArea,
  deleteArea,
  deleteMultipleAreas,
} from "../../../../services/areas.service";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Globe, Pencil, Trash2 } from "lucide-react";
import type { Area } from "@/types/areas.service.type";
import type {
  Column,
  RowAction,
  TableAction,
  PaginationInfo,
  TableFilters,
  SortConfig,
} from "@/types/table.type";
import type { WithJoins } from "@/types/pagination.type";
import { convertTableFiltersToApiFilters } from "@/utils/table.utils";

// Extend Area to include id for DataTable compatibility
type AreaWithId = WithJoins<Area> & { id: string };

const ManageAreaPage = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AreaWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ area_name: "" });
  const [rowActionsDisplay] = useState<"buttons" | "dropdown">("buttons");

  // Table state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TableFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      // Create a simple column definition for search purposes
      const searchColumns: Column<Area>[] = [
        { key: "area_name", label: "Tên khu vực", filterable: true },
      ];
      const apiFilters = convertTableFiltersToApiFilters<Area>(
        filters,
        sortConfig,
        searchColumns
      );

      // Debug log to see what filters are being sent
      console.log("Table filters:", filters);
      console.log("API filters:", apiFilters);

      const result = await getAreas({
        pagination: {
          page: pagination.page,
          limit: pagination.pageSize,
        },
        filters: apiFilters,
        joinOptions: {
          columns: "*",
          joins: [
            {
              table: "hotspots",
              foreignKey: "main_hotspot_id",
              alias: "hotspot_areas",
              columns: "*",
            },
          ],
        },
      });

      const areasWithId = result.data.map((area) => ({
        ...area,
        id: area.area_id,
      }));

      setAreas(areasWithId);
      setPagination({
        page: result.page,
        pageSize: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error("Error fetching areas:", error);
      toast.error("Không thể tải danh sách khu vực");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [pagination.page, pagination.pageSize, filters, sortConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await updateArea(editingArea.area_id, formData);
        toast.success("Cập nhật khu vực thành công");
      } else {
        await createArea(formData);
        toast.success("Tạo khu vực thành công");
      }
      setDialogOpen(false);
      setEditingArea(null);
      setFormData({ area_name: "" });
      fetchAreas();
    } catch (error) {
      console.error("Error saving area:", error);
      toast.error("Không thể lưu thông tin khu vực");
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    navigate(`/quan-ly/khu-vuc/${area.area_id}`);
  };

  const handleDelete = async (area: Area) => {
    try {
      await deleteArea(area.area_id);
      toast.success("Xóa khu vực thành công");
      fetchAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
      toast.error("Không thể xóa khu vực");
    }
  };

  const handleBulkDelete = async (selectedAreas: AreaWithId[]) => {
    try {
      const area_ids = selectedAreas.map((area) => area.area_id);
      await deleteMultipleAreas(area_ids);
      toast.success(`Đã xóa ${selectedAreas.length} khu vực thành công`);
      fetchAreas();
    } catch (error) {
      console.error("Error deleting areas:", error);
      toast.error("Không thể xóa các khu vực đã chọn");
    }
  };

  const handleCreate = () => {
    setEditingArea(null);
    setFormData({ area_name: "" });
    setDialogOpen(true);
  };

  const columns: Column<AreaWithId>[] = [
    {
      key: "area_name",
      label: "Tên khu vực",
      sortable: true,
      filterable: true,
    },

    // {
    //   key: "hotspot_count",
    //   label: "Số lượng Địa điểm",
    //   render: (_, row) => {
    //     // Count hotspots if they exist in joined data
    //     const hotspots = row.hotspot_areas || [];
    //     let hotspotCount = 0;
    //     hotspotCount = Array.isArray(hotspots) ? hotspots.length : 0;
    //     return (
    //       <Badge asChild variant={"outline"}>
    //         <span>{hotspotCount} địa điểm</span>
    //       </Badge>
    //     );
    //   },
    // },
  ];

  const rowActions: RowAction<AreaWithId>[] = [
    {
      label: "Website",
      icon: <Globe className="h-4 w-4" />,
      onClick: (row) => {
        const url = row.domain.startsWith("https") ? row.domain : `https://${row.domain}`;
        window.open(url, "_blank", "noopener,noreferrer");
      },
    },
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa khu vực này không?",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    },
  ];

  const tableActions: TableAction<AreaWithId>[] = [
    {
      label: "Xóa đã chọn",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa các khu vực đã chọn không?",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    },
  ];

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, page, pageSize }));
  };

  const handleFiltersChange = (newFilters: TableFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleSortChange = (newSortConfig: SortConfig | null) => {
    setSortConfig(newSortConfig);
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Khu vực</h1>
        </div> */}
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingArea ? "Chỉnh sửa khu vực" : "Tạo khu vực mới"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="area_name">Tên khu vực</Label>
                  <Input
                    id="area_name"
                    value={formData.area_name}
                    onChange={(e) =>
                      setFormData({ ...formData, area_name: e.target.value })
                    }
                    placeholder="Nhập tên khu vực"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit">
                    {editingArea ? "Cập nhật" : "Tạo"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={areas}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        actions={tableActions}
        rowActions={rowActions}
        rowActionsDisplay={rowActionsDisplay}
        onCreateClick={handleCreate}
        createButtonLabel="Thêm khu vực mới"
      />
    </div>
  );
};

export default ManageAreaPage;
