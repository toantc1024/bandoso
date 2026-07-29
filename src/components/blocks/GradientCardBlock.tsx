import { cn } from "@/lib/utils";
import { MagicCard } from "../magicui/magic-card";

const GradientCardBlock = ({ children, className }: any) => {
  return (
    <MagicCard
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl border border-blue-200/90 bg-white/95 text-blue-950 shadow-xs hover:border-blue-300",
        className
      )}
      gradientColor={"#bfdbfe"}
    >
      {children}
    </MagicCard>
  );
};

export default GradientCardBlock;
