import React, { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, MapPin, Locate, X, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Goong API configuration
const API_URL = "https://rsapi.goong.io";
const MAP_URL = "https://tiles.goong.io/assets/";
const API_KEY = import.meta.env.VITE_GOONG_API_KEY;
const MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY;

// Types
export interface AutocompleteResult {
  place_id: string;
  description: string;
}

export interface PlaceDetail {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  formatted_address: string;
}

export interface DirectionResult {
  routes: {
    overview_polyline: {
      points: string;
    };
    legs: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }[];
  }[];
}

export interface GeocodingResult {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }[];
}

// Map styles configuration
export const MAP_STYLES = [
  { name: "Normal", url: `${MAP_URL}goong_map_web.json?api_key=${MAP_KEY}` },
  {
    name: "Satellite",
    url: `${MAP_URL}goong_satellite.json?api_key=${MAP_KEY}`,
  },
  { name: "Dark", url: `${MAP_URL}goong_map_dark.json?api_key=${MAP_KEY}` },
  { name: "Light", url: `${MAP_URL}navigation_day.json?api_key=${MAP_KEY}` },
  { name: "Night", url: `${MAP_URL}navigation_night.json?api_key=${MAP_KEY}` },
];

// API functions
export const goongApi = {
  // Autocomplete search
  async autocomplete(query: string): Promise<AutocompleteResult[]> {
    try {
      const response = await fetch(
        `${API_URL}/Place/AutoComplete?api_key=${API_KEY}&input=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error("Error fetching autocomplete:", error);
      return [];
    }
  },

  // Get place details
  async getPlaceDetails(placeId: string): Promise<PlaceDetail | null> {
    try {
      const response = await fetch(
        `${API_URL}/Place/Detail?api_key=${API_KEY}&place_id=${placeId}`
      );
      const data = await response.json();
      return data.result || null;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  },

  // Geocoding - convert address to coordinates
  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `${API_URL}/Geocode?address=${encodeURIComponent(
          address
        )}&api_key=${API_KEY}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error geocoding:", error);
      return null;
    }
  },

  // Get directions
  async getDirections(
    origin: string,
    destination: string,
    vehicle: string = "car"
  ): Promise<DirectionResult | null> {
    try {
      const response = await fetch(
        `${API_URL}/Direction?origin=${origin}&destination=${destination}&vehicle=${vehicle}&api_key=${API_KEY}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching directions:", error);
      return null;
    }
  },

  // Reverse geocoding - convert coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `${API_URL}/Geocode?latlng=${lat},${lng}&api_key=${API_KEY}`
      );
      const data = await response.json();
      return data.results?.[0]?.formatted_address || null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  },
};

// Utility functions
export const mapUtils = {
  // Draw circle around a point
  drawCircle(
    center: [number, number],
    radiusInMeters: number
  ): [number, number][] {
    const points = 64;
    const coords = {
      latitude: center[1],
      longitude: center[0],
    };
    const km = radiusInMeters / 1000;
    const ret: [number, number][] = [];
    const distanceX =
      km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);
    return ret;
  },

  // Decode polyline from Google/Goong
  decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lng * 1e-5, lat * 1e-5]);
    }

    return points;
  },

  // Check if input is lat/lng coordinates
  isLatLng(input: string): boolean {
    const latLngRegex =
      /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6},\s?-?((1[0-7][0-9]){1}\.{1}\d{1,6}|[1-9]?[0-9]\.{1}\d{1,6})$/;
    return latLngRegex.test(input.trim());
  },

  // Parse coordinates from string
  parseCoordinates(input: string): [number, number] | null {
    if (this.isLatLng(input)) {
      const [lat, lng] = input
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      return [lng, lat]; // Return as [lng, lat] for MapLibre
    }
    return null;
  },
};

export { API_KEY, MAP_KEY, API_URL, MAP_URL };

// Types
interface SearchResult {
  place_id: string;
  description: string;
}

interface LatLonPickerProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  initialMarker?: [number, number]; // Current marker position to display
  onLocationSelect?: (coordinates: [number, number], address?: string) => void;
  className?: string;
}

const LatLonPicker: React.FC<LatLonPickerProps> = ({
  initialCenter = [106.741961, 10.849256], // Default to Ho Chi Minh City coordinates
  initialZoom = 14,
  onLocationSelect,
  className = "",
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const currentMarkerRef = useRef<maplibregl.Marker | null>(null);
  const isPickingLocationRef = useRef<boolean>(false);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    // Check localStorage to see if user has dismissed tutorial before
    const dismissed = localStorage.getItem("map-tutorial-dismissed");
    return dismissed !== "true";
  });

  // Update ref when state changes
  useEffect(() => {
    isPickingLocationRef.current = isPickingLocation;
  }, [isPickingLocation]);

  // Initialize map with GPS location if available
  useEffect(() => {
    if (!mapContainer.current) return;

    // Try to get user's current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          initializeMap(userLocation);
        },
        (error) => {
          console.log("Could not get user location, using default:", error);
          initializeMap(initialCenter);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      initializeMap(initialCenter);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const initializeMap = useCallback(
    (center: [number, number]) => {
      if (!mapContainer.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: `${MAP_URL}goong_map_web.json?api_key=${MAP_KEY}`,
        center: center,
        zoom: initialZoom,
      });

      mapRef.current = map;

      // Add click handler for location picking (single click only)
      map.on("click", async (e: maplibregl.MapMouseEvent) => {
        console.log(
          "Map clicked, isPickingLocation:",
          isPickingLocationRef.current
        );

        if (isPickingLocationRef.current) {
          // Prevent event bubbling
          e.originalEvent.stopPropagation();
          e.originalEvent.preventDefault();

          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          console.log("Selected coordinates:", coordinates);

          // Add marker immediately
          const marker = addMarker(coordinates);
          console.log("Marker added:", marker);

          // Get address from coordinates
          const address = await goongApi.reverseGeocode(
            coordinates[1],
            coordinates[0]
          );

          if (onLocationSelect) {
            onLocationSelect(coordinates, address || undefined);
          }

          setIsPickingLocation(false);
        }
      });

      // Update cursor when picking location
      const updateCursor = () => {
        if (isPickingLocationRef.current && mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "crosshair";
        } else if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "";
        }
      };

      map.on("mouseenter", updateCursor);
      map.on("mouseleave", () => {
        if (mapRef.current) {
          mapRef.current.getCanvas().style.cursor = "";
        }
      });

      // Update cursor whenever picking state changes
      setInterval(() => {
        updateCursor();
      }, 100);
    },
    [initialZoom, onLocationSelect]
  );

  // Update cursor when picking state changes
  useEffect(() => {
    if (mapRef.current) {
      const canvas = mapRef.current.getCanvas();
      if (isPickingLocation) {
        canvas.style.cursor = "crosshair";
      } else {
        canvas.style.cursor = "";
      }
    }
  }, [isPickingLocation]);

  // Clear current marker
  const clearMarker = () => {
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }
  };

  // Add marker to map
  const addMarker = (coordinates: [number, number]) => {
    if (!mapRef.current) {
      console.error("Map not initialized");
      return;
    }

    // Clear existing marker
    clearMarker();

    // Create popup with nicer styling
    const popup = new maplibregl.Popup({
      offset: 35,
      closeButton: false,
      closeOnClick: false,
      className: "custom-popup",
    }).setHTML(`
        <div style="
          background: linear-gradient(135deg, #FF5722 0%, #FF7043 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(255,87,34,0.3);
          border: 2px solid white;
          min-width: 120px;
        ">
           Bạn đang ở đây
        </div>
      `);

    // Create and add new marker
    const marker = new maplibregl.Marker({ color: "#FF5722" })
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(mapRef.current);

    currentMarkerRef.current = marker;
    console.log("Marker created and added to map");

    // Show the popup immediately
    marker.togglePopup();

    // Fly to the location
    mapRef.current.flyTo({
      center: coordinates,
      zoom: Math.max(mapRef.current.getZoom(), 15),
      duration: 1000,
    });

    return marker;
  };

  // Search autocomplete
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length >= 2) {
      const results = await goongApi.autocomplete(query);
      setSearchResults(results);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = async (result: SearchResult) => {
    const placeDetails = await goongApi.getPlaceDetails(result.place_id);

    if (placeDetails) {
      const coordinates: [number, number] = [
        placeDetails.geometry.location.lng,
        placeDetails.geometry.location.lat,
      ];

      addMarker(coordinates);

      if (onLocationSelect) {
        onLocationSelect(coordinates, placeDetails.formatted_address);
      }
    }

    setSearchQuery(result.description);
    setShowResults(false);
  };

  // Get user's current location and stay at current viewport
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];
          // Only add marker, don't change viewport
          const marker = addMarker(coordinates);
          console.log("Current location marker added:", marker);

          // Get address from coordinates
          const address = await goongApi.reverseGeocode(
            coordinates[1],
            coordinates[0]
          );

          if (onLocationSelect) {
            onLocationSelect(coordinates, address || undefined);
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          toast.error(
            "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt trình duyệt."
          );
        }
      );
    } else {
      toast.error("Trình duyệt không hỗ trợ định vị.");
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Search Box */}
      <div className="absolute top-4 left-4 flex items-center bg-white rounded-md shadow-lg">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm kiếm địa điểm"
          className="w-80 h-10 px-3 border-none outline-none rounded-l-md"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-r-md rounded-l-none"
        >
          <Search size={20} />
        </Button>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto z-10">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSearchResultSelect(result)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                {result.description}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location Controls */}
      <div className="absolute top-16 left-4 flex flex-col gap-2">
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-50"
        >
          <Locate size={18} />
          <span className="text-sm font-medium">Vị trí hiện tại</span>
        </Button>

        <Button
          onClick={() => setIsPickingLocation(!isPickingLocation)}
          variant={isPickingLocation ? "default" : "outline"}
          className={`flex items-center gap-2 ${isPickingLocation
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-white hover:bg-gray-50"
            }`}
        >
          <MapPin size={18} />
          <span className="text-sm font-medium">Chọn vị trí</span>
        </Button>

        {/* Cancel button when in picking mode */}
        {isPickingLocation && (
          <Button
            onClick={() => setIsPickingLocation(false)}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <X size={16} />
            <span className="text-sm">Hủy</span>
          </Button>
        )}

        {/* Help button */}
        <Button
          onClick={() => setShowTutorial(true)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-gray-50"
          title="Hiển thị hướng dẫn"
        >
          <FileQuestion /> Hướng dẫn
        </Button>
      </div>

      {/* Location picking instruction */}
      {isPickingLocation && (
        <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-xs border-l-4 border-blue-300">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-200" />
            <span className="font-medium">Nhấp vào bản đồ để chọn vị trí</span>
          </div>
          <div className="text-blue-100 text-xs mt-1">
            Marker sẽ hiển thị tại vị trí bạn chọn
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">
              Hướng dẫn sử dụng
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-blue-500 flex-shrink-0" />
                <span>Tìm kiếm địa điểm bằng ô tìm kiếm</span>
              </div>
              <div className="flex items-center gap-3">
                <Locate size={18} className="text-green-500 flex-shrink-0" />
                <span>Nhấn "Vị trí hiện tại" để lấy GPS của bạn</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-red-500 flex-shrink-0" />
                <span>Nhấn "Chọn vị trí" rồi click vào bản đồ</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  localStorage.setItem("map-tutorial-dismissed", "true");
                  setShowTutorial(false);
                }}
                variant="outline"
                className="flex-1 text-xs"
              >
                Không hiện lại
              </Button>
              <Button
                onClick={() => setShowTutorial(false)}
                className="flex-1 text-xs"
              >
                Bắt đầu sử dụng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatLonPicker;
