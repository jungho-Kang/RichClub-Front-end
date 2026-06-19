import type { PricePoint } from "@/types/stock";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";

// 종목 정보
const STOCK = {
  name: "삼성전자",
  code: "005930",
  sector: "반도체",
  signal: "매수" as const,
};

interface StockCardProps {
  last: PricePoint;
  prev: PricePoint;
  won: (n: number) => string;
  pct: (n: number) => string;
}

const StockCard = ({ last, prev, won, pct }: StockCardProps) => {
  // 등락률 계산
  const priceChangePct = ((last.price - prev.price) / prev.price) * 100;

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold">{STOCK.name}</h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {STOCK.code}
          </span>
          <span className="text-[11px] text-zinc-400 bg-zinc-800/70 rounded px-1.5 py-0.5">
            {STOCK.sector}
          </span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-zinc-500 mb-1">AI 시그널</div>
          <span className="text-xs font-bold bg-emerald-500/15 text-emerald-400 rounded-md px-2.5 py-1">
            {STOCK.signal}
          </span>
        </div>
      </div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {won(last.price)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-sm font-semibold ${
              priceChangePct >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {priceChangePct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {pct(priceChangePct)}
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium bg-zinc-800/70 hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          AI 예측 분석
        </button>
      </div>
    </div>
  );
};

export default StockCard;
