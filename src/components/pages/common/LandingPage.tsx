import Footer from "@/components/blocks/footer/footer";
import LoaderBlock from "@/components/blocks/LoaderBlock";
import Navbar from "@/components/blocks/navbar/navbar";
import ChatbotDialogBlock from "@/components/blocks/ChatbotDialogBlock";
import { SectionWrapper } from "@/components/wrappers/SectionWrapper";
import { SECTION_IDS, SECTIONS_CONFIG } from "@/constants/sections.constants";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import useVRStore from "@/stores/vr.store";
import { Facebook } from "lucide-react";
import { useRef, useEffect } from "react";

const LandingPage = () => {
  const { loadData, isLoading } = useVRStore((state) => state);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);
  const navbarRef = useRef<HTMLElement | null>(null);
  const { activeSection, scrollToSection } = useScrollSpy({
    sectionIds: SECTION_IDS,
    offset: 20,
  });

  useEffect(() => {
    console.log("Current active section:", activeSection);
  }, [activeSection]);

  return (
    <>
      {isLoading && <LoaderBlock />}

      <div className="dark bg-background text-foreground w-full relative min-h-screen overflow-x-hidden">
        <Navbar
          ref={navbarRef}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />
        <div className="w-full max-w-none">
          {SECTIONS_CONFIG.map((section) => {
            const Component = section.component;
            const isHero = section.id === "hero";

            return (
              <SectionWrapper
                key={section.id}
                id={section.id}
                className={`${
                  isHero ? "min-h-[100vh]" : ""
                } w-full px-2 sm:px-4 md:px-6 lg:px-8`}
              >
                <div className="w-full max-w-7xl mx-auto">
                  <Component />
                </div>
              </SectionWrapper>
            );
          })}
        </div>
        <Footer />

        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 flex flex-col items-center gap-2 z-50">
          <div
            onClick={() => {
              window.open("https://www.facebook.com/tuoitreHCMUTE ", "_blank");
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full glass glass-light p-1.5 sm:p-2 flex justify-center items-center glass-hover cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <Facebook className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-white" />
            <div
              className="tooltip tooltip-top hidden sm:block"
              data-tip="Hỗ trợ trực tuyến"
            >
              <span></span>
            </div>
          </div>

          <ChatbotDialogBlock />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
