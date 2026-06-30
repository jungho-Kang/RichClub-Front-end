import type { SelectedStockItem } from "@/types/stock";
import { create } from "zustand";

interface Model {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

interface StockState {
  selectedStock: SelectedStockItem;
  setSelectedStock: (selectedStock: SelectedStockItem) => void;

  selectedModel: string;
  setSelectedModel: (modelId: string) => void;

  models: Model[];
  setModels: (models: Model[]) => void;
}

export const useStockStore = create<StockState>(set => ({
  selectedStock: {
    stock_code: "005930",
    stock_name: "삼성전자",
  },
  setSelectedStock: selectedStock => set({ selectedStock }),

  selectedModel: "ju-model-v2",
  setSelectedModel: modelId => set({ selectedModel: modelId }),

  models: [],
  setModels: models => set({ models }),
}));
