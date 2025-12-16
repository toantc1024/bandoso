import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AreaInfoBlock from "../../../blocks/AreaInfoBlock";
import AreaHotspotsBlock from "@/components/blocks/AreaHotspotsBlock";
import AreaUserBlock from "@/components/blocks/AreaUserBlock";
import { useParams } from "react-router-dom";

export default function AreaDetailPage() {
  const { areaId } = useParams();
  const tabs = [
    {
      name: "Thông tin",
      value: "info",
      content: <AreaInfoBlock areaId={areaId} />,
    },
    {
      name: "Địa điểm",
      value: "hotspot",
      content: <AreaHotspotsBlock areaId={areaId} />,
    },
    {
      name: "Người dùng",
      value: "users",
      content: <AreaUserBlock areaId={areaId} />,
    },
  ];

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
