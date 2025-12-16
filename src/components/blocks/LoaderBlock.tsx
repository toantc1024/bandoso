import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";

const LoaderBlock = () => {
  return (
    <div className="dark  z-[999] fixed top-0 bottom-0 left-0 right-0 flex flex-col flex-reverse gap-8 items-center justify-center bg-gray-900 ">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
      <span className="loader"></span>
    </div>
  );
};

export default LoaderBlock;
