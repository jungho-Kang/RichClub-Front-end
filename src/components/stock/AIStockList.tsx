import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import BlurText from "@/components/ui/BlurText";
import axios from "axios";
import type { AIStock } from "@/types/stock";

type TabType = "매수" | "매도";

interface AIStockListProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

const AIStockList = ({ won }: AIStockListProps) => {
  const { isLogin } = useAuthStore();
  const [tab, setTab] = useState<TabType>("매수");
  const [buyPredictions, setBuyPredictions] = useState<AIStock[] | null>(null);
  const [sellPredictions, setSellPredictions] = useState<AIStock[] | null>(
    null,
  );

  useEffect(() => {
    // 매수, 매도 AI예측 데이터 가져오기
    const getChartData = async () => {
      try {
        const buyRes = await axios.get("/api/v1/stock/ai/predictions", {
          params: {
            signal: "매수",
          },
        });

        const sellRes = await axios.get("/api/v1/stock/ai/predictions", {
          params: {
            signal: "매도",
          },
        });
        setBuyPredictions(buyRes.data);
        setSellPredictions(sellRes.data);
      } catch (error) {
        console.log(error);
      }
    };
    getChartData();
  }, []);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 flex flex-col min-h-200 h-full">
      {/* 헤더 + 탭 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-zinc-300 px-1">
          AI예측 (
          {tab === "매수" ? buyPredictions?.length : sellPredictions?.length})
        </div>

        <div className="flex gap-1 bg-[#0f1013] p-1 rounded-lg">
          {(["매수", "매도"] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      <div className="space-y-3 overflow-y-auto max-h-180 pr-1 scrollbar-thumb-amber-50">
        {tab === "매수"
          ? buyPredictions?.map((h, i) => (
              <div
                key={`${h.stock_code}-${i}`}
                className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0"
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
                    {/* <div
                  className={`text-[11px] font-medium ${
                    h.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {pct(h.changePct)}
                </div> */}
                  </div>
                </div>

                {h.confidence && (
                  <div className="mt-1 text-[10px] text-zinc-500">
                    AI 신뢰도 {h.confidence}%
                  </div>
                )}
              </div>
            ))
          : sellPredictions?.map((h, i) => (
              <div
                key={`${h.stock_code}-${i}`}
                className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0"
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
                    {/* <div
                  className={`text-[11px] font-medium ${
                    h.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {pct(h.changePct)}
                </div> */}
                  </div>
                </div>

                {h.confidence && (
                  <div className="mt-1 text-[10px] text-zinc-500">
                    AI 신뢰도 {h.confidence}%
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
};

export default AIStockList;
