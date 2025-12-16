import React, { useMemo, useRef, useState, useEffect } from "react";
import DialogWrapper from "./DialogWrapper";
import { Search, SearchIcon, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { getAreas } from "@/services/areas.service";
import type { Area } from "@/types/areas.service.type";
import GradientCardBlock from "./GradientCardBlock";
import useAreaSearchStore from "@/stores/area-search.store";

// AreaResultCard component
const AreaResultCard: React.FC<{
  area: Area;
  onSelect: (area: Area) => void;
}> = ({ area, onSelect }) => {
  return (
    <GradientCardBlock className="!p-4 dark col-span-2 cursor-pointer hover:scale-[1.02] transition-transform duration-300">
      <div
        onClick={() => {
          onSelect(area);
        }}
      >
        <p className="mt-6 font-semibold text-xl font-bold text-white">
          {area.area_name}
        </p>
        <p className="mt-2 text-[17px] text-white">
          {area.description || "Không có mô tả"}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono bg-black/20 px-2 py-1 rounded">
            {area.domain}
          </span>
        </div>
      </div>
    </GradientCardBlock>
    // <Card
    //   className="p-0 max-w-sm w-full glass shadow-none border-none cursor-pointer group"
    //   onClick={() => onSelect(area)}
    // >
    //   <MagicCard
    //     gradientColor="#262626"
    //     className="p-0 transition-all duration-300 group-hover:scale-[1.02]"
    //   >
    //     <CardHeader className="border-b border-border p-4 [.border-b]:pb-4">
    //       <div className="flex items-start justify-between">
    //         <div className="flex-1 min-w-0">
    //           <CardTitle className="text-white truncate text-base">
    //             {area.area_name || "Không có tên"}
    //           </CardTitle>
    //           <CardDescription className="text-white/60 mt-1">
    //             {area.description || "Không có mô tả"}
    //           </CardDescription>
    //         </div>

    //         {/* Arrow Button */}
    //         <div className="hover:animate-pulse pl-2 flex items-center justify-center">
    //           <div className="w-10 h-10 rounded-full flex text-white/70 group-hover:text-blue-400 group-hover:scale-[1.2] transition-all ease-in-out duration-300 items-center justify-center glass group-hover:bg-blue-500/30">
    //             <ArrowRight className="w-5 h-5" />
    //           </div>
    //         </div>
    //       </div>
    //     </CardHeader>
    //     <CardContent className="p-4">
    //       <div className="flex items-center gap-2 text-sm text-white/70">
    //         <Globe className="w-4 h-4 flex-shrink-0" />
    //         <span className="truncate font-mono bg-black/20 px-2 py-1 rounded">
    //           {area.domain}
    //         </span>
    //       </div>
    //       {area.is_active !== undefined && (
    //         <div className="mt-2">
    //           <span
    //             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    //               area.is_active
    //                 ? "bg-green-500/20 text-green-400 border border-green-500/30"
    //                 : "bg-red-500/20 text-red-400 border border-red-500/30"
    //             }`}
    //           >
    //             {area.is_active ? "Hoạt động" : "Không hoạt động"}
    //           </span>
    //         </div>
    //       )}
    //     </CardContent>
    //   </MagicCard>
    // </Card>
  );
};

const AreaSearchBlock = () => {
  const [search, setSearch] = useState<string>("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isAreaSearchDialogOpen, setAreaSearchDialogOpen } =
    useAreaSearchStore();

  // Load areas on component mount
  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      try {
        const result = await getAreas({});
        setAreas(result.data || []);
      } catch (error) {
        console.error("Failed to load areas:", error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, []);

  const filteredAreas = useMemo(() => {
    if (!search.trim()) return areas;

    const searchLower = search.toLowerCase().trim();
    return areas.filter(
      (area) =>
        area.area_name?.toLowerCase().includes(searchLower) ||
        area.description?.toLowerCase().includes(searchLower) ||
        area.domain?.toLowerCase().includes(searchLower)
    );
  }, [areas, search]);

  const handleSelectArea = (area: Area) => {
    if (area.domain) {
      // Navigate to the area domain directly
      window.open(`https://${area.domain}`, "_blank");
      setAreaSearchDialogOpen(false); // Close the search dialog using store
    }
  };

  return (
    <>
      <DialogWrapper
        opened={isAreaSearchDialogOpen}
        setOpened={setAreaSearchDialogOpen}
        customClose={true}
        customHeader={
          <div>
            <div className="flex h-9 items-center gap-0 glass glass-hover border border-white/20 text-white rounded-full px-3 backdrop-blur-md shadow-lg">
              <SearchIcon className="size-4 text-white/70 shrink-0" />
              <Input
                className="placeholder:text-white/50 flex h-10 w-full rounded-md bg-transparent py-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-transparent border-none !text-lg text-white"
                placeholder="Tìm kiếm khu vực"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        }
        trigger={
          <Button
            ref={buttonRef}
            onClick={() => setAreaSearchDialogOpen(true)}
            size="lg"
            className="px-2 cursor-pointer rounded-full glass  glass-hover border-white/90 !text-white text-base shadow-none"
          >
            <div className="hidden sm:flex items-center gap-2">
              Tìm kiếm địa điểm <Search className="!h-5 !w-5" />
            </div>
            <div className="sm:hidden flex items-center gap-2">
              Tìm kiếm <Search className=" !h-5 !w-5" />
            </div>
          </Button>
        }
        showHeader={true}
        headerIcon={<Search className="w-5 h-5 text-primary" />}
        title="Tìm kiếm khu vực"
        description="Tìm kiếm và điều hướng đến các khu vực"
        showCloseButton={true}
        showFooter={false}
        size="lg"
        mobileSize="lg"
        useCustomScrollbar={true}
      >
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 glass glass-light rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
              <Search className="w-12 h-12 text-blue-400/90 mx-auto mb-4 animate-pulse" />
              <p className="text-white/80">Đang tải...</p>
            </div>
          ) : filteredAreas.length > 0 ? (
            filteredAreas.map((area) => (
              <AreaResultCard
                key={area.area_id}
                area={area}
                onSelect={handleSelectArea}
              />
            ))
          ) : (
            <div className="text-center py-8 glass glass-light rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
              <Search className="w-12 h-12 text-blue-400/90 mx-auto mb-4" />
              <p className="text-white/80">
                {search.trim()
                  ? "Không tìm thấy khu vực phù hợp"
                  : "Không có khu vực nào"}
              </p>
              {search.trim() && (
                <p className="text-sm text-white/60 mt-2">
                  Thử tìm kiếm với từ khóa khác
                </p>
              )}
            </div>
          )}
        </div>
      </DialogWrapper>
    </>
  );
};

export default AreaSearchBlock;
