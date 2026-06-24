import { create } from "zustand";

interface ChartState {
  showMA5: boolean;
  showMA20: boolean;
  showMA60: boolean;
  showIchimoku: boolean;

  // 차트 관련 변수
  hoveredDate: string | null;
  priceScaleWidth: number;

  toggleMA5: () => void;
  toggleMA20: () => void;
  toggleMA60: () => void;
  toggleIchimoku: () => void;

  // 차트 관련 setter
  setHoveredDate: (date: string | null) => void;
  setPriceScaleWidth: (width: number) => void;
}

export const useChartStore = create<ChartState>(set => ({
  showMA5: true,
  showMA20: true,
  showMA60: true,
  showIchimoku: true,

  hoveredDate: null,
  priceScaleWidth: 80, // 기본 최소 너비 설정

  toggleMA5: () => set(state => ({ showMA5: !state.showMA5 })),
  toggleMA20: () => set(state => ({ showMA20: !state.showMA20 })),
  toggleMA60: () => set(state => ({ showMA60: !state.showMA60 })),
  toggleIchimoku: () => set(state => ({ showIchimoku: !state.showIchimoku })),

  setHoveredDate: date => set({ hoveredDate: date }),
  setPriceScaleWidth: width =>
    set(state => ({
      // 더 넓은 너비가 들어왔을 때만 업데이트해서 무한 루프 방지 및 최대폭 유지
      priceScaleWidth: Math.max(state.priceScaleWidth, width),
    })),
}));
