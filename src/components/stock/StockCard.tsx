import axios from "axios";
import { useEffect, useState } from "react";

interface StockDetail {
  current_price: number;
  predicted_at: string;
  signal: "매수" | "매도" | "관망";
  stock_code: string;
  stock_name: string;
}

interface StockCardProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

const InitData: StockDetail = {
  current_price: 0,
  predicted_at: "",
  signal: "관망",
  stock_code: "",
  stock_name: "",
};

const StockCard = ({ won }: StockCardProps) => {
  const [data, setData] = useState<StockDetail>(InitData);

  const getStockDetail = async () => {
    try {
      const res = await axios.get("/api/v1/stock/ai/predictions", {
        params: {
          stock_name: "삼성전자",
          limit: 1,
        },
      });
      console.log(res.data);
      const { current_price, predicted_at, signal, stock_code, stock_name } =
        res.data[0];
      setData({ current_price, predicted_at, signal, stock_code, stock_name });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStockDetail();
  }, []);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      {/* 상단 행 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold">{data.stock_name}</h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {data?.stock_code}
          </span>
          {/* <span className="text-[11px] text-zinc-400 bg-zinc-800/70 rounded px-1.5 py-0.5">
            {STOCK.sector}
          </span> */}
        </div>

        {/* AI 시그널 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-zinc-400 font-medium">AI 시그널</span>
          <span className="text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-md px-2.5 py-1">
            {data.signal}
          </span>
        </div>
      </div>

      {/* 하단 행 */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight italic">
            {won(data.current_price)}
          </span>
          {/* <span
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
          </span> */}
        </div>

        {/* 근거 */}
        <div className="flex items-center gap-1.5 bg-zinc-800/50 rounded-lg px-2.5 py-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[11px] text-zinc-400">
            RSI 과매도 + MACD 골든크로스
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
