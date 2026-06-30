import { PenLine } from "lucide-react";

import { useState } from "react";

import ChartControls from "@/components/chart/ChartControls";
import MACDChart from "@/components/chart/MACDChart";
import PriceChart from "@/components/chart/PriceChart";
import RSIChart from "@/components/chart/RSIChart";
import Header from "@/components/layout/Header";
import MarketIndicatorList from "@/components/market-indicator/MarketIndicatorList";
import NewsList from "@/components/news/NewsList";
import AIStockList from "@/components/stock/AIStockList";
import StockCard from "@/components/stock/StockCard";
import WinrateTest from "@/components/stock/WinrateTest";
import TradeHistoryPanel from "@/components/trade-history/TradeHistoryPanel";

// 원화 포맷
const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
// 퍼센트 포맷
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

interface MainPageProps {
  accessToken?: string;
}

export default function MainPage({ accessToken }: MainPageProps) {
  const [isTradeHistoryOpen, setIsTradeHistoryOpen] = useState(false);

  // accessToken이 없으면 화면 지우기
  if (!accessToken) return;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] text-zinc-100 font-sans p-4 lg:p-6">
      <div className="max-w-350 mx-auto space-y-4">
        {/* Header 영역 */}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          {/* 좌측 메인 영역 */}
          <div className="space-y-4 min-w-0">
            <div className="w-full">
              {/* 종목 카드 */}
              <StockCard won={won} pct={pct} />
            </div>

            {/* 기간 선택 + MA 토글 */}
            <ChartControls />

            <div className="flex flex-col gap-3">
              {/* 가격 + 이동평균선 차트 */}
              <PriceChart />
              <MACDChart />
              <RSIChart />
            </div>
          </div>

          {/* 우측 사이드바 */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* AI 예측 종목 리스트 */}
            <AIStockList won={won} pct={pct} />
            <WinrateTest />
            {/* 매매일지 버튼 */}
            <button
              onClick={() => setIsTradeHistoryOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#141519] border border-[#26272c] 
                        hover:border-zinc-600 rounded-2xl py-3 text-sm font-medium text-zinc-300 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              매매일지 작성
            </button>
          </div>
        </div>

        {/* 하단 영역 (시장지표 + 뉴스) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 시장지표 리스트 */}
          <MarketIndicatorList />
          {/* 뉴스 리스트 */}
          <NewsList />
        </div>
      </div>

      {/* 매매일지 */}
      <TradeHistoryPanel
        isOpen={isTradeHistoryOpen}
        onClose={() => setIsTradeHistoryOpen(false)}
      />
    </div>
  );
}
