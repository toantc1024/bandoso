"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";
import useVRStore from "@/stores/vr.store";

import { MapPin } from "lucide-react";
import { useState } from "react";

interface Item {
  name: string;
  description: string;
  address: string;
  preview_image: string;
}

const ItemBlock = ({ name, address, preview_image }: Item) => {
  const [imgError, setImgError] = useState(false);

  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-3.5",
        "transition-all duration-200 ease-in-out hover:scale-[102%]",
        "bg-white border border-blue-200/90 shadow-xs hover:border-blue-300 hover:bg-blue-50/60"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        {!preview_image || imgError ? (
          <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
            <MapPin className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden shrink-0 border border-blue-200">
            <img
              src={preview_image}
              alt={name}
              className="w-10 h-10 object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre font-bold text-blue-950">
            <span className="text-sm sm:text-base truncate">{name}</span>
          </figcaption>
          <p className="text-xs font-medium text-blue-700 truncate">{address}</p>
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
