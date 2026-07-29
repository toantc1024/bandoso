import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta?: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      "bg-white border border-blue-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-300",
      className,
    )}
    {...props}
  >
    <div>{background}</div>
    <div className="p-5">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1.5 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="hidden lg:block h-10 w-10 origin-left transform-gpu text-blue-600 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-bold text-blue-950">
          {name}
        </h3>
        <p className="max-w-lg text-blue-700 font-medium leading-relaxed">{description}</p>
      </div>

      {
        cta && <div
          className={cn(
            "lg:hidden pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          <Button
            variant="link"
            asChild
            size="sm"
            className="pointer-events-auto p-0"
          >
            <a href={href}>
              {cta}
              <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
            </a>
          </Button>
        </div>
      }
    </div>

    {
      cta && <div
        className={cn(
          "hidden lg:flex pointer-events-none absolute bottom-0 w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button
          variant="link"
          asChild
          size="sm"
          className="pointer-events-auto p-0"
        >
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    }
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-blue-500/[.03]" />
  </div>
);

export { BentoCard, BentoGrid };
