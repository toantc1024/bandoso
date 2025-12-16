import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import type { NavigationMenuProps } from "@radix-ui/react-navigation-menu";

interface NavMenuProps extends NavigationMenuProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
}

export const NavMenu = ({
  activeSection,
  onNavigate,
  ...props
}: NavMenuProps) => {
  // Define the main navigation sections
  const mainSections = [
    { id: "hero", label: "Trang chủ" },
    { id: "about", label: "Giới thiệu" },
    { id: "contact", label: "Liên hệ" },
  ];

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="lg:border-[1px] lg:rounded-full p-1 border-white/20 gap-2 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {mainSections.map((section) => (
          <NavigationMenuItem key={section.id}>
            <NavigationMenuLink asChild>
              <Button
                variant="ghost"
                className={`rounded-full cursor-pointer glass-hover hover:text-white! ${
                  activeSection === section.id ? "glass !text-white" : ""
                }`}
                onClick={() => onNavigate?.(section.id)}
              >
                {section.label}
              </Button>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
