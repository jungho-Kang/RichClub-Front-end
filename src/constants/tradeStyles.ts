import type { TradeType } from "@/types/trade-history";

export const BADGE: Record<TradeType, string> = {
  매수: "bg-green-500/20 text-green-400",
  매도: "bg-red-500/20 text-red-400",
  관망: "bg-zinc-500/20 text-zinc-400",
};
