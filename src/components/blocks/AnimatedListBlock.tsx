"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";
import useVRStore from "@/stores/vr.store";

interface Item {
  name: string;
  description: string;
  address: string;
  preview_image: string;
}

const ItemBlock = ({ name, address, preview_image }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg">
          <img
            src={preview_image}
            alt={name}
            className="!w-10 !h-10 object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">{address}</p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListBlock({ className }: { className?: string }) {
  const { hotspots } = useVRStore((state) => state);
  let items =
    hotspots?.map((hotspot) => ({
      name: hotspot.title || "Untitled",
      description: hotspot.description || "No description",
      address: hotspot.address || "No address",
      preview_image: hotspot.preview_image || "",
    })) || [];
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className
      )}
    >
      <AnimatedList>
        {items.map((item, idx) => (
          <ItemBlock {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}
