import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { Pencil, Trash2 } from "lucide-react";
import type {
  Column,
  RowAction,
  TableAction,
  PaginationInfo,
  TableFilters,
  SortConfig,
} from "@/types/table.type";
import type { Hotspot } from "@/types/hotspots.service.type";
import {
  getHotspots,
  deleteHotspot,
  bulkDeleteHotspots,
} from "@/services/hotspots.service";
import { getAreasByAccountId } from "@/services/account_areas.service";
import { HotspotModal } from "../../../blocks/HotspotModalBlock";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { ADMIN_ROLE } from "@/constants/role.constants";

const ManageHotspotsPage = () => {
  const navigate = useNavigate();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TableFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  // const [editModalOpen, setEditModalOpen] = useState(false);
  // const [viewModalOpen, setViewModalOpen] = useState(false);
  // const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const columns: Column<Hotspot>[] = [
    {
      key: "hotspot_id",
      label: "ID",
      sortable: true,
    },
    {
      key: "title",
      label: "Tiêu đề",
      sortable: true,
      filterable: true,
      render: (value) => value || "Chưa có tiêu đề",
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
      key: "area_id",
      label: "Khu vực",
      sortable: true,
      filterable: true,
      render: (_, row) => {
        // @ts-ignore - area is joined from areas table
        return row.area?.[0]?.area_name || "Chưa có khu vực";
      },
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

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const { user } = useAuthStore.getState();

      // Prepare base filters
      let apiFilters: any = undefined;

      // Add search filter if exists
      if (filters.search) {
        apiFilters = {
          search: {
            columns: ["title", "description", "address"] as (keyof Hotspot)[],
            query: filters.search,
          },
        };
      }

      // Check if user is admin and needs area filtering
      if (user?.role === ADMIN_ROLE) {
        // Get areas managed by this admin user
        const areaIds = await getAreasByAccountId(user.account_id);

        if (areaIds.length === 0) {
          // Admin has no areas assigned, show empty result
          setHotspots([]);
          setPagination({
            page: 1,
            pageSize: pagination.pageSize,
            total: 0,
            totalPages: 0,
          });
          return;
        }

        // Add area filter for admin users
        apiFilters = {
          ...apiFilters,
          conditions: [
            {
              column: "area_id",
              operator: "in",
              value: areaIds,
            },
          ],
        };
      }

      // Fetch hotspots with appropriate filters
      const result = await getHotspots({
        filters: apiFilters,
        pagination: {
          page: pagination.page,
          limit: pagination.pageSize,
        },
        joinOptions: {
          columns: "*",
          joins: [
            {
              table: "areas",
              columns: "area_name",
              foreignKey: "area_id",
              alias: "area",
            },
          ],
        },
      });

      setHotspots(result.data);
      setPagination({
        page: result.page,
        pageSize: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error) {
      toast.error("Lỗi khi tải danh sách hotspot");
      console.error("Error fetching hotspots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotspotId: string) => {
    try {
      await deleteHotspot(hotspotId);
      toast.success("Xóa hotspot thành công");
      fetchHotspots();
    } catch (error) {
      toast.error("Lỗi khi xóa hotspot");
      console.error("Error deleting hotspot:", error);
    }
  };

  const handleBulkDelete = async (selectedHotspots: Hotspot[]) => {
    try {
      const hotspotIds = selectedHotspots.map((hotspot) =>
        hotspot.hotspot_id.toString()
      );
      await bulkDeleteHotspots(hotspotIds);
      toast.success(`Xóa thành công ${selectedHotspots.length} địa điểm`);
      fetchHotspots();
    } catch (error) {
      toast.error("Lỗi khi xóa các địa điểm đã chọn");
      console.error("Error bulk deleting hotspots:", error);
    }
  };

  const tableActions: TableAction<Hotspot>[] = [
    {
      label: "Xóa đã chọn",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description: "Bạn có chắc chắn muốn xóa các địa điểm đã chọn không?",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    },
  ];

  const rowActions: RowAction<Hotspot>[] = [
    // TODO: Implement view and edit functionality
    // {
    //   label: "Xem chi tiết",
    //   icon: <Eye className="h-4 w-4" />,
    //   onClick: (row) => {
    //     setSelectedHotspot(row);
    //     setViewModalOpen(true);
    //   },
    //   variant: "outline",
    // },
    // {
    //   label: "Chỉnh sửa",
    //   icon: <Pencil className="h-4 w-4" />,
    //   onClick: (row) => {
    //     setSelectedHotspot(row);
    //     setEditModalOpen(true);
    //   },
    //   variant: "default",
    // },
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (row) => {
        navigate(`/quan-ly/dia-diem/${row.hotspot_id}`);
      },
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row) => handleDelete(row.hotspot_id.toString()),
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description:
          "Bạn có chắc chắn muốn xóa hotspot này không? Hành động này không thể hoàn tác.",
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

  const handleCreateSuccess = (createdHotspot: any) => {
    setCreateModalOpen(false);
    toast.success("Tạo hotspot thành công");
    // Navigate to the created hotspot detail page
    navigate(`/quan-ly/dia-diem/${createdHotspot.hotspot_id}`);
  };

  useEffect(() => {
    fetchHotspots();
  }, [pagination.page, pagination.pageSize, filters, sortConfig]);

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between">
        <div>
          {/* <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Hotspots
          </h1>
          <p className="text-muted-foreground">
            Quản lý các địa điểm trong hệ thống VR của bạn
          </p> */}
        </div>
      </div>

      <DataTable
        data={hotspots}
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
        rowActionsDisplay="buttons"
        onCreateClick={() => setCreateModalOpen(true)}
        createButtonLabel="Tạo địa điểm mới"
      />

      {/* Create Modal */}
      <HotspotModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ManageHotspotsPage;
