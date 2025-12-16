import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { getAccountProfilesNotInAnyArea } from "@/services/account_profiles.service";
import type { AccountProfile } from "@/types/account_profiles.service.type";
import { toast } from "sonner";
import { Loader2, Search, User, UserPlus } from "lucide-react";

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (accountId: string) => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [users, setUsers] = useState<AccountProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AccountProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
  }, [isOpen]);

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

  const fetchAvailableUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAccountProfilesNotInAnyArea();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching available users:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = () => {
    if (selectedUserId) {
      onSelect(selectedUserId);
      onClose();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedUserId("");
    onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm người dùng vào khu vực
          </DialogTitle>
          <DialogDescription>
            Chọn người dùng chưa thuộc khu vực nào để thêm vào khu vực này
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col px-1 space-y-4 overflow-hidden">
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
                  : "Không có người dùng khả dụng"}
              </p>
              <p className="text-sm">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Tất cả người dùng đã được gán vào khu vực"}
              </p>
            </div>
          )}

          {/* User List */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredUsers.map((user) => (
                <Card
                  key={user.account_id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedUserId === user.account_id
                      ? "border-blue-200 border-2 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedUserId(
                      selectedUserId === user.account_id ? "" : user.account_id
                    );
                  }}
                  title={
                    selectedUserId === user.account_id
                      ? "Nhấp để bỏ chọn"
                      : "Nhấp để chọn"
                  }
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
                      <div className="flex-shrink-0">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
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
              disabled={!selectedUserId}
            >
              {selectedUserId ? "Thêm người dùng" : "Chọn một người dùng"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSelectionModal;
