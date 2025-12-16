export interface SectionConfig {
  id: string;
  label: string;
  component: React.ComponentType;
}

import { AboutSection } from "@/components/sections/about";
import HeroSection from "../components/sections/hero";
import { StatsSection } from "@/components/sections/stat";
import { ContactSection } from "@/components/sections/contact";
import { FeatureSection } from "@/components/sections/feature";
import { PackageSection } from "@/components/sections/package";

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: "hero",
    label: "Trang chủ",
    component: HeroSection,
  },
  {
    id: "about",
    label: "Giới thiệu",
    component: AboutSection,
  },
  {
    id: "about",
    label: "Giới thiệu",
    component: StatsSection,
  },
  {
    id: "about",
    label: "Giới thiệu",
    component: FeatureSection,
  },
  {
    id: "about",
    label: "Giới thiệu",
    component: PackageSection,
  },
  {
    id: "contact",
    label: "Liên hệ",
    component: ContactSection,
  },
];

export const SECTION_IDS = SECTIONS_CONFIG.map((section) => section.id);
