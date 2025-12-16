import HotspotInfoBlock from "@/components/blocks/HotspotInfoBlock";
import HotspotPanoramaBlock from "@/components/blocks/HotspotPanoramaBlock";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHotspotById } from "@/services/hotspots.service";
import type { Hotspot } from "@/types/hotspots.service.type";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HotspotDocumentBlock from "../../../blocks/HotspotDocumentBlock";
import HotspotAssetBlock from "@/components/blocks/HotspotAssetBlock";

export default function HotspotDetailPage() {
  const { hotspotId } = useParams();
  const [currentHotspot, setCurrentHotspot] = useState<Partial<Hotspot>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getHotspotById(hotspotId as string).then((data) => {
      if (data) {
        setCurrentHotspot(data);
      }
      setIsLoading(false);
    });
  }, [hotspotId]);

  const tabs = [
    {
      name: "Thông tin",
      value: "info",
      content: (
        <HotspotInfoBlock
          currentHotspot={currentHotspot}
          setCurrentHotspot={setCurrentHotspot}
        />
      ),
    },
    {
      name: "Panorama",
      value: "panorama",
      content: <HotspotPanoramaBlock currentHotspot={currentHotspot} />,
    },
    {
      name: "Tài liệu",
      value: "documents",
      content: <HotspotDocumentBlock currentHotspot={currentHotspot} />,
    },
    {
      name: "Vật phẩm",
      value: "assets",
      content: <HotspotAssetBlock currentHotspot={currentHotspot} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="text-primary" size={64} variant="default" />
          <div className="text-lg font-medium text-foreground animate-pulse">
            Đang tải thông tin địa điểm...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue={tabs[0].value} className=" w-full">
      <div className="flex items-center justify-start gap-2">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-md">
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
