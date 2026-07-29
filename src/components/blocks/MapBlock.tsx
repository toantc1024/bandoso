"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createMapMarkerElement } from "@/utils/geo.utils";
import { HOTSPOT_DATA } from "@/data/hotspot-data";

export default function MapDialogBlock({
  opened: _opened,
}: {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  showMedia: (mediaName: string) => void;
}) {
  const center: [number, number] = import.meta.env.VITE_CENTER_GPS
    ? import.meta.env.VITE_CENTER_GPS.split(",").map(Number)
    : [106.6990, 10.7770];

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const mapKey =
      import.meta.env.VITE_GOONG_MAP_KEY ||
      import.meta.env.VITE_GOONG_MAP_TILES_KEY ||
      "hkBRTOlzhKDE79Z6WGwQCgI9MTgsGXyUNC7jS8i3";
    const goongStyleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapKey}`;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: goongStyleUrl,
      center,
      zoom: 12,
      pitch: 50,
      bearing: -15,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", async () => {
      map.resize();

      // ── 3D Building extrusions ──
      const layers = map.getStyle().layers;
      let labelLayerId: string | undefined;
      if (layers) {
        for (const layer of layers) {
          if (layer.type === "symbol" && (layer.layout as any)?.["text-field"]) {
            labelLayerId = layer.id;
            break;
          }
        }
      }
      const sources = map.getStyle().sources;
      const mainSourceId = Object.keys(sources).find(
        (s) => (sources[s] as any).type === "vector"
      );
      if (mainSourceId) {
        try {
          map.addLayer(
            {
              id: "3d-buildings",
              source: mainSourceId,
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 12,
              paint: {
                "fill-extrusion-color": "#aab7cf",
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "min_height"],
                "fill-extrusion-opacity": 0.5,
              },
            },
            labelLayerId
          );
        } catch {
          // Building layer may not exist in this tileset
        }
      }

      // ── ADD ALL HARDCODED MARKERS ──
      HOTSPOT_DATA.forEach((h) => {
        const el = createMapMarkerElement({
          title: h.title,
          previewImage: h.img || null,
          isSelected: false,
          onClick: () => {
            map.flyTo({ center: [h.lon, h.lat], zoom: 15, speed: 1.2 });
          },
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([h.lon, h.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });

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
        map.addSource("custom-geojson", { type: "geojson", data: geojson });
        map.addLayer({
          id: "custom-geojson-fill",
          type: "fill",
          source: "custom-geojson",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.35, 0],
          },
        });
        map.addLayer({
          id: "custom-geojson-line",
          type: "line",
          source: "custom-geojson",
          paint: { "line-color": "#2563eb", "line-width": 2, "line-opacity": 0.8 },
        });
        map.addLayer({
          id: "custom-geojson-labels",
          type: "symbol",
          source: "custom-geojson",
          layout: { "text-field": ["get", "ten_xa"], "text-size": 13, "text-anchor": "center", "symbol-placement": "point" },
          paint: { "text-color": "#1e3a8a", "text-halo-color": "#ffffff", "text-halo-width": 2 },
        });

        let hoveredId: string | number | null = null;
        map.on("mousemove", "custom-geojson-fill", (e) => {
          if (e.features?.length) {
            const fid = e.features[0].id;
            if (fid !== undefined) {
              if (hoveredId !== null && hoveredId !== fid) {
                map.setFeatureState({ source: "custom-geojson", id: hoveredId }, { hover: false });
              }
              hoveredId = fid;
              map.setFeatureState({ source: "custom-geojson", id: hoveredId }, { hover: true });
            }
          }
        });
        map.on("mouseleave", "custom-geojson-fill", () => {
          if (hoveredId !== null) {
            map.setFeatureState({ source: "custom-geojson", id: hoveredId }, { hover: false });
          }
          hoveredId = null;
        });
      } catch (err) {
        console.error("Failed to load map.geojson overlay:", err);
      }
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="h-full p-1 rounded-3xl overflow-hidden w-full relative min-h-[450px]">
      <div ref={mapContainer} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
