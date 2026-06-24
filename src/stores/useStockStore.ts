import type { SelectedStockItem } from "@/types/stock";
import { create } from "zustand";

interface StockState {
  selectedStock: SelectedStockItem;
  setSelectedStock: (selectedStock: SelectedStockItem) => void;
}

export const useStockStore = create<StockState>(set => ({
  selectedStock: {
    stock_code: "005930",
    stock_name: "삼성전자",
  },

  setSelectedStock: selectedStock => set({ selectedStock }),
}));
