import { useState } from "react";
import type { AIStock } from "@/types/stock";
import { useAuthStore } from "@/stores/useAuthStore";
import BlurText from "@/components/ui/BlurText";

const AI_STOCKS: AIStock[] = [
  {
    name: "삼성전자",
    code: "005930",
    price: 73200,
    changePct: 1.53,
    signal: "매수",
    confidence: 82,
  },
  {
    name: "SK하이닉스",
    code: "000660",
    price: 184500,
    changePct: -1.46,
    signal: "관망",
    confidence: 61,
  },
  {
    name: "LG에너지솔루션",
    code: "373220",
    price: 372000,
    changePct: 0.68,
    signal: "매도",
    confidence: 58,
  },
  {
    name: "현대차",
    code: "005380",
    price: 248000,
    changePct: -0.82,
    signal: "매수",
    confidence: 76,
  },
  {
    name: "NAVER",
    code: "035420",
    price: 198000,
    changePct: 2.14,
    signal: "매수",
    confidence: 79,
  },
  {
    name: "카카오",
    code: "035720",
    price: 45200,
    changePct: -0.92,
    signal: "관망",
    confidence: 60,
  },
  {
    name: "삼성SDI",
    code: "006400",
    price: 512000,
    changePct: 1.87,
    signal: "매수",
    confidence: 83,
  },
  {
    name: "POSCO홀딩스",
    code: "005490",
    price: 435000,
    changePct: -1.12,
    signal: "관망",
    confidence: 64,
  },
  {
    name: "한화에어로스페이스",
    code: "012450",
    price: 365000,
    changePct: 3.25,
    signal: "매수",
    confidence: 88,
  },
  {
    name: "셀트리온",
    code: "068270",
    price: 182000,
    changePct: -2.35,
    signal: "매도",
    confidence: 55,
  },

  // 🔻 추가된 "전일 대비 하락 종목" (더 현실적인 흐름용)
  {
    name: "기아",
    code: "000270",
    price: 112500,
    changePct: -2.18,
    signal: "매도",
    confidence: 72,
  },
  {
    name: "LG화학",
    code: "051910",
    price: 412000,
    changePct: -3.41,
    signal: "관망",
    confidence: 66,
  },
  {
    name: "카카오뱅크",
    code: "323410",
    price: 25600,
    changePct: -4.12,
    signal: "매도",
    confidence: 59,
  },
];

interface AIStockListProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

type TabType = "매수" | "매도";

const AIStockList = ({ won, pct }: AIStockListProps) => {
  const { isLogin } = useAuthStore();
  const [tab, setTab] = useState<TabType>("매수");

  const filteredStocks = AI_STOCKS.filter(item => item.signal === tab);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 flex flex-col min-h-175 h-full">
      {/* 헤더 + 탭 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-zinc-300 px-1">
          AI예측 ({filteredStocks.length})
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
      <div className="space-y-3 overflow-y-auto max-h-160 pr-1 scrollbar-thumb-amber-50">
        {filteredStocks.map(h => (
          <div
            key={h.code}
            className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <BlurText isLocked={!isLogin} className="truncate">
                    {h.name}
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
                  <BlurText isLocked={!isLogin}>{h.code}</BlurText>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-semibold">{won(h.price)}</div>
                <div
                  className={`text-[11px] font-medium ${
                    h.changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {pct(h.changePct)}
                </div>
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
