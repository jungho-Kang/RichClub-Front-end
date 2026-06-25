import { create } from "zustand";
import axios from "axios";
import type { TradeType } from "@/types/trade-history";

interface WatchlistStock {
  stock_code: string;
  stock_name: string;
  current_price: number;
  id: string;
  signal: TradeType;
  added_at: string;
  memo?: string;
  confidence?: string;
}

interface WatchlistStore {
  watchlist: WatchlistStock[];
  watchedCodes: Set<string>;
  getWatchlist: () => Promise<void>;
  addWatch: (stock_code: string, stock_name: string) => Promise<void>;
  removeWatch: (stock_code: string) => Promise<void>;
  // 관심종목 여부 조회
  isWatched: (stock_code: string) => boolean;
}

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  // 관심종목 list
  watchlist: [],
  watchedCodes: new Set(),

  getWatchlist: async () => {
    try {
      const res = await axios.get("/api/v1/watchlist");
      const list: WatchlistStock[] = res.data;
      set({
        watchlist: list,
        watchedCodes: new Set(list.map(s => s.stock_code)),
      });
    } catch (error) {
      console.log(error);
    }
  },

  addWatch: async (stock_code, stock_name) => {
    try {
      const res = await axios.post("/api/v1/watchlist", {
        stock_code,
        stock_name,
        memo: "",
      });
      set(state => ({
        watchedCodes: new Set(state.watchedCodes).add(stock_code),
        watchlist: [...state.watchlist, res.data],
      }));
    } catch (error) {
      console.log(error);
    }
  },

  removeWatch: async stock_code => {
    const item = get().watchlist.find(s => s.stock_code === stock_code);
    if (!item) return;

    try {
      await axios.delete(`/api/v1/watchlist/${item.id}`);
      set(state => {
        const next = new Set(state.watchedCodes);
        next.delete(stock_code);
        return {
          watchedCodes: next,
          watchlist: state.watchlist.filter(s => s.id !== item.id),
        };
      });
    } catch (error) {
      console.log(error);
    }
  },

  isWatched: stock_code => get().watchedCodes.has(stock_code),
}));
