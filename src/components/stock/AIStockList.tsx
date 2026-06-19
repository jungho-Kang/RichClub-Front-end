import type { AIStock } from "@/types/stock";

// AI 예측 리스트
const AI_STOCKS: AIStock[] = [
  {
    name: "삼성전자",
    code: "005930",
    price: 73200,
    changePct: 1.53,
    signal: "매수",
    confidence: 82,
    shares: 120,
    avgPrice: 68400,
    pnlPct: 7.82,
  },
  {
    name: "SK하이닉스",
    code: "000660",
    price: 184500,
    changePct: -1.46,
    signal: "관망",
    confidence: 61,
    shares: 30,
    avgPrice: 165000,
    pnlPct: 11.82,
  },
  {
    name: "LG에너지솔루션",
    code: "373220",
    price: 372000,
    changePct: 0.68,
    signal: "매도",
    confidence: 58,
    shares: 8,
    avgPrice: 401000,
    pnlPct: -7.23,
  },
  {
    name: "현대차",
    code: "005380",
    price: 248000,
    changePct: 1.22,
    signal: "매수",
    confidence: 76,
    shares: 15,
    avgPrice: 231000,
    pnlPct: 7.3,
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
    changePct: 0.55,
    signal: "매도",
    confidence: 55,
  },
];

interface AIStockListProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

const AIStockList = ({ won, pct }: AIStockListProps) => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 flex flex-col h-full">
      <div className="text-xs font-medium text-zinc-300 mb-3 px-1 shrink-0">
        AI예측 ({AI_STOCKS.length})
      </div>

      <div className="space-y-3 overflow-y-auto max-h-160 pr-1 scrollbar-thumb-amber-50">
        {AI_STOCKS.map(h => (
          <div
            key={h.code}
            className="pb-3 border-b border-[#23242a] last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="truncate">{h.name}</span>

                  {/* AI 시그널 뱃지 */}
                  {h.signal && (
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
                  )}
                </div>

                <div className="text-[11px] text-zinc-500 font-mono">
                  {h.code}
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

            {/* 보유 정보 (있을 때만 출력) */}
            {h.shares && h.avgPrice && h.pnlPct !== undefined && (
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-zinc-500">
                <span>
                  {h.shares}주・평균 {won(h.avgPrice)}
                </span>
                <span
                  className={
                    h.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  평가손익 {pct(h.pnlPct)}
                </span>
              </div>
            )}

            {/* AI 신뢰도 */}
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
