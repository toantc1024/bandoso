import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";

interface NavigationSheetProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export const NavigationSheet = ({ activeSection, onNavigate }: NavigationSheetProps) => {
  return (
    <Sheet >
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full glass border-white/90 !text-white text-base shadow-none">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="z-[999] p-4 flex flex-col glass glass-lightborder-white/90 !text-white text-base shadow-none">
        <Logo />
        <NavMenu
          orientation="vertical"
          className="md:mt-6 gap-2  flex  justify-start items-start"
          activeSection={activeSection}
          onNavigate={onNavigate}
        />
      </SheetContent>
    </Sheet>
  );
};
