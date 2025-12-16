import { useState, useEffect } from "react";
import {
  createUser,
  deleteUsers,
  updateUserByAccountId,
} from "@/services/auth.service";
import { getAllAccountProfiles } from "@/services/account_profiles.service";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";
import type { AccountProfile } from "@/types/account_profiles.service.type";
import type {
  Column,
  TableFilters,
  TableAction,
  RowAction,
} from "@/types/table.type";
import { ADMIN_ROLE, ROOT_ROLE } from "@/constants/role.constants";

// Extended type for DataTable compatibility
type UserForTable = AccountProfile & { id: string };

const ManageUserPage = () => {
  const [users, setUsers] = useState<UserForTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserForTable | null>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    role: ADMIN_ROLE,
  });
  const [editForm, setEditForm] = useState({
    email: "",
    password: "",
    role: ADMIN_ROLE,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [filters, setFilters] = useState<TableFilters>({
    search: "",
    searchColumn: "email",
  });

  const columns: Column<UserForTable>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
      filterable: true,
    },
    {
      key: "role",
      label: "Vai trò",
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: "Root", value: "root" },
        { label: "Admin", value: "admin" },
      ],
      render: (value: string) => (
        <Badge variant={value === "root" ? "destructive" : "secondary"}>
          {value === "root" ? "Root" : "Admin"}
        </Badge>
      ),
    },
    {
      key: "account_id",
      label: "ID Tài khoản",
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllAccountProfiles();
      // Transform data to include id property for DataTable compatibility
      const usersWithId: UserForTable[] = data.map((user) => ({
        ...user,
        id: user.account_id,
      }));
      setUsers(usersWithId);
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleCreateUser = async () => {
    // Validation
    if (!createForm.email.trim() || !createForm.password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!validateEmail(createForm.email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    if (!validatePassword(createForm.password)) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setCreateLoading(true);
      await createUser(
        createForm.email.trim(),
        createForm.password,
        createForm.role
      );
      toast.success("Tạo người dùng thành công");
      setCreateForm({ email: "", password: "", role: ADMIN_ROLE });
      setCreateDialogOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo người dùng"
      );
      console.error("Error creating user:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditUser = (user: UserForTable) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      password: "",
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Validation
    if (!editForm.email.trim()) {
      toast.error("Vui lòng điền email");
      return;
    }

    if (!validateEmail(editForm.email)) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    if (editForm.password && !validatePassword(editForm.password)) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setEditLoading(true);
      await updateUserByAccountId(
        editingUser.account_id,
        editForm.email.trim(),
        editForm.role,
        editForm.password || null
      );
      toast.success("Cập nhật người dùng thành công");
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật người dùng"
      );
      console.error("Error updating user:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUsers = async (selectedUsers: UserForTable[]) => {
    if (selectedUsers.length === 0) return;

    try {
      const accountIds = selectedUsers.map((user) => user.account_id);
      await deleteUsers(accountIds);
      toast.success(`Đã xóa ${selectedUsers.length} người dùng thành công`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa người dùng"
      );
      console.error("Error deleting users:", error);
    }
  };

  // Table actions for multiple selection
  const tableActions: TableAction<UserForTable>[] = [
    {
      label: "Xóa đã chọn",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteUsers,
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description:
          "Bạn có chắc chắn muốn xóa những người dùng đã chọn? Hành động này không thể hoàn tác.",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    },
  ];

  // Row actions for individual users
  const rowActions: RowAction<UserForTable>[] = [
    {
      label: "Chỉnh sửa",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditUser,
      variant: "outline",
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user) => handleDeleteUsers([user]),
      variant: "destructive",
      confirmation: {
        title: "Xác nhận xóa",
        description:
          "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    },
  ];

  const filteredUsers = users.filter((user) => {
    if (!filters.search) return true;

    const searchTerm = filters.search.toLowerCase();
    const searchColumn = filters.searchColumn || "email";

    switch (searchColumn) {
      case "email":
        return user.email?.toLowerCase().includes(searchTerm) || false;
      case "role":
        return user.role.toLowerCase().includes(searchTerm);
      case "account_id":
        return user.account_id.toLowerCase().includes(searchTerm);
      default:
        // Global search across all fields
        return (
          user.email?.toLowerCase().includes(searchTerm) ||
          false ||
          user.role.toLowerCase().includes(searchTerm) ||
          user.account_id.toLowerCase().includes(searchTerm)
        );
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo người dùng mới</DialogTitle>
                <DialogDescription>
                  Thêm người dùng mới vào hệ thống với vai trò admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={createForm.role}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ADMIN_ROLE}>Admin</SelectItem>
                      <SelectItem value={ROOT_ROLE}>Root</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleCreateUser} disabled={createLoading}>
                    {createLoading ? "Đang tạo..." : "Tạo người dùng"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin người dùng. Để trống mật khẩu nếu không
                  muốn thay đổi.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="user@example.com"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Mật khẩu mới (tùy chọn)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Để trống nếu không thay đổi"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Vai trò</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ADMIN_ROLE}>Admin</SelectItem>
                      <SelectItem value={ROOT_ROLE}>Root</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingUser(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={editLoading}>
                    {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={loading}
        filters={filters}
        onFiltersChange={setFilters}
        actions={tableActions}
        rowActions={rowActions}
        createButtonLabel="Tạo người dùng"
        onCreateClick={() => setCreateDialogOpen(true)}
      />
    </div>
  );
};

export default ManageUserPage;
