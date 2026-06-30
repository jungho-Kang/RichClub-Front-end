import axios from "axios";
import { useEffect, useState } from "react";
import { Star, TrendingDown, TrendingUp } from "lucide-react";

import type { TradeType } from "@/types/trade-history";
import { useStockStore } from "@/stores/useStockStore";

import { BADGE } from "@/constants/tradeStyles";
import { useWatchlistStore } from "@/stores/useWatchlistStore";

interface StockDetail {
  current_price: number;
  predicted_at: string;
  signal: TradeType;
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

// 지표 가중치
const featureWeights: Record<Feature, number> = {
  MACD: 100,
  "종가/60일선 비율": 90,
  "20/60일선 비율": 80,
  "5/20일선 비율": 70,
  RSI: 60,
  "스토캐스틱 K": 50,
  "스토캐스틱 D": 40,
};

const StockCard = ({ won, pct }: StockCardProps) => {
  const [data, setData] = useState<StockDetail>(InitData);
  const [featureImportance, setFeatureImportance] = useState<
    FeatureImportance[]
  >([]);
  const [watchLoading, setWatchLoading] = useState(false);

  const { isWatched, removeWatch, addWatch, getWatchlist } =
    useWatchlistStore();
  const { selectedStock, selectedModel, setSelectedModel, models, setModels } =
    useStockStore();

  // 모델 목록 조회
  const getModels = async () => {
    try {
      const res = await axios.get("/api/v1/models");
      const data = res.data;
      setModels(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getStockDetail = async () => {
    try {
      const res = await axios.get("/api/v1/stock/ai/predictions", {
        params: {
          stock_name: selectedStock.stock_name,
          model_id: selectedModel,
        },
      });
      console.log(res.data);
      setData(res.data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getSignalDetail = async () => {
    try {
      const res = await axios.get(
        `/api/v1/stock/ai/detail/${selectedStock.stock_code}`,
        {
          params: {
            model_id: selectedModel,
          },
        },
      );
      setFeatureImportance(res.data.feature_importance);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getModels();
  }, []);

  useEffect(() => {
    getStockDetail();
    getSignalDetail();
    getWatchlist();
  }, [selectedStock, selectedModel]);

  const toggleWatch = async () => {
    if (watchLoading || !data.stock_code) return;
    setWatchLoading(true);
    try {
      if (isWatched(data.stock_code)) {
        await removeWatch(data.stock_code);
      } else {
        await addWatch(data.stock_code, data.stock_name);
      }
    } finally {
      setWatchLoading(false);
    }
  };

  // signal 분석 근거 Text
  const getFeatureText = (
    feature: Feature,
    value: number,
    direction: string,
  ) => {
    switch (feature) {
      case "MACD":
        return direction === "positive"
          ? "MACD 상승 추세 확인"
          : "MACD 하락 추세 확인";

      case "종가/60일선 비율":
        if (value >= 1.2) {
          return "장기 추세 강세 유지";
        }
        if (value >= 1) {
          return "장기 추세 우상향";
        }
        return "장기 추세 약세";

      case "20/60일선 비율":
        return value >= 1 ? "중장기 정배열 형성" : "중장기 역배열 형성";

      case "5/20일선 비율":
        return value >= 1 ? "단기 상승 흐름 우세" : "단기 하락 흐름 우세";

      case "RSI":
        if (value >= 70) {
          return "RSI 과매수 구간";
        }
        if (value <= 30) {
          return "RSI 과매도 구간";
        }
        return "RSI 중립 구간";

      case "스토캐스틱 K":
      case "스토캐스틱 D":
        if (value >= 80) {
          return "단기 과매수 신호";
        }
        if (value <= 20) {
          return "단기 과매도 신호";
        }
        return "단기 모멘텀 유지";
    }
  };

  // 최종 2개의 근거 추출
  const reasonText = [...featureImportance]
    .sort((a, b) => featureWeights[b.feature] - featureWeights[a.feature])
    .slice(0, 2)
    .map(item =>
      getFeatureText(item.feature, Number(item.value), item.direction),
    )
    .join(" · ");

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      {/* 상단 행 */}
      <div className="flex items-start justify-between mb-4">
        {/* 왼쪽: 종목명 + 코드 + 시그널 뱃지 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold">{data.stock_name}</h2>
            <span
              className={`text-xs font-bold rounded-md px-2.5 py-1 ${BADGE[data.signal]}`}
            >
              {data.signal}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {data?.stock_code}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {models.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">AI 모델</span>

              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="bg-[#0f1013] border border-[#26272c] text-zinc-300 text-xs
                           rounded-lg px-2.5 py-1.5 cursor-pointer
                           hover:border-zinc-600 focus:outline-none focus:border-zinc-500
                           transition-colors"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 즐겨찾기 버튼 */}
          <button
            onClick={toggleWatch}
            disabled={watchLoading || !data.stock_code}
            className={`p-2 rounded-xl transition-all duration-150 active:scale-90
                        disabled:opacity-30 disabled:cursor-not-allowed
                        ${
                          isWatched(data.stock_code)
                            ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20"
                            : "text-zinc-500 bg-white/5 hover:text-amber-400 hover:bg-amber-400/10"
                        }`}
            title={
              isWatched(data.stock_code) ? "관심종목 해제" : "관심종목 등록"
            }
          >
            <Star
              className="w-4 h-4"
              fill={isWatched(data.stock_code) ? "currentColor" : "none"}
            />
          </button>
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
        {reasonText && (
          <div className="flex items-center gap-1.5 bg-zinc-800/50 rounded-lg px-2.5 py-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] text-zinc-400">{reasonText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
