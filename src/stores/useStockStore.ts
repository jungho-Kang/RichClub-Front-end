import axios from "axios";
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
  modelsLoaded: boolean;
  setModels: (models: Model[]) => void;
  fetchModels: () => Promise<void>;
}

export const useStockStore = create<StockState>((set, get) => ({
  selectedStock: {
    stock_code: "005930",
    stock_name: "삼성전자",
  },
  setSelectedStock: selectedStock => set({ selectedStock }),

  selectedModel: "ju-model-v2",
  setSelectedModel: modelId => set({ selectedModel: modelId }),

  models: [],
  modelsLoaded: false,
  setModels: models => set({ models, modelsLoaded: true }),

  // 이미 불러온 적 있으면 다시 요청하지 않음
  fetchModels: async () => {
    if (get().modelsLoaded) return;
    try {
      const res = await axios.get("/api/v1/models");
      set({ models: res.data, modelsLoaded: true });
    } catch (error) {
      console.log(error);
    }
  },
}));
