import { create } from "zustand";

interface ChartState {
  showMA5: boolean;
  showMA20: boolean;
  showMA60: boolean;
  showIchimoku: boolean;

  // 차트 crosshair 기준선 공유
  hoveredDate: string | null;

  toggleMA5: () => void;
  toggleMA20: () => void;
  toggleMA60: () => void;
  toggleIchimoku: () => void;

  setHoveredDate: (date: string | null) => void;
}

export const useChartStore = create<ChartState>(set => ({
  showMA5: true,
  showMA20: true,
  showMA60: true,
  showIchimoku: true,

  hoveredDate: null,

  toggleMA5: () => set(state => ({ showMA5: !state.showMA5 })),
  toggleMA20: () => set(state => ({ showMA20: !state.showMA20 })),
  toggleMA60: () => set(state => ({ showMA60: !state.showMA60 })),
  toggleIchimoku: () => set(state => ({ showIchimoku: !state.showIchimoku })),

  setHoveredDate: date => set({ hoveredDate: date }),
}));
