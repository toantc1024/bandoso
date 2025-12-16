import { create } from "zustand";

interface AreaSearchState {
  isAreaSearchDialogOpen: boolean;
  setAreaSearchDialogOpen: (open: boolean) => void;
  toggleAreaSearchDialog: () => void;
}

const useAreaSearchStore = create<AreaSearchState>((set) => ({
  isAreaSearchDialogOpen: false,
  setAreaSearchDialogOpen: (open: boolean) =>
    set({ isAreaSearchDialogOpen: open }),
  toggleAreaSearchDialog: () =>
    set((state) => ({ isAreaSearchDialogOpen: !state.isAreaSearchDialogOpen })),
}));

export default useAreaSearchStore;
