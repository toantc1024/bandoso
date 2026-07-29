import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { TextAnimate } from "../magicui/text-animate";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight, ExternalLink, LinkIcon, MapPin, X } from "lucide-react";
import useVRStore from "@/stores/vr.store";
import useAreaSearchStore from "@/stores/area-search.store";
import { MultipleSelector, type Option } from "@/components/ui/multi-select";
import { getPreviewHotspots } from "@/services/hotspots.service";
import type { Hotspot } from "@/types/hotspots.service.type";
import type { WithJoins } from "@/types/pagination.type";

const HotspotCard = ({
  preview_image,
  title,
  description,
  area_name,
  url,
}: {
  preview_image: string;
  title: string;
  hotspot_id: string;
  description: string;
  area_name?: string;
  url?: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const hasUrl = !!url;

  const handleClick = () => {
    if (hasUrl) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <figure
      onClick={handleClick}
      className={cn(
        "relative h-48 w-80 sm:w-96 overflow-hidden rounded-xl border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        hasUrl
          ? "cursor-pointer border-blue-200/90 bg-white/90 text-blue-950 shadow-xs hover:border-blue-400 hover:bg-blue-50/70"
          : "cursor-default border-gray-200/90 bg-white/90 text-blue-950 shadow-xs"
      )}
    >
      {/* URL indicator badge */}
      <div className="absolute top-2 right-2">
        {hasUrl ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold border border-blue-200">
            <ExternalLink className="w-3 h-3" />
            VR 360
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-semibold border border-gray-200">
            <LinkIcon className="w-3 h-3" />
            Chưa có URL
          </span>
        )}
      </div>
      <div className="flex flex-row items-center gap-3">
        {!preview_image || imgError ? (
          <div className="rounded-lg h-12 w-12 bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
            <MapPin className="w-6 h-6" />
          </div>
        ) : (
          <img
            className="rounded-lg h-12 w-12 object-cover shrink-0 border border-blue-200"
            alt={title}
            src={preview_image}
            onError={() => setImgError(true)}
          />
        )}
        <div className="flex flex-col min-w-0 pr-16">
          <figcaption className="text-base font-bold truncate text-blue-950">
            {title}
          </figcaption>
          {area_name && (
            <span className="text-xs text-blue-600 truncate font-semibold">
              {area_name}
            </span>
          )}
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-blue-800/90 font-medium line-clamp-3 leading-relaxed">
        {description}
      </blockquote>
    </figure>
  );
};

export function FeatureSection() {
  const { hotspots: defaultHotspots, areas } = useVRStore((state) => state);
  const { setAreaSearchDialogOpen } = useAreaSearchStore();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [hotspots, setHotspots] = useState(defaultHotspots);
  useEffect(() => {
    setHotspots(defaultHotspots);
  }, [defaultHotspots]);
  useEffect(() => {
    (async () => {
      if (selectedAreas.length === 0) {
        setHotspots(defaultHotspots);
        return;
      }
      let newHotspots:
        | any[]
        | ((prevState: WithJoins<Hotspot>[]) => WithJoins<Hotspot>[]) = [];
      for (const areaId of selectedAreas) {
        let area_hotspots = await getPreviewHotspots(areaId);
        newHotspots = [...newHotspots, ...area_hotspots];
      }
      setHotspots(newHotspots);
    })();
  }, [selectedAreas]);

  const { firstRow, secondRow } = useMemo(() => {
    const group_hotspots = hotspots.map((hotspot) => {
      // Extract area name and domain from joined data
      const areaName =
        hotspot.area && Array.isArray(hotspot.area) && hotspot.area.length > 0
          ? hotspot.area[0].area_name
          : undefined;

      const areaDomain =
        hotspot.area && Array.isArray(hotspot.area) && hotspot.area.length > 0
          ? hotspot.area[0].domain
          : undefined;

      // Construct the /app URL from the area's domain
      const url = areaDomain
        ? `${areaDomain.replace(/\/$/, "")}/app`
        : undefined;

      return {
        preview_image: hotspot.preview_image || "",
        title: hotspot.title || "",
        hotspot_id: String(hotspot.hotspot_id),
        description: hotspot.description || "",
        area_name: areaName,
        url,
      };
    });

    return {
      firstRow: group_hotspots.slice(0, Math.ceil(group_hotspots.length / 2)),
      secondRow: group_hotspots.slice(Math.ceil(group_hotspots.length / 2)),
    };
  }, [hotspots]);

  const areaOptions: Option[] = useMemo(() => {
    return areas.map((area) => ({
      label: area.area_name,
      value: area.area_id,
    }));
  }, [areas]);

  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-8 lg:px-32  flex w-full justify-center">
      <div className="container">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Khám phá ngay các địa điểm
          </TextAnimate>
        </h2>{" "}
        <div className="max-w-xs mx-auto pb-8">
          <div className="space-y-2">
            <MultipleSelector
              options={areaOptions}
              value={selectedAreas}
              onChange={setSelectedAreas}
              className="rounded-full"
              placeholder="Chọn khu vực..."
              searchPlaceholder="Tìm kiếm khu vực..."
              emptyText="Không tìm thấy khu vực nào."
              maxWidth="w-full max-w-2xl"
            />
            {selectedAreas.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {selectedAreas.length === 1
                    ? `Đã chọn ${selectedAreas.length} khu vực`
                    : `Đã chọn ${selectedAreas.length} khu vực`}
                  {hotspots.length > 0 && (
                    <span className="ml-1">• {hotspots.length} địa điểm</span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAreas([])}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          {hotspots.length > 0 ? (
            <>
              <Marquee pauseOnHover className="[--duration:20s]">
                {firstRow.map((hotspot) => (
                  <HotspotCard key={hotspot.hotspot_id} {...hotspot} />
                ))}
              </Marquee>
              <Marquee reverse pauseOnHover className="[--duration:20s]">
                {secondRow.map((hotspot) => (
                  <HotspotCard key={hotspot.hotspot_id} {...hotspot} />
                ))}
              </Marquee>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
            </>
          ) : selectedAreas.length > 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Không tìm thấy địa điểm nào trong khu vực đã chọn.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAreas([])}
                className="mt-2"
              >
                Xóa bộ lọc
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex justify-center pt-12 pb-24">
          <Button
            onClick={() => {
              setAreaSearchDialogOpen(true);
            }}
            size="lg"
            className="cursor-pointer rounded-full bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            Khám phá <ArrowRight className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
