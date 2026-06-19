import { create } from "zustand";
import type { Period } from "@/types/stock";

interface ChartState {
  // 상태
  period: Period;
  showMA5: boolean;
  showMA20: boolean;
  showMA60: boolean;

  // 액션
  setPeriod: (p: Period) => void;
  toggleMA5: () => void;
  toggleMA20: () => void;
  toggleMA60: () => void;
}

export const useChartStore = create<ChartState>(set => ({
  period: "3개월",

  showMA5: true,
  showMA20: true,
  showMA60: true,

  setPeriod: p => set({ period: p }),

  toggleMA5: () => set(state => ({ showMA5: !state.showMA5 })),

  toggleMA20: () => set(state => ({ showMA20: !state.showMA20 })),

  toggleMA60: () => set(state => ({ showMA60: !state.showMA60 })),
}));
