import { create } from "zustand";

import type { Area } from "../types/areas.service.type";
import { getPreviewAreas } from "@/services/areas.service";
import type { Hotspot } from "@/types/hotspots.service.type";
import { getPreviewHotspotsWithAreas } from "@/services/hotspots.service";
import type { WithJoins } from "@/types/pagination.type";

interface VRStoreState {
  currentArea: Area | null;
  isLoading: boolean;
  areas: Area[];
  hotspots: WithJoins<Hotspot>[];
}

interface VRStateActions {
  setCurrentArea: (area: Area | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setAreas: (areas: Area[]) => void;
  loadData: () => Promise<void>;
  setHotspots: (hotspots: WithJoins<Hotspot>[]) => void;
}

type VRStore = VRStoreState & VRStateActions;

const useVRStore = create<VRStore>((set) => ({
  currentArea: null,
  isLoading: true,
  areas: [],
  hotspots: [],
  setCurrentArea: (area) => set({ currentArea: area }),
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading: isLoading });
  },
  setHotspots: (hotspots) => set({ hotspots: hotspots }),
  setAreas: (areas) => set({ areas: areas }),
  loadData: async () => {
    set({ isLoading: true });
    try {
      let area_data = await getPreviewAreas();
      set({ areas: area_data });

      // Get hotspots with joined area information
      let hotspots_with_areas = await getPreviewHotspotsWithAreas();

      set({ hotspots: hotspots_with_areas, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

export default useVRStore;
