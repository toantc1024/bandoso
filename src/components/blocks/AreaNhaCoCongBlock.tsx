import React, { useEffect, useState } from "react";
import { getAreaById, updateArea } from "@/services/areas.service";
import type { Area } from "@/types/areas.service.type";
import type { NhaCoCong } from "@/types/hotspots.service.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Home,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Save,
  MapPin,
  Calendar,
} from "lucide-react";
import LatLonPicker from "../ui/lat-lon-picker";
import RichTextEditor from "../ui/RichTextEditor";
import DragDropImageUploader from "../ui/DragDropImageUploader";

interface AreaNhaCoCongBlockProps {
  areaId: string | undefined;
}

export const AreaNhaCoCongBlock: React.FC<AreaNhaCoCongBlockProps> = ({ areaId }) => {
  const [area, setArea] = useState<Area | null>(null);
  const [items, setItems] = useState<NhaCoCong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NhaCoCong | null>(null);

  // Form state
  const [nhaCuaAi, setNhaCuaAi] = useState("");
  const [tenLietSi, setTenLietSi] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [ngayMat, setNgayMat] = useState("");
  const [queQuan, setQueQuan] = useState("");
  const [tieuSu, setTieuSu] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (!areaId) return;
    setIsLoading(true);
    getAreaById(areaId)
      .then((data) => {
        setArea(data);
        setItems(data.metadata?.nha_co_cong || []);
      })
      .catch((err) => {
        console.error("Error fetching area:", err);
        toast.error("Không thể tải thông tin Nhà có công");
      })
      .finally(() => setIsLoading(false));
  }, [areaId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNhaCuaAi("");
    setTenLietSi("");
    setNgaySinh("");
    setNgayMat("");
    setQueQuan("");
    setTieuSu("");
    setLatitude("");
    setLongitude("");
    setImages([]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: NhaCoCong) => {
    setEditingItem(item);
    setNhaCuaAi(item.nha_cua_ai || "");
    setTenLietSi(item.ten_liet_si || "");
    setNgaySinh(item.ngay_sinh || "");
    setNgayMat(item.ngay_mat || "");
    setQueQuan(item.que_quan || "");
    setTieuSu(item.tieu_su || "");
    setLatitude(item.latitude?.toString() || "");
    setLongitude(item.longitude?.toString() || "");
    setImages(item.images || []);
    setShowModal(true);
  };

  const handleSaveItem = () => {
    if (!nhaCuaAi.trim() || !tenLietSi.trim()) {
      toast.error("Vui lòng nhập tên chủ nhà và tên Liệt sĩ");
      return;
    }

    const newItem: NhaCoCong = {
      id: editingItem?.id || `ncc-${Date.now()}`,
      nha_cua_ai: nhaCuaAi.trim(),
      ten_liet_si: tenLietSi.trim(),
      ngay_sinh: ngaySinh.trim(),
      ngay_mat: ngayMat.trim(),
      que_quan: queQuan.trim(),
      tieu_su: tieuSu.trim(),
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      images,
    };

    setItems((prev) => {
      const exists = prev.some((x) => x.id === newItem.id);
      if (exists) {
        return prev.map((x) => (x.id === newItem.id ? newItem : x));
      }
      return [...prev, newItem];
    });

    setShowModal(false);
    toast.success("Đã thêm/chỉnh sửa thông tin Nhà Có Công!");
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast.success("Đã xóa Nhà Có Công!");
  };

  const handleSaveAreaChanges = async () => {
    if (!areaId) return;
    setIsSaving(true);
    try {
      const updatedArea = await updateArea(areaId, {
        metadata: {
          ...(area?.metadata || {}),
          nha_co_cong: items,
        },
      });
      setArea(updatedArea);
      toast.success("Đã lưu thông tin Nhà Có Công Với Cách Mạng cho Khu Vực!");
    } catch (err: any) {
      console.error("Error saving area nha co cong:", err);
      toast.error("Không thể lưu thông tin khu vực");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !area) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Quản Lý Nhà Có Công Với Cách Mạng ({area?.area_name})
          </h2>
          <p className="text-sm text-muted-foreground">
            Danh sách các hộ gia đình chính sách, Nhà có công với cách mạng thuộc khu vực
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleOpenAdd} className="gap-1.5">
            <Plus className="w-4 h-4" /> Thêm Nhà Có Công
          </Button>
          <Button size="sm" onClick={handleSaveAreaChanges} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Dữ Liệu Khu Vực
          </Button>
        </div>
      </div>

      {/* ── Items List Grid ── */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Home className="w-12 h-12 mx-auto text-muted-foreground" />
            <div className="font-semibold text-base">Chưa có dữ liệu Nhà có công</div>
            <p className="text-sm text-muted-foreground">
              Hãy nhấn "Thêm Nhà Có Công" để thêm thông tin gia đình liệt sĩ, người có công với cách mạng.
            </p>
            <Button onClick={handleOpenAdd} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Thêm Ngay
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                {/* Images Preview Banner */}
                {item.images && item.images.length > 0 ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.images[0]}
                      alt={item.ten_liet_si}
                      className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        +{item.images.length - 1} ảnh
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-28 bg-muted flex items-center justify-center text-muted-foreground">
                    <Home className="w-8 h-8" />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider">
                    Nhà của: {item.nha_cua_ai}
                  </div>
                  <CardTitle className="text-lg font-bold truncate">
                    Liệt sĩ: {item.ten_liet_si}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  {(item.ngay_sinh || item.ngay_mat) && (
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {item.ngay_sinh || "??"} - {item.ngay_mat || "??"}
                      </span>
                    </div>
                  )}

                  {item.que_quan && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Quê quán: {item.que_quan}</span>
                    </div>
                  )}

                  {item.latitude && item.longitude && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                      📍 GPS: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                    </div>
                  )}

                  {item.tieu_su && (
                    <div
                      className="pt-2 border-t text-foreground line-clamp-3 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.tieu_su }}
                    />
                  )}
                </CardContent>
              </div>

              <div className="p-4 border-t flex items-center justify-end gap-2 bg-muted/20">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)} className="gap-1">
                  <Edit3 className="w-3.5 h-3.5" /> Sửa
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Home className="w-5 h-5 text-primary" />
              {editingItem ? "Chỉnh Sửa Nhà Có Công" : "Thêm Nhà Có Công Với Cách Mạng"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ncc-owner" className="font-semibold">
                  Nhà đó của ai *
                </Label>
                <Input
                  id="ncc-owner"
                  placeholder="Ví dụ: Ông Nguyễn Văn A (Thân nhân)"
                  value={nhaCuaAi}
                  onChange={(e) => setNhaCuaAi(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ncc-name" className="font-semibold">
                  Tên của Liệt sĩ *
                </Label>
                <Input
                  id="ncc-name"
                  placeholder="Ví dụ: Liệt sĩ Nguyễn Văn B"
                  value={tenLietSi}
                  onChange={(e) => setTenLietSi(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ncc-dob" className="font-semibold">
                  Ngày sinh
                </Label>
                <Input
                  id="ncc-dob"
                  placeholder="1945 hoặc 15/05/1945"
                  value={ngaySinh}
                  onChange={(e) => setNgaySinh(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ncc-dod" className="font-semibold">
                  Ngày mất
                </Label>
                <Input
                  id="ncc-dod"
                  placeholder="1968 hoặc 30/04/1968"
                  value={ngayMat}
                  onChange={(e) => setNgayMat(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ncc-hometown" className="font-semibold">
                Quê quán
              </Label>
              <Input
                id="ncc-hometown"
                placeholder="Nhập quê quán gia đình liệt sĩ..."
                value={queQuan}
                onChange={(e) => setQueQuan(e.target.value)}
              />
            </div>

            {/* GPS Position */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Định Vị Vị Trí (GPS)</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Vĩ độ (Latitude)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
                <Input
                  placeholder="Kinh độ (Longitude)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMapPicker(true)}
                className="w-full mt-1 gap-1.5"
              >
                <MapPin className="w-4 h-4 text-primary" /> Chọn vị trí trên bản đồ
              </Button>
            </div>

            {/* TipTap Rich Text Editor for Biography */}
            <div className="space-y-1.5">
              <Label className="font-semibold">
                Tiểu Sử (Trình soạn thảo WYSIWYG TipTap Editor)
              </Label>
              <RichTextEditor
                content={tieuSu}
                onChange={setTieuSu}
                placeholder="Nhập tiểu sử chi tiết... Hỗ trợ in đậm, in nghiêng, tiêu đề, danh sách, màu chữ..."
              />
            </div>

            {/* Drag & Drop Square Multiple Images Uploader */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="font-semibold">Hình Ảnh (Kéo thả nhiều ô vuông ảnh)</Label>
              <DragDropImageUploader
                images={images}
                onChange={setImages}
                folderPath={`base/nhacocong/${areaId || "default"}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button type="button" onClick={handleSaveItem}>
                Lưu Thông Tin
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
          <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-4">
            <DialogHeader>
              <DialogTitle>Chọn Tọa Độ GPS Trên Bản Đồ</DialogTitle>
            </DialogHeader>
            <div className="flex-1 rounded-xl overflow-hidden relative border">
              <LatLonPicker
                initialCenter={latitude && longitude ? [parseFloat(longitude), parseFloat(latitude)] : undefined}
                initialMarker={latitude && longitude ? [parseFloat(longitude), parseFloat(latitude)] : undefined}
                onLocationSelect={(coords) => {
                  setLongitude(coords[0].toString());
                  setLatitude(coords[1].toString());
                  setShowMapPicker(false);
                  toast.success("Đã chọn vị trí!");
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AreaNhaCoCongBlock;
