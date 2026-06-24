import axios from "axios";
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { BADGE } from "@/constants/tradeStyles";
import { useStockStore } from "@/stores/useStockStore";

interface StockDetail {
  current_price: number;
  predicted_at: string;
  signal: "매수" | "매도" | "관망";
  stock_code: string;
  stock_name: string;
  change_pct: number;

  confidence?: number;
  signal_label?: number;
}

interface StockCardProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}
type Feature =
  | "RSI"
  | "MACD"
  | "스토캐스틱 K"
  | "스토캐스틱 D"
  | "5/20일선 비율"
  | "20/60일선 비율"
  | "종가/60일선 비율";

interface FeatureImportance {
  direction: string;
  feature: Feature;
  importance?: string | null;
  value: string;
}

const InitData: StockDetail = {
  current_price: 0,
  predicted_at: "",
  signal: "관망",
  stock_code: "",
  stock_name: "",
  change_pct: 0,
};

const StockCard = ({ won, pct }: StockCardProps) => {
  const [data, setData] = useState<StockDetail>(InitData);
  const [featureImportance, setFeatureImportance] = useState<
    FeatureImportance[]
  >([]);
  const { selectedStock } = useStockStore();

  const getStockDetail = async () => {
    try {
      const res = await axios.get("/api/v1/stock/ai/predictions", {
        params: {
          stock_name: selectedStock.stock_name,
        },
      });

      setData(res.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getSignalDetail = async () => {
    try {
      const res = await axios.get(
        `/api/v1/stock/ai/detail/${selectedStock.stock_code}`,
      );
      console.log(res.data.feature_importance);
      setFeatureImportance(res.data.feature_importance);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStockDetail();
    getSignalDetail();
  }, [selectedStock]);

  // ma 지표로 매수, 매도 시그널 추출
  const targetFeatures = [
    "5/20일선 비율",
    "20/60일선 비율",
    "종가/60일선 비율",
  ];

  const filtered = featureImportance.filter(item =>
    targetFeatures.includes(item.feature),
  );

  const buySignals =
    filtered.length === 3 && filtered.every(item => Number(item.value) >= 1);
  const sellSignals =
    filtered.length === 3 && filtered.every(item => Number(item.value) < 1);

  const buyText = "MA5/20/60 정배열로 상승 흐름 형성";
  const sellText = "MA5/20/60 역배열로 하락 흐름 형성";

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      {/* 상단 행 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold">{data.stock_name}</h2>
          <span className="text-[11px] text-zinc-500 font-mono">
            {data?.stock_code}
          </span>
        </div>

        {/* AI 시그널 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-zinc-400 font-medium">AI 시그널</span>
          <span
            className={`text-xs font-bold rounded-md px-2.5 py-1 ${BADGE[data.signal]}`}
          >
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
          <span
            className={`flex items-center gap-0.5 text-sm font-semibold ${
              data.change_pct >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {data.change_pct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {pct(data.change_pct)}
          </span>
        </div>

        {/* 근거 */}
        {buySignals ||
          (sellSignals && (
            <div className="flex items-center gap-1.5 bg-zinc-800/50 rounded-lg px-2.5 py-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[11px] text-zinc-400">
                {buySignals ? buyText : sellSignals ? sellText : null}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StockCard;
