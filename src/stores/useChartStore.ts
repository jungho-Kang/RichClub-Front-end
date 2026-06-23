import { create } from "zustand";
import type { Period } from "@/types/stock";

interface ChartState {
  period: Period;
  showMA5: boolean;
  showMA20: boolean;
  showMA60: boolean;
  showIchimoku: boolean;

  // 차트 crosshair 기준선 공유
  hoveredDate: string | null;

  setPeriod: (p: Period) => void;
  toggleMA5: () => void;
  toggleMA20: () => void;
  toggleMA60: () => void;
  toggleIchimoku: () => void;

  setHoveredDate: (date: string | null) => void;
}

export const useChartStore = create<ChartState>(set => ({
  period: "3개월",
  showMA5: true,
  showMA20: true,
  showMA60: true,
  showIchimoku: true,

  hoveredDate: null,

  setPeriod: p => set({ period: p }),

  toggleMA5: () => set(state => ({ showMA5: !state.showMA5 })),
  toggleMA20: () => set(state => ({ showMA20: !state.showMA20 })),
  toggleMA60: () => set(state => ({ showMA60: !state.showMA60 })),
  toggleIchimoku: () => set(state => ({ showIchimoku: !state.showIchimoku })),

  setHoveredDate: date => set({ hoveredDate: date }),
}));
