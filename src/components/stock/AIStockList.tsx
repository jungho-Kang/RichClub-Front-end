import axios from "axios";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import type { AIStock } from "@/types/stock";

import { useAuthStore } from "@/stores/useAuthStore";
import { useStockStore } from "@/stores/useStockStore";

import BlurText from "@/components/ui/BlurText";
import { useWatchlistStore } from "@/stores/useWatchlistStore";

type TabType = "매수" | "매도";
type ViewType = "AI예측" | "관심종목";

interface AIStockListProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

const AIStockList = ({ won, pct }: AIStockListProps) => {
  const { isLogin } = useAuthStore();
  const { setSelectedStock } = useStockStore();
  const { getWatchlist, watchlist, removeWatch } = useWatchlistStore();

  const [view, setView] = useState<ViewType>("AI예측");
  const [tab, setTab] = useState<TabType>("매수");
  const [buyPredictions, setBuyPredictions] = useState<AIStock[] | null>(null);
  const [sellPredictions, setSellPredictions] = useState<AIStock[] | null>(
    null,
  );

  const getAIData = async () => {
    try {
      const [buyRes, sellRes] = await Promise.all([
        axios.get("/api/v1/stock/ai/today", { params: { signal: "매수" } }),
        axios.get("/api/v1/stock/ai/today", { params: { signal: "매도" } }),
      ]);
      setBuyPredictions(buyRes.data);
      setSellPredictions(sellRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAIData();
  }, []);

  useEffect(() => {
    if (view !== "관심종목" || watchlist !== null) return;
    getWatchlist();
  }, [view, watchlist]);

  const aiList = tab === "매수" ? buyPredictions : sellPredictions;

  const headerCount =
    view === "AI예측"
      ? tab === "매수"
        ? buyPredictions?.length
        : sellPredictions?.length
      : watchlist?.length;

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 flex flex-col flex-1">
      {/* 뷰 토글 (AI예측 / 관심종목) */}
      <div className="flex gap-1 bg-[#0f1013] p-1 rounded-lg mb-3">
        {(["AI예측", "관심종목"] as ViewType[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 text-xs px-2 py-1 rounded-md transition-all duration-150 ${
              view === v
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            } active:scale-95`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* 헤더 + 매수/매도 탭 (AI예측일 때만) */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-zinc-300 px-1">
          {view === "AI예측" ? "AI예측" : "관심종목"} ({headerCount ?? 0})
        </div>

        {view === "AI예측" && (
          <div className="flex gap-1 bg-[#0f1013] p-1 rounded-lg">
            {(["매수", "매도"] as TabType[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs px-2 py-1 rounded-md transition-all duration-150 ${
                  tab === t
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                } active:scale-95`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 리스트 */}
      <div className="space-y-3 overflow-y-auto max-h-240 pr-1 scrollbar-thumb-amber-50">
        {view === "AI예측" ? (
          aiList?.length ? (
            aiList.map((h, i) => (
              <div
                key={`${h.stock_code}-${i}`}
                onClick={() => setSelectedStock(h)}
                className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0 cursor-pointer
                  transition-all duration-150 hover:bg-white/5 hover:rounded-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                      <BlurText isLocked={!isLogin} className="truncate">
                        {h.stock_name}
                      </BlurText>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          h.signal === "매수"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : h.signal === "매도"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-zinc-700/40 text-zinc-400"
                        }`}
                      >
                        {h.signal}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      <BlurText isLocked={!isLogin}>{h.stock_code}</BlurText>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold">
                      {won(h.current_price)}
                    </div>
                    <div
                      className={`text-[11px] font-medium ${
                        h.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {h.change_pct && pct(h.change_pct)}
                    </div>
                  </div>
                </div>
                {h.confidence && (
                  <div className="mt-1 text-[10px] text-zinc-500">
                    AI 신뢰도 {h.confidence}%
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-6 border-b border-[#23242a] text-center text-zinc-500 text-sm">
              {tab === "매수"
                ? "매수 신호 데이터가 없습니다"
                : "매도 신호 데이터가 없습니다"}
            </div>
          )
        ) : watchlist?.length ? (
          watchlist.map((s, i) => (
            <div
              key={`${s.stock_code}-${i}`}
              onClick={() => setSelectedStock(s as any)}
              className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0 cursor-pointer
                transition-all duration-150 hover:bg-white/5 hover:rounded-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    <BlurText isLocked={!isLogin} className="truncate">
                      {s.stock_name}
                    </BlurText>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    <BlurText isLocked={!isLogin}>{s.stock_code}</BlurText>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeWatch(s.stock_code);
                  }}
                  className="text-amber-400 hover:text-zinc-500 transition-colors p-1"
                >
                  <Star className="w-4 h-4" fill={"currentColor"} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 border-b border-[#23242a] text-center text-zinc-500 text-sm">
            관심종목이 없습니다
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStockList;
