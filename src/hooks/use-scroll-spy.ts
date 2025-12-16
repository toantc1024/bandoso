import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type RefObject,
} from "react";

interface UseScrollSpyProps {
  sectionIds: string[];
  offset?: number;
  scrollContainer?: RefObject<HTMLElement | HTMLDivElement | null>;
}

export const useScrollSpy = ({
  sectionIds,
  offset = 100,
  scrollContainer,
}: UseScrollSpyProps) => {
  const [activeSection, setActiveSection] = useState<string>(
    sectionIds[0] || ""
  );
  const lastScrollTime = useRef<number>(0);

  const handleScroll = useCallback(() => {
    // Reduce throttling for better responsiveness during fast scrolling
    const now = Date.now();
    if (now - lastScrollTime.current < 50) return; // Reduced throttle to 50ms
    lastScrollTime.current = now;

    const container = scrollContainer?.current;

    // Get scroll position from container or window
    const scrollPosition = container
      ? container.scrollTop + offset
      : window.scrollY + offset;

    // Get unique section IDs to avoid duplicates
    const uniqueSectionIds = [...new Set(sectionIds)];

    // Get all section elements with their positions
    const sectionElements = uniqueSectionIds
      .map((id) => {
        const element = document.querySelector(`[id="${id}"]`) as HTMLElement;
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        const elementTop = container
          ? rect.top -
            (container.getBoundingClientRect().top || 0) +
            container.scrollTop
          : rect.top + window.scrollY;

        return {
          id,
          element,
          top: elementTop,
          bottom: elementTop + rect.height,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.top - b.top);

    if (sectionElements.length === 0) return;

    // Find the active section based on current scroll position
    let currentSection = sectionElements[0].id;

    // Check which section is most visible in the viewport
    const viewportHeight = container
      ? container.clientHeight
      : window.innerHeight;
    const viewportTop = scrollPosition - offset;
    const viewportBottom = viewportTop + viewportHeight;

    let maxVisibleArea = 0;
    let mostVisibleSection = sectionElements[0].id;

    for (const section of sectionElements) {
      // Calculate how much of the section is visible
      const visibleTop = Math.max(viewportTop, section.top);
      const visibleBottom = Math.min(viewportBottom, section.bottom);
      const visibleArea = Math.max(0, visibleBottom - visibleTop);

      if (visibleArea > maxVisibleArea) {
        maxVisibleArea = visibleArea;
        mostVisibleSection = section.id;
      }

      // If we're past this section's top, it could be the current one
      if (scrollPosition >= section.top - 50) {
        currentSection = section.id;
      }
    }

    // Use the most visible section if there's significant overlap, otherwise use the current section
    const finalSection =
      maxVisibleArea > 100 ? mostVisibleSection : currentSection;

    setActiveSection((prevActive) => {
      if (prevActive !== finalSection) {
        return finalSection;
      }
      return prevActive;
    });
  }, [sectionIds, offset, scrollContainer]);

  useEffect(() => {
    const container = scrollContainer?.current;

    // Set initial active section
    handleScroll();

    // Use requestAnimationFrame for smoother scroll handling during fast scrolling
    let rafId: number | null = null;
    let isScrolling = false;

    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          handleScroll();
          isScrolling = false;
        });
      }
    };

    if (container) {
      container.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);

      if (container) {
        container.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, [handleScroll, scrollContainer]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      // Find the first element with this ID
      const element = document.querySelector(
        `[id="${sectionId}"]`
      ) as HTMLElement;
      const container = scrollContainer?.current;

      if (element) {
        if (container) {
          // Scroll within the container
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop =
            elementRect.top - containerRect.top + container.scrollTop - offset;

          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        } else {
          // Fallback to window scroll
          const offsetTop = element.offsetTop - offset + 50;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      }
    },
    [offset, scrollContainer]
  );

  return {
    activeSection,
    scrollToSection,
  };
};
