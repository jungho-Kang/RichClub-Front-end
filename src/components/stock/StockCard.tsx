import type { PricePoint } from "@/types/stock";
import { TrendingDown, TrendingUp } from "lucide-react";

const STOCK = {
  name: "삼성전자",
  code: "005930",
  sector: "반도체",
  signal: "매수" as const,
  reason: "RSI 과매도 + MACD 골든크로스",
};

interface StockCardProps {
  last: PricePoint;
  prev: PricePoint;
  won: (n: number) => string;
  pct: (n: number) => string;
}

const StockCard = ({ last, prev, won, pct }: StockCardProps) => {
  const priceChangePct = ((last.price - prev.price) / prev.price) * 100;
  const isUp = priceChangePct >= 0;

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      {/* 상단 행 */}
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

        {/* AI 시그널 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-zinc-400 font-medium">AI 시그널</span>
          <span className="text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-md px-2.5 py-1">
            {STOCK.signal}
          </span>
        </div>
      </div>

      {/* 하단 행 */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {won(last.price)}
          </span>
          <span
            className={`flex items-center gap-0.5 text-sm font-semibold ${
              isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {pct(priceChangePct)}
          </span>
        </div>

        {/* 근거 */}
        <div className="flex items-center gap-1.5 bg-zinc-800/50 rounded-lg px-2.5 py-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[11px] text-zinc-400">{STOCK.reason}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
