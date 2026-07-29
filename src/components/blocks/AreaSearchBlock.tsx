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
  Compass,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import useAreaSearchStore from "@/stores/area-search.store";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { createMapMarkerElement } from "@/utils/geo.utils";
import { HOTSPOT_DATA, type HotspotEntry } from "@/data/hotspot-data";

export default function AreaSearchBlock() {
  const [search, setSearch] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    description?: string;
    domain?: string;
    preview_image?: string;
    coords?: [number, number];
    area_name?: string;
  } | null>(null);

  const { isAreaSearchDialogOpen, setAreaSearchDialogOpen } =
    useAreaSearchStore();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const defaultCenter: [number, number] = import.meta.env.VITE_CENTER_GPS
    ? import.meta.env.VITE_CENTER_GPS.split(",").map(Number)
    : [106.771911, 10.850567];

  // Combined list of searchable items from hardcoded data
  const combinedItems = useMemo(() => {
    const items = HOTSPOT_DATA.map((h: HotspotEntry) => ({
      id: `hotspot-${h.id}`,
      title: h.title,
      description: h.desc,
      preview_image: h.img || undefined,
      coords: [h.lon, h.lat] as [number, number],
      domain: h.domain || undefined,
      type: "hotspot" as const,
      area_name: h.area || "HCMUTE",
    }));

    let result = items;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.domain?.toLowerCase().includes(q) ||
          item.area_name?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      // Priority: items with domain link first
      const aHas = Boolean(a.domain && a.domain.trim());
      const bHas = Boolean(b.domain && b.domain.trim());
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      // Then items with preview images
      const aImg = Boolean(a.preview_image);
      const bImg = Boolean(b.preview_image);
      if (aImg && !bImg) return -1;
      if (!aImg && bImg) return 1;
      return 0;
    });
  }, [search]);

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

      map.on("error", (e) => {
        console.warn("Goong tiles notice:", e);
      });

      map.on("load", async () => {
        map.resize();

        // ── Add hardcoded markers ──
        const bounds = new maplibregl.LngLatBounds();

        HOTSPOT_DATA.forEach((h) => {
          bounds.extend([h.lon, h.lat]);

          const el = createMapMarkerElement({
            title: h.title,
            previewImage: h.img || null,
            isSelected: false,
            onClick: () => {
              setSelectedItem({
                id: `hotspot-${h.id}`,
                title: h.title,
                description: h.desc,
                preview_image: h.img || undefined,
                coords: [h.lon, h.lat],
                domain: h.domain || undefined,
                area_name: h.area,
              });

              map.flyTo({
                center: [h.lon, h.lat],
                zoom: 15,
                speed: 1.2,
              });
            },
          });

          const marker = new maplibregl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat([h.lon, h.lat])
            .addTo(map);

          markersRef.current.push(marker);
        });

        // Fit bounds to all markers
        if (HOTSPOT_DATA.length > 0) {
          map.fitBounds(bounds, { padding: 80, maxZoom: 14 });
        }

        // ── GeoJSON overlay ──
        try {
          const response = await fetch("./map.geojson");
          const geojson = await response.json();
          if (geojson.features) {
            geojson.features = geojson.features.map((f: any, idx: number) => ({
              ...f,
              id: f.id ?? idx,
            }));
          }

          map.addSource("custom-geojson", {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: "custom-geojson-fill",
            type: "fill",
            source: "custom-geojson",
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.35,
                0,
              ],
            },
          });

          map.addLayer({
            id: "custom-geojson-line",
            type: "line",
            source: "custom-geojson",
            paint: {
              "line-color": "#2563eb",
              "line-width": 2,
              "line-opacity": 0.8,
            },
          });

          map.addLayer({
            id: "custom-geojson-labels",
            type: "symbol",
            source: "custom-geojson",
            layout: {
              "text-field": ["get", "ten_xa"],
              "text-size": 13,
              "text-anchor": "center",
              "symbol-placement": "point",
            },
            paint: {
              "text-color": "#1e3a8a",
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
            },
          });

          let hoveredId: string | number | null = null;
          map.on("mousemove", "custom-geojson-fill", (e) => {
            if (e.features?.length) {
              const fid = e.features[0].id;
              if (fid !== undefined) {
                if (hoveredId !== null && hoveredId !== fid) {
                  map.setFeatureState(
                    { source: "custom-geojson", id: hoveredId },
                    { hover: false }
                  );
                }
                hoveredId = fid;
                map.setFeatureState(
                  { source: "custom-geojson", id: hoveredId },
                  { hover: true }
                );
              }
            }
          });

          map.on("mouseleave", "custom-geojson-fill", () => {
            if (hoveredId !== null) {
              map.setFeatureState(
                { source: "custom-geojson", id: hoveredId },
                { hover: false }
              );
            }
            hoveredId = null;
          });
        } catch (err) {
          console.error("Failed to load map.geojson overlay:", err);
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
  }, [isAreaSearchDialogOpen]);

  const handleSelectItem = (item: (typeof combinedItems)[number]) => {
    setSelectedItem(item);
    if (item.coords && mapRef.current) {
      mapRef.current.flyTo({
        center: item.coords,
        zoom: 15,
        speed: 1.2,
      });
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

          {/* Floating Search Panel (Left Side Overlay) */}
          <div className="absolute top-4 left-4 z-20 w-80 sm:w-96 max-h-[calc(100vh-2rem)] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
            {/* Search Input Header */}
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

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[60vh] hotspot-dialog-scroll">
              {combinedItems.length > 0 ? (
                combinedItems.map((item) => {
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
                          {item.coords && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                              <Compass className="w-3 h-3" />
                              GPS
                            </span>
                          )}
                          {item.domain && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                              Có link
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 font-medium truncate mt-0.5">
                          {item.area_name || item.description || "Địa điểm"}
                        </p>
                        {item.coords && (
                          <p className="text-[11px] font-mono text-blue-600/90 mt-0.5">
                            📍 {item.coords[1].toFixed(5)}, {item.coords[0].toFixed(5)}
                          </p>
                        )}
                      </div>

                      {item.domain ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLink(item.domain);
                          }}
                          className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shrink-0 transition-colors"
                          title="Truy cập website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
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

          {/* Selected Item Floating Info Card (Bottom Overlay) */}
          {selectedItem && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 w-[92vw] max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-blue-300 animate-in fade-in slide-in-from-bottom-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 text-blue-400 hover:text-blue-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-row items-start gap-4">
                {selectedItem.preview_image ? (
                  <img
                    src={selectedItem.preview_image}
                    alt={selectedItem.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-blue-200 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                    <MapPin className="w-8 h-8" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-6">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {selectedItem.area_name || "Địa điểm"}
                  </span>
                  <h3 className="text-lg font-bold text-blue-950 truncate mt-0.5">
                    {selectedItem.title}
                  </h3>
                  {selectedItem.coords && (
                    <p className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
                      📍 Tọa độ GPS: {selectedItem.coords[1].toFixed(6)}, {selectedItem.coords[0].toFixed(6)}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-blue-800/90 font-medium line-clamp-2 mt-1 leading-relaxed">
                    {selectedItem.description || "Không có mô tả chi tiết."}
                  </p>

                  {selectedItem.domain && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenLink(selectedItem.domain)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl px-4 py-2 shadow-md gap-1.5"
                      >
                        Khám phá Website / App <ExternalLink className="w-4 h-4" />
                      </Button>
                      <span className="text-xs font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg truncate">
                        {selectedItem.domain}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogWrapper>
    </>
  );
}
