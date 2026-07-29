import { RiChatAiFill } from "react-icons/ri";
import { ArrowUpRight, CirclePlay, Gamepad2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuroraText } from "../magicui/aurora-text";
import { cn } from "@/lib/utils";
import { GridPattern } from "../magicui/grid-pattern";
import { ShineBorder } from "../magicui/shine-border";
import MapDialogBlock from "../blocks/MapBlock";
import useAreaSearchStore from "@/stores/area-search.store";
export default function HeroSection() {
  const { setAreaSearchDialogOpen } = useAreaSearchStore();

  return (
    <div className="relative pt-36 min-h-screen pb-2 w-full flex flex-col gap-10 items-center justify-center px-6 py-6">
      <div className="top-0 z-[0] flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg absolute">
        <GridPattern
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [14, 8],
            [8, 14],
            [6, 12],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
      </div>
      <div className="relative z-[20] text-center max-w-2xl">
        <Badge className="text-blue-900 border border-blue-200 rounded-full py-1.5 px-4 text-sm bg-blue-50/80 font-medium shadow-xs inline-flex items-center gap-1.5">
          Công nghệ{" "}
          <Badge className="text-white py-0.5 px-2 rounded-full bg-blue-600 font-semibold border-none">
            VR
          </Badge>
        </Badge>
        <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-extrabold text-blue-950 !leading-[1.2] tracking-tight">
          Nền tảng trải nghiệm
          <br />
          <AuroraText>Lịch sử số & Thực tế ảo</AuroraText>
        </h1>
        <p className="mt-6 text-[17px] md:text-lg text-blue-700 font-medium max-w-xl mx-auto leading-relaxed">
          Khám phá truyền thống - Lịch sử - văn hoá bằng Công nghệ Số.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center z-[30] justify-center gap-3 sm:gap-4 w-full max-w-4xl">
          <Button
            onClick={() => {
              setAreaSearchDialogOpen(true);
            }}
            size="lg"
            className="rounded-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700 font-semibold w-full sm:w-auto min-w-[140px] shadow-sm hover:shadow-md transition-all"
          >
            Bắt đầu <ArrowUpRight className="!h-5 !w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer border-blue-200 text-blue-900 bg-white/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium text-base shadow-xs w-full sm:w-auto min-w-[130px] transition-all"
          >
            <Gamepad2 className="!h-5 !w-5 text-blue-600" />
            <span className="hidden sm:inline">Trò chơi Lịch sử</span>
            <span className="sm:hidden">Trò chơi</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer border-blue-200 text-blue-900 bg-white/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium text-base shadow-xs w-full sm:w-auto min-w-[130px] transition-all"
          >
            <RiChatAiFill className="!h-5 !w-5 text-blue-600" />
            <span className="">AI Chatbot</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer border-blue-200 text-blue-900 bg-white/90 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium text-base shadow-xs w-full sm:w-auto min-w-[130px] transition-all"
          >
            <CirclePlay className="!h-5 !w-5 text-blue-600" />
            <span className="hidden sm:inline">Video 360</span>
            <span className="sm:hidden">Video</span>
          </Button>
        </div>
      </div>
      <div className="relative mt-6 rounded-3xl w-full min-h-[480px] h-[520px]">
        <div className="absolute z-[0] top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="w-full max-w-screen-xl mx-auto z-[1] absolute inset-0 h-full">
          <Card className="relative overflow-hidden !p-0 h-full w-full border border-blue-200 shadow-md">
            <ShineBorder
              borderWidth={2}
              shineColor={["#3b82f6", "#60a5fa", "#93c5fd"]}
            />

            <CardContent className="h-full !p-0">
              <MapDialogBlock
                opened={true}
                setOpened={() => {}}
                showMedia={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
