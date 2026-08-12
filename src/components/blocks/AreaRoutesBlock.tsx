import React, { useEffect, useState, useRef, useMemo } from "react";
import { getAreaById, updateArea } from "@/services/areas.service";
import { getHotspotsByAreaId } from "@/services/hotspots.service";
import type { Area } from "@/types/areas.service.type";
import type { Hotspot, TuyenDuong } from "@/types/hotspots.service.type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Route as RouteIcon,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Save,
  Compass,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import TuyenDuongModal from "./TuyenDuongModal";
import { createMapMarkerElement } from "@/utils/geo.utils";

interface AreaRoutesBlockProps {
  areaId: string | undefined;
}

export const AreaRoutesBlock: React.FC<AreaRoutesBlockProps> = ({ areaId }) => {
  const [area, setArea] = useState<Area | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Tuyến đường state
  const [routes, setRoutes] = useState<TuyenDuong[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TuyenDuong | null>(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TuyenDuong | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch Area and Hotspots data
  useEffect(() => {
    if (!areaId) return;
    setIsLoading(true);

    Promise.all([getAreaById(areaId), getHotspotsByAreaId(areaId)])
      .then(([areaData, hotspotsData]) => {
        setArea(areaData);
        setHotspots(hotspotsData || []);
        setRoutes(areaData.metadata?.tuyen_duong || []);
      })
      .catch((err) => {
        console.error("Error loading area details:", err);
        toast.error("Không thể tải thông tin khu vực");
      })
      .finally(() => setIsLoading(false));
  }, [areaId]);

  // Compute map center from hotspots or default
  const defaultCenter: [number, number] = useMemo(() => {
    if (hotspots.length > 0) {
      const validHotspot = hotspots.find(
        (h) => h.geolocation?.lon && h.geolocation?.lat
      );
      if (validHotspot && validHotspot.geolocation) {
        return [validHotspot.geolocation.lon, validHotspot.geolocation.lat];
      }
    }
    return [106.824974, 10.796789];
  }, [hotspots]);

  // Initialize MapLibre after DOM / Tab render delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapRef.current) {
        const mapKey =
          import.meta.env.VITE_GOONG_MAP_KEY ||
          import.meta.env.VITE_GOONG_MAP_TILES_KEY ||
          "hkBRTOlzhKDE79Z6WGwQCgI9MTgsGXyUNC7jS8i3";
        const goongStyleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapKey}`;

        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: goongStyleUrl,
          center: defaultCenter,
          zoom: 14,
          attributionControl: false,
        });
        mapRef.current = map;

        map.on("load", () => {
          map.resize();
          renderMapMarkersAndRoutes(routes, hotspots);
        });
      } else {
        mapRef.current.resize();
        renderMapMarkersAndRoutes(routes, hotspots);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [routes, hotspots, defaultCenter]);

  const renderMapMarkersAndRoutes = (
    routeList: TuyenDuong[],
    hotspotList: Hotspot[]
  ) => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;

    // Add hotspot markers
    hotspotList.forEach((h) => {
      if (!h.geolocation?.lon || !h.geolocation?.lat) return;
      const coords: [number, number] = [h.geolocation.lon, h.geolocation.lat];
      hasCoords = true;
      bounds.extend(coords);

      const el = createMapMarkerElement({
        title: h.title || "Địa điểm",
        previewImage: h.preview_image || null,
        isSelected: false,
        onClick: () => {
          map.flyTo({ center: coords, zoom: 16, speed: 1.2 });
        },
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(coords)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Add routes layers
    routeList.forEach((r) => {
      const sourceId = `area-route-source-${r.id}`;
      const layerId = `area-route-layer-${r.id}`;
      const isSelected = selectedRoute?.id === r.id;

      const geojson: any = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: r.points,
        },
      };

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": r.color || "#2563eb",
            "line-width": isSelected ? 8 : 5,
            "line-opacity": isSelected ? 1 : 0.75,
          },
        });
      }

      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, "line-color", r.color || "#2563eb");
        map.setPaintProperty(layerId, "line-width", isSelected ? 8 : 5);
        map.setPaintProperty(layerId, "line-opacity", isSelected ? 1 : 0.75);
      }

      if (isSelected && r.points.length > 0) {
        r.points.forEach((pt) => bounds.extend(pt));
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }
  };

  const handleSelectRoute = (r: TuyenDuong) => {
    setSelectedRoute(r);
    const map = mapRef.current;
    if (map && r.points.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      r.points.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
    }
  };

  const handleSaveRoute = (newRoute: TuyenDuong) => {
    setRoutes((prev) => {
      const exists = prev.some((r) => r.id === newRoute.id);
      if (exists) {
        return prev.map((r) => (r.id === newRoute.id ? newRoute : r));
      }
      return [...prev, newRoute];
    });
    setSelectedRoute(newRoute);
    toast.success("Đã lưu tuyến đường!");
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
    }
    toast.success("Đã xóa tuyến đường!");
  };

  const handleSaveAreaChanges = async () => {
    if (!areaId) return;
    setIsSaving(true);
    try {
      const updatedData = await updateArea(areaId, {
        metadata: {
          ...(area?.metadata || {}),
          tuyen_duong: routes,
        },
      });
      setArea(updatedData);
      toast.success("Đã lưu danh sách Tuyến Đường cho Khu Vực!");
    } catch (err: any) {
      console.error("Error saving area routes:", err);
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
      {/* ── Header Action Bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Quản Lý Tuyến Đường Khu Vực
          </h2>
          <p className="text-sm text-muted-foreground">
            Cấu hình các tuyến đường tham quan đa điểm cho {area?.area_name}
          </p>
        </div>
        <Button onClick={handleSaveAreaChanges} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu Tuyến Đường Khu Vực
        </Button>
      </div>

      {/* ── Quản Lý Tuyến Đường & Interactive Map ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RouteIcon className="w-5 h-5 text-primary" />
            Bản Đồ Trực Quan Các Tuyến Đường Tham Quan ({routes.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingRoute(null);
              setShowRouteModal(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tạo Tuyến Đường Mới
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left list of routes */}
            <div className="space-y-3">
              <Label className="font-semibold text-xs text-muted-foreground block">
                Danh sách tuyến đường khu vực:
              </Label>

              {routes.length === 0 ? (
                <div className="p-4 text-center border border-dashed rounded-xl text-sm text-muted-foreground">
                  Chưa có tuyến đường nào. Nhấn "Tạo Tuyến Đường Mới" để chọn các điểm trên bản đồ.
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {routes.map((r) => {
                    const isSelected = selectedRoute?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRoute(r)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                            style={{ backgroundColor: r.color || "#2563eb" }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{r.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {r.points.length} điểm • {r.description ? r.description.replace(/<[^>]*>?/gm, '') : "Không mô tả"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRoute(r);
                              setShowRouteModal(true);
                            }}
                            className="h-8 w-8"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoute(r.id);
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Map Canvas Container with Explicit Height */}
            <div className="lg:col-span-2 relative rounded-2xl border overflow-hidden h-[450px] min-h-[450px] bg-slate-900">
              <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
              <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 z-10">
                <Compass className="w-4 h-4 text-primary" />
                Bản đồ trực quan Tuyến Đường
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tuyến Đường Modal */}
      <TuyenDuongModal
        open={showRouteModal}
        onOpenChange={setShowRouteModal}
        onSave={handleSaveRoute}
        initialData={editingRoute}
        defaultCenter={defaultCenter}
      />
    </div>
  );
};

export default AreaRoutesBlock;
