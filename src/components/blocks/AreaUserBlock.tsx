import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  UserPlus,
  UserMinus,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  getAccountProfilesByAreaId,
  addAccountToArea,
  removeAccountFromArea,
} from "@/services/account_profiles.service";
import type { AccountProfile } from "@/types/account_profiles.service.type";
import UserSelectionModal from "./UserSelectionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AreaUserBlock = ({ areaId }: { areaId: string | undefined }) => {
  const [users, setUsers] = useState<AccountProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AccountProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removeUserDialog, setRemoveUserDialog] = useState<{
    isOpen: boolean;
    user?: AccountProfile;
  }>({ isOpen: false });

  useEffect(() => {
    if (areaId) {
      fetchUsers();
    }
  }, [areaId]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.account_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    if (!areaId) return;

    setIsLoading(true);
    try {
      const data = await getAccountProfilesByAreaId(parseInt(areaId));
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (accountId: string) => {
    if (!areaId) return;

    try {
      await addAccountToArea(accountId, parseInt(areaId));
      toast.success("Thêm người dùng vào khu vực thành công");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error adding user to area:", error);
      toast.error("Có lỗi xảy ra khi thêm người dùng vào khu vực");
    }
  };

  const handleRemoveUser = async (user: AccountProfile) => {
    setRemoveUserDialog({ isOpen: true, user });
  };

  const confirmRemoveUser = async () => {
    const { user } = removeUserDialog;
    if (!user || !areaId) return;

    try {
      await removeAccountFromArea(user.account_id, parseInt(areaId));
      toast.success("Xóa người dùng khỏi khu vực thành công");
      setRemoveUserDialog({ isOpen: false });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error removing user from area:", error);
      toast.error("Có lỗi xảy ra khi xóa người dùng khỏi khu vực");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "root":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "root":
        return "Quản trị viên hệ thống";
      case "admin":
        return "Quản trị viên";
      default:
        return role;
    }
  };

  if (!areaId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-2" />
            <p>Vui lòng chọn một khu vực để xem danh sách người dùng</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Người dùng trong khu vực ({filteredUsers.length})
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Tìm kiếm người dùng</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="user-search"
                placeholder="Tìm theo email, ID người dùng hoặc vai trò..."
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
              <span>Đang tải danh sách người dùng...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <User className="h-12 w-12 mb-2" />
              <p className="text-lg font-medium">
                {searchTerm
                  ? "Không tìm thấy người dùng nào"
                  : "Chưa có người dùng nào trong khu vực này"}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Nhấp vào nút 'Thêm người dùng' để thêm người dùng mới"}
              </p>
            </div>
          )}

          {/* User List */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.account_id}
                  className="transition-all hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.email || "Chưa có email"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            ID: {user.account_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <UserSelectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddUser}
      />

      {/* Remove User Confirmation Dialog */}
      <AlertDialog
        open={removeUserDialog.isOpen}
        onOpenChange={(open) => !open && setRemoveUserDialog({ isOpen: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Xóa người dùng khỏi khu vực
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng{" "}
              <strong>
                {removeUserDialog.user?.email ||
                  removeUserDialog.user?.account_id}
              </strong>{" "}
              khỏi khu vực này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa người dùng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AreaUserBlock;
