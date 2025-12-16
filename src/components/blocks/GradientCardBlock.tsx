import { cn } from "@/lib/utils";
import { MagicCard } from "../magicui/magic-card";

const GradientCardBlock = ({ children, className }: any) => {
  return (
    <MagicCard
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        // light styles
        "bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
        className
      )}
      gradientColor={"#262626"}
    >
      {children}
    </MagicCard>
  );
};

export default GradientCardBlock;
