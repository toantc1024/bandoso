"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import useVRSTore from "@/stores/vr.store";

export default function MapDialogBlock({
  opened,
}: {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  showMedia: (mediaName: string) => void;
}) {
  const onMarkerSelectHandler = (hotspot: any) => {
    if (hotspot.geolocation?.lon && hotspot.geolocation?.lat) {
      setSelectedHotspotId(hotspot.hotspot_id);
      mapRef.current?.flyTo({
        center: [hotspot.geolocation.lon, hotspot.geolocation.lat],
        zoom: 12,
        speed: 1.2,
        curve: 1,
        easing: (t) => t,
      });
    }
  };

  const center: [number, number] = import.meta.env.VITE_CENTER_GPS
    ? import.meta.env.VITE_CENTER_GPS.split(",").map(Number)
    : [106.6467328, 10.7577344];
  const zoom = 12;

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const hotspotMarkersRef = useRef<maplibregl.Marker[]>([]);

  const { hotspots } = useVRSTore((state) => state);

  useEffect(() => {
    if (!opened) {
      setSelectedHotspotId(null);
    }
  }, [opened]);

  const [selectedHotspotId, setSelectedHotspotId] = useState<number | null>(
    null
  );
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center,
      zoom,
      pitch: 65,
      attributionControl: false,
    });

    // Init marker

    mapRef.current.on("load", async () => {
      let response = await fetch("./map.geojson");
      let geojson = await response.json();

      if (geojson.features) {
        geojson.features = geojson.features.map((f: any, idx: number) => ({
          ...f,
          id: f.id ?? idx, // assign ID if missing
        }));
      }
      mapRef.current!.addSource("custom-geojson", {
        type: "geojson",
        data: geojson,
      });

      mapRef.current!.addLayer({
        id: "custom-geojson-fill",
        type: "fill",
        source: "custom-geojson",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "#2b7fff",
            "#000", // normal
          ],
          "fill-opacity": 0.65,
        },
      });

      mapRef.current?.addLayer({
        id: "custom-geojson-labels",
        type: "symbol",
        source: "custom-geojson",
        layout: {
          "text-field": ["get", "ten_xa"],
          "text-size": 15,
          "text-anchor": "center",
          "symbol-placement": "point",
        },
        paint: {
          "text-color": "#fff",
        },
      });
      let hoveredId: string | number | null = null;

      mapRef.current!.on("mousemove", "custom-geojson-fill", (e) => {
        if (e.features?.length) {
          const featureId = e.features[0].id;

          if (featureId !== undefined) {
            if (hoveredId !== null && hoveredId !== featureId) {
              mapRef.current!.setFeatureState(
                { source: "custom-geojson", id: hoveredId },
                { hover: false }
              );
            }

            hoveredId = featureId;
            mapRef.current!.setFeatureState(
              { source: "custom-geojson", id: hoveredId },
              { hover: true }
            );
          }
        }
      });

      mapRef.current!.on("mouseleave", "custom-geojson-fill", () => {
        if (hoveredId !== null) {
          mapRef.current!.setFeatureState(
            { source: "custom-geojson", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = null;
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      hotspotMarkersRef.current.forEach((marker) => marker.remove());
      hotspotMarkersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapRef.current) return;

    // Clear existing hotspot markers
    hotspotMarkersRef.current.forEach((marker) => marker.remove());
    hotspotMarkersRef.current = [];

    // Add new hotspot markers
    hotspots.forEach((hotspot) => {
      if (hotspot.geolocation?.lon && hotspot.geolocation?.lat) {
        const isSelected = selectedHotspotId === hotspot.hotspot_id;

        let element = document.createElement("div");
        element.className = "marker-container";
        element.innerHTML = `
                <div class="map-marker shadow-xl cursor-pointer ${
                  isSelected
                    ? "ring-[3px] border-[0px] ring-blue-400 border-blue-400 border-none ring-opacity-60 selected"
                    : ""
                }">
                    <div class="map-marker-circle ">
                        <div class="map-marker-image">
                            <img src="${hotspot.preview_image}" alt="place" />
                        </div>
                    </div>
                </div>
                <div class="marker-label">
                    <span class="marker-title ${
                      isSelected ? "font-bold text-blue-600" : ""
                    }">${hotspot.title}</span>
                </div>
            `;

        // Add click handler to the marker element
        element.addEventListener("click", () => {
          onMarkerSelectHandler(hotspot);
        });

        let marker = new maplibregl.Marker({
          element: element,
          anchor: "bottom",
        });

        marker
          .setLngLat([hotspot.geolocation.lon, hotspot.geolocation.lat])
          .addTo(mapRef.current!);
        hotspotMarkersRef.current.push(marker);
      }
    });
  }, [hotspots, selectedHotspotId]);

  return (
    <div className="h-full p-1  rounded-3xl overflow-hidden  w-full relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
