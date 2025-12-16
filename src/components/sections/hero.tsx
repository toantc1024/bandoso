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
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
          className={cn(
            "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
      </div>
      <div className="relative z-[20] text-center max-w-2xl   ">
        <Badge className="text-white rounded-full py-2 text-md bg-background glass glass-light">
          Công nghệ{" "}
          <Badge className="text-white py-1  rounded-full !bg-primary">
            VR
          </Badge>
        </Badge>
        <h1 className="mt-6 text-3xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
          Nền tảng trải nghiệm
          <br />
          <AuroraText>Lịch sử số & Thực tế ảo</AuroraText>
        </h1>
        <p className="mt-6 text-[17px] md:text-lg">
          Khám phá truyền thống - Lịch sử - văn hoá bằng Công nghệ Số.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center z-[30] justify-center gap-3 sm:gap-4 w-full max-w-4xl">
          <Button
            onClick={() => {
              setAreaSearchDialogOpen(true);
            }}
            size="lg"
            className="rounded-full cursor-pointer text-white w-full sm:w-auto min-w-[140px]"
          >
            Bắt đầu <ArrowUpRight className="!h-5 !w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer backdrop-blur-xl text-base shadow-none w-full sm:w-auto min-w-[130px]"
          >
            <Gamepad2 className="!h-5 !w-5" />
            <span className="hidden sm:inline">Trò chơi Lịch sử</span>
            <span className="sm:hidden">Trò chơi</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer backdrop-blur-xl text-base shadow-none w-full sm:w-auto min-w-[130px]"
          >
            <RiChatAiFill className="!h-5 !w-5" />
            <span className="">AI Chatbot</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full cursor-pointer backdrop-blur-xl text-base shadow-none w-full sm:w-auto min-w-[130px]"
          >
            <CirclePlay className="!h-5 !w-5" />
            <span className="hidden sm:inline">Video 360</span>
            <span className="sm:hidden">Video</span>
          </Button>
        </div>
      </div>
      <div className="relative mt-6 rounded-3xl w-full  aspect-video">
        <div className="absolute z-[0] top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>
        <div className=" w-full  max-w-screen-xl mx-auto z-[1] absolute left-0 right-0 aspect-video">
          <Card className="relative overflow-hidden !p-0  h-full  w-full">
            <ShineBorder
              borderWidth={2}
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
            />

            <CardContent className="h-full !p-0">
              <MapDialogBlock
                opened={true}
                setOpened={() => {}}
                showMedia={() => {}}
              />
              {/* <iframe src="./vr_core/index.htm" className=" w-full h-full" /> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
