// Helper to parse coordinates from any geolocation schema
export function parseCoordinates(geo: any): [number, number] | null {
  if (!geo) return null;
  let parsed = geo;
  if (typeof geo === "string") {
    try {
      parsed = JSON.parse(geo);
    } catch {
      const parts = geo.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        let a = parts[0];
        let b = parts[1];
        if (a < 50 && b > 50) return [b, a];
        return [a, b];
      }
      return null;
    }
  }

  if (Array.isArray(parsed) && parsed.length >= 2) {
    let a = parseFloat(parsed[0]);
    let b = parseFloat(parsed[1]);
    if (!isNaN(a) && !isNaN(b)) {
      if (a < 50 && b > 50) return [b, a];
      return [a, b];
    }
  }

  if (typeof parsed === "object" && parsed !== null) {
    let lon = parseFloat(
      parsed.lon ?? parsed.lng ?? parsed.longitude ?? parsed.x
    );
    let lat = parseFloat(
      parsed.lat ?? parsed.latitude ?? parsed.y
    );
    if (!isNaN(lon) && !isNaN(lat)) {
      if (lon < 50 && lat > 50) {
        return [lat, lon];
      }
      return [lon, lat];
    }
  }

  return null;
}

/**
 * Converts a Supabase storage URL to a resized thumbnail URL.
 * Uses Supabase Image Transformations (render endpoint).
 * Falls back to original URL if not a Supabase storage URL.
 */
function getOptimizedImageUrl(url: string, size: number = 80): string {
  if (!url) return url;

  // Supabase storage URL pattern:
  // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // Transform to:
  // https://<project>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=<size>&height=<size>&resize=cover&quality=60
  if (url.includes("supabase.co/storage/v1/object/public/")) {
    return url.replace(
      "/storage/v1/object/public/",
      "/storage/v1/render/image/public/"
    ) + `?width=${size}&height=${size}&resize=cover&quality=60`;
  }

  return url;
}

// Simple pin icon SVG as a data URI (avoids inline SVG DOM overhead)
const PIN_ICON_SVG = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>')}`;

/**
 * Creates the teardrop map marker HTML element with optimized image loading.
 */
export function createMapMarkerElement({
  title,
  previewImage,
  isSelected = false,
  onClick,
}: {
  title?: string | null;
  previewImage?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
}): HTMLElement {
  const el = document.createElement("div");
  el.className = `marker-container${isSelected ? " selected" : ""}`;

  const hasImage = Boolean(previewImage && previewImage.trim());
  const thumbUrl = hasImage ? getOptimizedImageUrl(previewImage!, 80) : "";

  const imgContent = hasImage
    ? `<img src="${thumbUrl}" alt="" class="map-marker-image" loading="lazy" decoding="async" onError="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div class="map-marker-fallback" style="display:none"><img src="${PIN_ICON_SVG}" width="20" height="20" style="transform:rotate(45deg)" /></div>`
    : `<div class="map-marker-fallback"><img src="${PIN_ICON_SVG}" width="20" height="20" style="transform:rotate(45deg)" /></div>`;

  el.innerHTML = `<div class="map-marker${isSelected ? " selected" : ""}"><div class="map-marker-circle">${imgContent}</div></div><div class="marker-label"><div class="marker-title">${title || "Địa điểm"}</div></div>`;

  if (onClick) {
    el.addEventListener("click", onClick);
  }

  return el;
}
