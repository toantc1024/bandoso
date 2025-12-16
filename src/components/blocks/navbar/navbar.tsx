import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import AreaSearchBlock from "../AreaSearchBlock";

interface NavbarProps {
  ref: React.RefObject<HTMLElement | null>;
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

const Navbar = ({ ref, activeSection, onNavigate }: NavbarProps) => {
  return (
    <>
      <nav
        ref={ref}
        className="glass glass-light hover:border-none fixed top-0 mt-4 inset-x-4 h-16 bg-background border dark:border-slate-700/70 max-w-screen-xl  mx-auto rounded-full z-[40]"
      >
        <div className=" h-full flex items-center justify-between mx-auto px-4">
          <Logo />

          {/* Desktop Menu */}
          <NavMenu
            className="hidden md:block"
            activeSection={activeSection}
            onNavigate={onNavigate}
          />

          <div className=" flex items-center gap-3">
            <AreaSearchBlock />

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet
                activeSection={activeSection}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
