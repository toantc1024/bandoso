import { FileTextIcon } from "@radix-ui/react-icons";
import { MapPin, MousePointerClickIcon, Share2Icon } from "lucide-react";

import useVRSTore from "@/stores/vr.store";
// import MapBlock from "../block/MapBlock";
import { cn } from "@/lib/utils";
// import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { AnimatedBeamMultipleInputs } from "../blocks/AnimatedBeamMultipleInputs";
// import { AnimatedListBlock } from "../block/AnimatedListBlock";
import { TextAnimate } from "../magicui/text-animate";
// import useVRStore from "@/store/vr.store";
import { useMemo } from "react";
import { Marquee } from "../magicui/marquee";
import { AnimatedListBlock } from "../blocks/AnimatedListBlock";
import { BentoCard, BentoGrid } from "../magicui/bento-grid";
import MapDialogBlock from "../blocks/MapBlock";

export function AboutSection() {
  const { areas } = useVRSTore((state) => state);
  const files = useMemo(() => {
    if (!areas) return [];
    return areas.map((area) => ({
      name: area.area_name,
      body: area.description,
    }));
  }, [areas]);

  const features = useMemo(
    () => [
      {
        Icon: FileTextIcon,
        name: "Số hóa thông tin lịch sử",
        description:
          "Toàn bộ dữ liệu về địa chỉ đỏ, nhân vật, sự kiện được số hóa, dễ dàng tra cứu và chính xác.",
        href: "#",
        cta: "",
        className: "col-span-3 lg:col-span-1",
        background: (
          <Marquee
            pauseOnHover
            className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
          >
            {files.map((f, idx) => (
              <figure
                key={idx}
                className={cn(
                  "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                  "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                  "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                  "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
                )}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="flex flex-col">
                    <figcaption className="text-sm text-nowrap font-medium dark:text-white ">
                      {f.name}
                    </figcaption>
                  </div>
                </div>
                <blockquote className="mt-2 text-xs">{f.body}</blockquote>
              </figure>
            ))}
          </Marquee>
        ),
      },
      {
        Icon: MapPin,
        name: "Khám phá địa điểm nổi bật",
        description:
          "Dữ liệu của các địa chỉ đỏ nổi bật trong khu vực một cách chính xác và đầy đủ.",
        href: "#",
        cta: "",
        className: "col-span-3 lg:col-span-2",
        background: (
          <AnimatedListBlock className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
        ),
      },
      {
        Icon: Share2Icon,
        name: "Công nghệ tiên tiến",
        description:
          "Ứng dụng các công nghệ Thực tế ảo (VR) và Trí tuệ nhân tạo (AI) để xây dựng giải pháp thân thiện với người dùng.",
        href: "#",
        cta: "",
        className: "col-span-3 lg:col-span-2",
        background: (
          <AnimatedBeamMultipleInputs className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
      },
      {
        Icon: MousePointerClickIcon,
        name: "Tương tác dễ dàng",
        description:
          "Sử dụng ngay trên trình duyệt đến mọi nơi chỉ bằng click chuột.",
        className: "col-span-3 lg:col-span-1",
        href: "#",
        cta: "",
        background: (
          <div className="w-full h-full absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90">
            <MapDialogBlock
              opened={false}
              setOpened={() => {}}
              showMedia={() => {}}
            />
          </div>
          // <Calendar
          //     mode="single"
          //     selected={new Date(2022, 4, 11, 0, 0, 0)}
          //     className="absolute right-0 top-10 origin-top scale-75 rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
          // />
        ),
      },
    ],
    [files]
  ); // <-- re-run only when `files` changes

  return (
    <section className="pt-8 px-4 sm:pt-12 sm:px-6 md:pt-8 lg:px-24 flex w-full justify-center">
      <div className="container">
        <h2 className="py-8  text-2xl text-center font-bold md:text-4xl lg:text-5xl">
          <TextAnimate animation="blurIn" as="h1">
            Nền tảng thực tế ảo
          </TextAnimate>
        </h2>
        <>
          <BentoGrid>
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </>
      </div>
    </section>
  );
}
