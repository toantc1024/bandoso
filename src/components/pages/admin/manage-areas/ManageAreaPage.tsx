import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useAuthStore } from "@/stores/auth.store";
import { getAreasByAccountId } from "@/services/account_areas.service";
import { ADMIN_ROLE } from "@/constants/role.constants";
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

type AreaWithId = WithJoins<Area> & { id: string };

const ManageAreaPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [areas, setAreas] = useState<AreaWithId[]>([]);
  const [allAreaNames, setAllAreaNames] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({ area_name: "" });
  const [rowActionsDisplay] = useState<"buttons" | "dropdown">("buttons");

  // Restore filters from URL params
  const [pagination, setPagination] = useState<PaginationInfo>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
    total: 0,
    totalPages: 0,
  }));
  const [filters, setFilters] = useState<TableFilters>(() => {
    const saved: TableFilters = {};
    const search = searchParams.get("search");
    const searchColumn = searchParams.get("searchColumn");
    const columnFilters = searchParams.get("columnFilters");
    if (search) saved.search = search;
    if (searchColumn) saved.searchColumn = searchColumn;
    if (columnFilters) {
      try { saved.columnFilters = JSON.parse(columnFilters); } catch {}
    }
    return saved;
  });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(() => {
    const sortKey = searchParams.get("sortKey");
    const sortDir = searchParams.get("sortDir") as "asc" | "desc" | null;
    if (sortKey && sortDir) return { key: sortKey, direction: sortDir };
    return null;
  });

  // Persist filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (pagination.page > 1) params.set("page", String(pagination.page));
    if (pagination.pageSize !== 10) params.set("pageSize", String(pagination.pageSize));
    if (filters.search) params.set("search", filters.search);
    if (filters.searchColumn) params.set("searchColumn", filters.searchColumn);
    if (filters.columnFilters && Object.keys(filters.columnFilters).length > 0) {
      params.set("columnFilters", JSON.stringify(filters.columnFilters));
    }
    if (sortConfig) {
      params.set("sortKey", sortConfig.key);
      params.set("sortDir", sortConfig.direction);
    }
    setSearchParams(params, { replace: true });
  }, [filters, sortConfig, pagination.page, pagination.pageSize]);

  // Fetch all area names for filter dropdown (no pagination)
  const fetchAllAreaNames = async () => {
    try {
      const { user } = useAuthStore.getState();
      let filters: any = undefined;
      // For non-root admins: only show assigned areas in filter dropdown
      if (user?.role === ADMIN_ROLE && user?.account_id) {
        const areaIds = await getAreasByAccountId(user.account_id);
        if (areaIds.length === 0) { setAllAreaNames([]); return; }
        filters = { conditions: [{ column: "area_id" as const, operator: "in" as const, value: areaIds }] };
      }
      const result = await getAreas({ pagination: { page: 1, limit: 9999 }, filters });
      const names = result.data.map((a) => ({ label: a.area_name, value: a.area_name }));
      setAllAreaNames(names);
    } catch (err) {
      console.error("Error fetching area names:", err);
    }
  };

  useEffect(() => {
    fetchAllAreaNames();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const { user } = useAuthStore.getState();
      const searchColumns: Column<Area>[] = [
        { key: "area_name", label: "Tên khu vực", filterable: true },
      ];
      const apiFilters = convertTableFiltersToApiFilters<Area>(
        filters,
        sortConfig,
        searchColumns,
        { exactSearch: true }
      );

      // For non-root admins: only show assigned areas
      if (user?.role === ADMIN_ROLE && user?.account_id) {
        const areaIds = await getAreasByAccountId(user.account_id);
        if (areaIds.length === 0) {
          setAreas([]);
          setPagination({ page: 1, pageSize: pagination.pageSize, total: 0, totalPages: 0 });
          setLoading(false);
          return;
        }
        apiFilters.conditions = [
          ...(apiFilters.conditions || []),
          { column: "area_id" as const, operator: "in" as const, value: areaIds },
        ];
      }

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
      fetchAllAreaNames();
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
      fetchAllAreaNames();
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
      fetchAllAreaNames();
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
      filterOptions: allAreaNames,
    },
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
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortConfig: SortConfig | null) => {
    setSortConfig(newSortConfig);
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between">
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
