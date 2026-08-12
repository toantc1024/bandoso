"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import DialogWrapper from "./DialogWrapper";
import {
  Search,
  SearchIcon,
  MapPin,
  ExternalLink,
  X,
  ChevronRight,
  Route as RouteIcon,
  Volume2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import useAreaSearchStore from "@/stores/area-search.store";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { createMapMarkerElement } from "@/utils/geo.utils";
import { HOTSPOT_DATA, type HotspotEntry } from "@/data/hotspot-data";
import { getHotspots } from "@/services/hotspots.service";
import type { Hotspot, TuyenDuong } from "@/types/hotspots.service.type";
import AudioPlayer from "../ui/AudioPlayer";

export default function AreaSearchBlock() {
  const [search, setSearch] = useState<string>("");
  const [dbHotspots, setDbHotspots] = useState<Hotspot[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    description?: string;
    domain?: string;
    preview_image?: string;
    coords?: [number, number];
    area_name?: string;
    audio_url?: string;
    tuyen_duong?: TuyenDuong[];
  } | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<{
    route: TuyenDuong;
    hotspotTitle: string;
  } | null>(null);

  const { isAreaSearchDialogOpen, setAreaSearchDialogOpen } =
    useAreaSearchStore();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const defaultCenter: [number, number] = import.meta.env.VITE_CENTER_GPS
    ? import.meta.env.VITE_CENTER_GPS.split(",").map(Number)
    : [106.824974, 10.796789];

  // Fetch hotspots from DB when modal opens
  useEffect(() => {
    if (!isAreaSearchDialogOpen) return;
    getHotspots({ pagination: { page: 1, limit: 100 } })
      .then((res) => {
        if (res && res.data && res.data.length > 0) {
          setDbHotspots(res.data);
        }
      })
      .catch((err) => console.error("Error fetching hotspots for map:", err));
  }, [isAreaSearchDialogOpen]);

  // Combined list of searchable items (DB items + fallback static items)
  const allHotspots = useMemo(() => {
    if (dbHotspots.length > 0) {
      return dbHotspots.map((h) => ({
        id: `db-hotspot-${h.hotspot_id}`,
        title: h.title || `Địa điểm #${h.hotspot_id}`,
        description: h.description || "",
        preview_image: h.preview_image || undefined,
        coords:
          h.geolocation?.lat && h.geolocation?.lon
            ? ([h.geolocation.lon, h.geolocation.lat] as [number, number])
            : undefined,
        domain: h.website || undefined,
        audio_url: h.metadata?.audio_url || undefined,
        tuyen_duong: h.metadata?.tuyen_duong || [],
        area_name: h.address || "Hệ thống BandoSo",
      }));
    }

    return HOTSPOT_DATA.map((h: HotspotEntry) => ({
      id: `hotspot-${h.id}`,
      title: h.title,
      description: h.desc,
      preview_image: h.img || undefined,
      coords: [h.lon, h.lat] as [number, number],
      domain: h.domain || undefined,
      audio_url: undefined,
      tuyen_duong: [],
      area_name: h.area || "HCMUTE",
    }));
  }, [dbHotspots]);

  // Extract all available Tuyến Đường from all hotspots
  const allTuyenDuong = useMemo(() => {
    const list: { route: TuyenDuong; hotspotTitle: string; hotspotItem: any }[] = [];
    allHotspots.forEach((item) => {
      if (item.tuyen_duong && item.tuyen_duong.length > 0) {
        item.tuyen_duong.forEach((td: TuyenDuong) => {
          list.push({
            route: td,
            hotspotTitle: item.title,
            hotspotItem: item,
          });
        });
      }
    });
    return list;
  }, [allHotspots]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    let result = allHotspots;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = allHotspots.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.area_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, allHotspots]);

  // Initialize MapLibre in Fullscreen Dialog
  useEffect(() => {
    if (!isAreaSearchDialogOpen) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
      }
      return;
    }

    const timerId = setTimeout(() => {
      if (!mapContainer.current || mapRef.current) return;

      const mapKey =
        import.meta.env.VITE_GOONG_MAP_KEY ||
        import.meta.env.VITE_GOONG_MAP_TILES_KEY ||
        "hkBRTOlzhKDE79Z6WGwQCgI9MTgsGXyUNC7jS8i3";
      const goongStyleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapKey}`;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: goongStyleUrl,
        center: defaultCenter,
        zoom: 12,
        pitch: 45,
        attributionControl: false,
      });
      mapRef.current = map;

      map.on("load", () => {
        map.resize();

        // ── Render markers ──
        const bounds = new maplibregl.LngLatBounds();
        let hasCoords = false;

        allHotspots.forEach((h) => {
          if (!h.coords) return;
          hasCoords = true;
          bounds.extend(h.coords);

          const el = createMapMarkerElement({
            title: h.title,
            previewImage: h.preview_image || null,
            isSelected: false,
            onClick: () => {
              setSelectedItem(h);
              map.flyTo({
                center: h.coords,
                zoom: 15,
                speed: 1.2,
              });
            },
          });

          const marker = new maplibregl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat(h.coords)
            .addTo(map);

          markersRef.current.push(marker);
        });

        if (hasCoords) {
          map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
        }
      });
    }, 150);

    return () => {
      clearTimeout(timerId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [isAreaSearchDialogOpen, allHotspots]);

  const handleSelectItem = (item: (typeof allHotspots)[number]) => {
    setSelectedItem(item);
    if (item.coords && mapRef.current) {
      mapRef.current.flyTo({
        center: item.coords,
        zoom: 15,
        speed: 1.2,
      });
    }
  };

  const handleSelectRoute = (tdItem: typeof allTuyenDuong[number]) => {
    setSelectedRoute({
      route: tdItem.route,
      hotspotTitle: tdItem.hotspotTitle,
    });
    setSelectedItem(tdItem.hotspotItem);

    const map = mapRef.current;
    if (!map) return;

    // Draw active route line string on map
    const geojson: any = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: tdItem.route.points,
      },
    };

    if (map.getSource("active-tuyen-duong-source")) {
      (map.getSource("active-tuyen-duong-source") as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource("active-tuyen-duong-source", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "active-tuyen-duong-layer",
        type: "line",
        source: "active-tuyen-duong-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": tdItem.route.color || "#2563eb",
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });
    }

    if (map.getLayer("active-tuyen-duong-layer")) {
      map.setPaintProperty("active-tuyen-duong-layer", "line-color", tdItem.route.color || "#2563eb");
    }

    if (tdItem.route.points.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      tdItem.route.points.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
    }
  };

  const handleOpenLink = (domain?: string) => {
    if (domain) {
      const url = domain.startsWith("http") ? domain : `https://${domain}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <DialogWrapper
        opened={isAreaSearchDialogOpen}
        setOpened={setAreaSearchDialogOpen}
        trigger={
          <Button
            onClick={() => setAreaSearchDialogOpen(true)}
            size="lg"
            className="px-4 cursor-pointer rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-900 font-semibold text-sm sm:text-base shadow-xs"
          >
            <div className="hidden sm:flex items-center gap-2">
              Tìm kiếm địa điểm <Search className="!h-4 !w-4 sm:!h-5 sm:!w-5 text-blue-600" />
            </div>
            <div className="sm:hidden flex items-center gap-1.5">
              Tìm kiếm <Search className="!h-4 !w-4 text-blue-600" />
            </div>
          </Button>
        }
        showHeader={false}
        showCloseButton={false}
        size="entire"
        mobileSize="entire"
      >
        {isAreaSearchDialogOpen && (
          <div className="relative w-full h-screen overflow-hidden bg-slate-900">
            {/* Fullscreen Map Container */}
            <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />

          {/* Close Modal Floating Button */}
          <button
            onClick={() => setAreaSearchDialogOpen(false)}
            className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl text-blue-950 hover:bg-blue-50 border border-blue-200 flex items-center justify-center transition-all hover:scale-105"
            title="Đóng bản đồ"
          >
            <X className="w-6 h-6" />
          </button>

          {/* ── Left Floating Search Panel ── */}
          <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b border-blue-100">
              <div className="flex h-11 items-center gap-2 bg-blue-50/80 border border-blue-300 text-blue-950 rounded-full px-3.5 focus-within:ring-2 focus-within:ring-blue-500">
                <SearchIcon className="size-5 text-blue-600 shrink-0" />
                <Input
                  className="placeholder:text-blue-400 flex h-10 w-full rounded-md bg-transparent text-sm sm:text-base outline-none focus-visible:ring-0 border-none font-medium text-blue-950"
                  placeholder="Tìm kiếm địa điểm, GPS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh] hotspot-dialog-scroll">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/90 shadow-xs"
                          : "border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-sm text-blue-950 truncate">
                            {item.title}
                          </p>
                          {item.audio_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                              <Volume2 className="w-3 h-3 text-amber-600" />
                              Audio
                            </span>
                          )}
                          {item.tuyen_duong && item.tuyen_duong.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                              <RouteIcon className="w-3 h-3 text-purple-600" />
                              {item.tuyen_duong.length} tuyến
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 font-medium truncate mt-0.5">
                          {item.area_name || item.description || "Địa điểm"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-blue-800">
                  <p className="text-sm font-medium">Không tìm thấy địa điểm</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Floating Tuyến Đường Panel ── */}
          {allTuyenDuong.length > 0 && (
            <div className="absolute top-16 right-4 z-20 w-72 sm:w-80 max-h-[calc(80vh-4rem)] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-200 overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="p-3.5 border-b border-purple-100 bg-purple-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-950">
                  <RouteIcon className="w-4 h-4 text-purple-600" />
                  <span>Tuyến Đường Tham Quan ({allTuyenDuong.length})</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 hotspot-dialog-scroll">
                {allTuyenDuong.map((tdItem) => {
                  const isSelected = selectedRoute?.route.id === tdItem.route.id;
                  return (
                    <div
                      key={tdItem.route.id}
                      onClick={() => handleSelectRoute(tdItem)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "border-purple-500 bg-purple-50/90 shadow-xs"
                          : "border-purple-100 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-3.5 h-3.5 rounded-full border shadow-xs shrink-0"
                          style={{ backgroundColor: tdItem.route.color || "#2563eb" }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-purple-950 truncate">
                            {tdItem.route.name}
                          </p>
                          <p className="text-[11px] text-purple-700 truncate">
                            {tdItem.hotspotTitle} • {tdItem.route.points.length} điểm
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Selected Item Side Card (with Auto-Play Audio Player & Scrollable Full Content) ── */}
          {selectedItem && (
            <div className="absolute top-16 left-4 sm:left-[25.5rem] z-30 w-[90vw] sm:w-[380px] max-h-[calc(100vh-6rem)] flex flex-col bg-slate-950/95 backdrop-blur-2xl text-slate-100 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in fade-in slide-in-from-left-4 space-y-3 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedRoute(null);
                }}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800/80 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-3">
                {selectedItem.preview_image ? (
                  <img
                    src={selectedItem.preview_image}
                    alt={selectedItem.title}
                    className="w-full h-36 rounded-2xl object-cover border border-slate-800 shadow-md"
                  />
                ) : (
                  <div className="w-full h-24 rounded-2xl bg-slate-900 text-blue-400 border border-slate-800 flex items-center justify-center">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                    {selectedItem.area_name || "Địa điểm"}
                  </span>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.coords && (
                    <p className="text-xs font-mono text-emerald-400 font-semibold pt-0.5">
                      📍 GPS: {selectedItem.coords[1].toFixed(6)}, {selectedItem.coords[0].toFixed(6)}
                    </p>
                  )}
                  <div
                    className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60"
                    dangerouslySetInnerHTML={{ __html: selectedItem.description || "Không có mô tả chi tiết." }}
                  />

                  {selectedItem.domain && (
                    <div className="pt-2">
                      <Button
                        onClick={() => handleOpenLink(selectedItem.domain)}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl py-2 shadow-md gap-1.5"
                      >
                        Khám phá Website / App <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Auto-Play Audio Player ── */}
              {selectedItem.audio_url && (
                <div className="pt-2 border-t border-slate-800/80">
                  <AudioPlayer
                    src={selectedItem.audio_url}
                    title={`Thuyết minh: ${selectedItem.title}`}
                    autoPlay={true}
                  />
                </div>
              )}
            </div>
          )}

          </div>
        )}
      </DialogWrapper>
    </>
  );
}
