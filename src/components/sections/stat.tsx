import { countAreas } from "@/services/areas.service";
import { countVisitLogs } from "@/services/visitor_logs.service";
import { countHotspots } from "@/services/hotspots.service";
import { useEffect, useState } from "react";
import { NumberTicker } from "@/components/magicui/number-ticket";

import { TextAnimate } from "../magicui/text-animate";

export function StatsSection() {
  const [totalVisitorLogs, setTotalVisitorLogs] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [totalHotspots, setTotalHotspots] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [visitorLogsCount, areasCount, hotspotsCount] = await Promise.all(
          [countVisitLogs(), countAreas(), countHotspots()]
        );

        setTotalVisitorLogs(visitorLogsCount);
        setTotalAreas(areasCount);
        setTotalHotspots(hotspotsCount);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-8 lg:px-24 flex w-full justify-center">
      <div className="container">
        <h2 className="py-8 text-2xl text-center font-extrabold text-blue-950 md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Những con số biết nói
          </TextAnimate>
        </h2>

        <div className="mt-4 sm:mt-8 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-center">
          <div className="p-6 border border-blue-200/90 bg-white/95 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 transition-all col-span-1 md:col-span-2">
            <span className="text-5xl md:text-6xl font-extrabold text-blue-600">
              <NumberTicker value={totalVisitorLogs} />+
            </span>
            <p className="mt-4 text-xl font-bold text-blue-950">Lượt xem</p>
            <p className="mt-1.5 text-base text-blue-700 font-medium">
              Đã được thực hiện trong khu vực.
            </p>
          </div>
          <div className="p-6 border border-blue-200/90 bg-white/95 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 transition-all col-span-1">
            <span className="text-5xl md:text-6xl font-extrabold text-blue-600">
              <NumberTicker value={totalAreas} />
            </span>
            <p className="mt-4 text-xl font-bold text-blue-950">Khu vực</p>
            <p className="mt-1.5 text-base text-blue-700 font-medium">
              Đã được cập nhật lên hệ thống.
            </p>
          </div>
          <div className="p-6 border border-blue-200/90 bg-white/95 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-300 transition-all col-span-1">
            <span className="text-5xl md:text-6xl font-extrabold text-blue-600">
              <NumberTicker value={totalHotspots} />
            </span>
            <p className="mt-4 text-xl font-bold text-blue-950">Địa điểm</p>
            <p className="mt-1.5 text-base text-blue-700 font-medium">
              Đã được thêm vào các khu vực.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
