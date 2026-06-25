import { create } from "zustand";
import type { TooltipState } from "@/types/stock";

interface TooltipStore {
  tooltip: TooltipState | null;

  setTooltip: (data: Partial<TooltipState> | null) => void;

  clearTooltip: () => void;
}

export const useTooltipStore = create<TooltipStore>(set => ({
  tooltip: null,

  setTooltip: data =>
    set(state => {
      if (data === null) {
        return { tooltip: null };
      }

      return {
        tooltip: {
          ...(state.tooltip ?? {}),
          ...data,
        },
      };
    }),

  clearTooltip: () => set({ tooltip: null }),
}));
