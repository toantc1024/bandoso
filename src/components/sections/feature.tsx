import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { TextAnimate } from "../magicui/text-animate";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { ArrowRight, X } from "lucide-react";
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
}: {
  preview_image: string;
  title: string;
  hotspot_id: string;
  description: string;
  area_name?: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-lg h-10 w-10 object-cover"
          alt=""
          src={preview_image}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {title}
          </figcaption>
          {area_name && (
            <span className="text-xs text-muted-foreground">{area_name}</span>
          )}
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{description}</blockquote>
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
      // Extract area name from joined data
      const areaName =
        hotspot.area && Array.isArray(hotspot.area) && hotspot.area.length > 0
          ? hotspot.area[0].area_name
          : undefined;

      return {
        preview_image: hotspot.preview_image || "",
        title: hotspot.title || "",
        hotspot_id: String(hotspot.hotspot_id),
        description: hotspot.description || "",
        area_name: areaName,
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
        <div className="dark max-w-xs mx-auto pb-8">
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
            className="cursor-pointer rounded-full text-white"
          >
            Khám phá <ArrowRight className="!h-5 !w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
