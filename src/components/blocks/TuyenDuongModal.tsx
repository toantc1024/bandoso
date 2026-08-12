import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TuyenDuong } from "@/types/hotspots.service.type";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Trash2,
  Route,
  Check,
  MousePointerClick,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "../ui/RichTextEditor";
import DragDropImageUploader from "../ui/DragDropImageUploader";

interface TuyenDuongModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tuyenDuong: TuyenDuong) => void;
  initialData?: TuyenDuong | null;
  defaultCenter?: [number, number];
}

const PRESET_COLORS = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#d97706", // Amber
  "#9333ea", // Purple
  "#0891b2", // Cyan
  "#e11d48", // Rose
];

export const TuyenDuongModal: React.FC<TuyenDuongModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  defaultCenter = [106.824974, 10.796789],
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ngaySinh, setNgaySinh] = useState("");
  const [ngayMat, setNgayMat] = useState("");
  const [queQuan, setQueQuan] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [points, setPoints] = useState<[number, number][]>([]);
  const [images, setImages] = useState<string[]>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setNgaySinh(initialData.ngay_sinh || "");
      setNgayMat(initialData.ngay_mat || "");
      setQueQuan(initialData.que_quan || "");
      setColor(initialData.color || "#2563eb");
      setPoints(initialData.points || []);
      setImages(initialData.images || []);
    } else {
      setName("");
      setDescription("");
      setNgaySinh("");
      setNgayMat("");
      setQueQuan("");
      setColor("#2563eb");
      setPoints([]);
      setImages([]);
    }
  }, [initialData, open]);

  // Initialize Fullscreen Map
  useEffect(() => {
    if (!open) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapRef.current) {
        const mapKey =
          import.meta.env.VITE_GOONG_MAP_KEY ||
          import.meta.env.VITE_GOONG_MAP_TILES_KEY ||
          "hkBRTOlzhKDE79Z6WGwQCgI9MTgsGXyUNC7jS8i3";
        const goongStyleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapKey}`;

        const center: [number, number] =
          points.length > 0 ? points[0] : defaultCenter;

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: goongStyleUrl,
          center: center,
          zoom: 15,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
          map.resize();
          updateMapSourceAndMarkers(points);
        });

        map.on("click", (e) => {
          const newPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          setPoints((prev) => [...prev, newPoint]);
        });
      } else {
        mapRef.current.resize();
        updateMapSourceAndMarkers(points);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [open]);

  // Update map polyline & markers when points or color changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      updateMapSourceAndMarkers(points);
    }
  }, [points, color]);

  const updateMapSourceAndMarkers = (pts: [number, number][]) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pts.forEach((pt, index) => {
      const el = document.createElement("div");
      el.className =
        "flex items-center justify-center w-7 h-7 rounded-full font-bold text-white text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform";
      el.style.backgroundColor = color;
      el.innerText = (index + 1).toString();

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(pt)
        .addTo(map);

      markersRef.current.push(marker);
    });

    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: pts,
      },
    };

    if (map.getSource("route-line")) {
      (map.getSource("route-line") as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("route-line", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "route-line-layer",
        type: "line",
        source: "route-line",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": 6,
          "line-opacity": 0.85,
        },
      });
    }

    if (map.getLayer("route-line-layer")) {
      map.setPaintProperty("route-line-layer", "line-color", color);
    }
  };

  const handleRemovePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên tuyến đường");
      return;
    }
    if (points.length < 2) {
      toast.error("Vui lòng chọn ít nhất 2 điểm trên bản đồ để tạo tuyến đường");
      return;
    }

    const routeData: TuyenDuong = {
      id: initialData?.id || `route-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      ngay_sinh: ngaySinh.trim(),
      ngay_mat: ngayMat.trim(),
      que_quan: queQuan.trim(),
      color,
      points,
      images,
    };

    onSave(routeData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreen showCloseButton={false}>
        {/* Fullscreen Header */}
        <DialogHeader className="p-4 sm:px-6 border-b flex flex-row items-center justify-between space-y-0 bg-card shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-bold">
            <Route className="w-6 h-6 text-primary" />
            {initialData ? "Chỉnh Sửa Tuyến Đường Tham Quan" : "Tạo Tuyến Đường Tham Quan Mới"}
          </DialogTitle>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-1" /> Hủy
            </Button>
            <Button type="button" size="sm" onClick={handleSave} className="gap-2 font-semibold">
              <Check className="w-4 h-4" /> Lưu Tuyến Đường
            </Button>
          </div>
        </DialogHeader>

        {/* Fullscreen Body: Split Sidebar & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden relative">
          {/* Left Form Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-6 bg-card border-r flex flex-col justify-between overflow-y-auto space-y-5 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="route-name" className="font-semibold text-sm">
                  Tên Đường / Tuyến Đường *
                </Label>
                <Input
                  id="route-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đường Võ Văn Tần / Tuyến tham quan khu A"
                  className="font-medium"
                />
              </div>

              {/* Rich Details: Ngày sinh / Ngày mất / Quê quán */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="route-dob" className="font-semibold text-xs">
                    Ngày sinh (Nếu có)
                  </Label>
                  <Input
                    id="route-dob"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                    placeholder="1920 hoặc 10/08/1920"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="route-dod" className="font-semibold text-xs">
                    Ngày mất (Nếu có)
                  </Label>
                  <Input
                    id="route-dod"
                    value={ngayMat}
                    onChange={(e) => setNgayMat(e.target.value)}
                    placeholder="1975 hoặc 30/04/1975"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="route-hometown" className="font-semibold text-xs">
                  Quê quán (Nếu có)
                </Label>
                <Input
                  id="route-hometown"
                  value={queQuan}
                  onChange={(e) => setQueQuan(e.target.value)}
                  placeholder="Nhập quê quán nhân vật lịch sử..."
                />
              </div>

              {/* TipTap Rich Text Editor for Route Description */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs">
                  Mô Tả / Tiểu Sử Tuyến Đường (TipTap WYSIWYG Editor)
                </Label>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Nhập nội dung mô tả tuyến đường... Hỗ trợ in đậm, in nghiêng, tiêu đề, danh sách, màu chữ..."
                />
              </div>

              {/* Drag & Drop Square Multiple Images Upload */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="font-semibold text-xs">Hình Ảnh Tuyến Đường (Kéo thả nhiều ô vuông)</Label>
                <DragDropImageUploader
                  images={images}
                  onChange={setImages}
                  folderPath="base/tuyenduong"
                />
              </div>

              {/* Color Preset */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="font-semibold text-xs">Màu Đường Tuyến Trên Bản Đồ</Label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c
                          ? "border-foreground scale-110 ring-2 ring-primary/40 shadow-sm"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Points management list */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                    Điểm nối tuyến đường ({points.length} điểm)
                  </Label>
                  {points.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearPoints}
                      className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Xóa tất cả
                    </Button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <MousePointerClick className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>Click trực tiếp trên bản đồ bên phải để chọn các điểm nối tuyến đường.</span>
                </div>

                <div className="max-h-[25vh] overflow-y-auto space-y-1.5 pr-1 pt-1">
                  {points.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                      Chưa có điểm nào. Click trực tiếp trên bản đồ!
                    </div>
                  ) : (
                    points.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted/60 hover:bg-muted text-xs rounded-xl border transition-colors"
                      >
                        <div className="flex items-center gap-2 font-mono">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                            style={{ backgroundColor: color }}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-semibold">
                            {pt[1].toFixed(5)}, {pt[0].toFixed(5)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePoint(idx)}
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Fullscreen Map Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 relative w-full h-full min-h-[450px] bg-slate-900">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 z-10 bg-slate-950/90 text-white backdrop-blur-md border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-blue-400 animate-pulse" />
              Click chọn điểm trên bản đồ để nối tuyến đường
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TuyenDuongModal;
