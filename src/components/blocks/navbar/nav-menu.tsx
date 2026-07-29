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
      <NavigationMenuList className="lg:border lg:border-blue-200/80 lg:bg-blue-50/50 lg:rounded-full p-1 gap-1.5 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        {mainSections.map((section) => (
          <NavigationMenuItem key={section.id}>
            <NavigationMenuLink asChild>
              <Button
                variant="ghost"
                className={`rounded-full cursor-pointer font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-xs font-semibold"
                    : "text-blue-950 hover:bg-blue-100/70 hover:text-blue-600"
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
