import { PenLine } from "lucide-react";

import type { Period, PricePoint } from "@/types/stock";

import { useEffect, useMemo, useState } from "react";

import { useChartStore } from "@/stores/useChartStore";
import { useModalStore } from "@/stores/useModalStore";

import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";
import ChartControls from "@/components/chart/ChartControls";
import MACDChart from "@/components/chart/MACDChart";
import PriceChart from "@/components/chart/PriceChart";
import RSIChart from "@/components/chart/RSIChart";
import DisclosureList from "@/components/disclosure/DisclosureList";
import Header from "@/components/layout/Header";
import ReportList from "@/components/report/ReportList";
import AIStockList from "@/components/stock/AIStockList";
import PortfolioCard from "@/components/stock/PortfolioCard";
import StockCard from "@/components/stock/StockCard";
import TradeHistoryPanel from "@/components/trade-history/TradeHistoryPanel";
import Modal from "@/components/ui/Modal";

/* 데이터 생성 로직 */
// 랜덤 시드 기반 데이터 생성기 (테스트용)
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 핵심 데이터 생성 함수 (가격, MA, RSI, MACD 포함)
function buildSeries(): PricePoint[] {
  const rand = mulberry32(7);
  const n = 140;

  // --- price random walk, anchored to end at 81,072 -----------------
  const raw: number[] = [];
  let p = 64000;
  for (let i = 0; i < n; i++) {
    const drift = 0.0017 + Math.sin(i / 13) * 0.001;
    const shock = (rand() - 0.5) * 0.026;
    p = Math.max(40000, p * (1 + drift + shock));
    raw.push(p);
  }
  const scale = 81072 / raw[n - 1];
  const prices = raw.map(v => Math.round((v * scale) / 10) * 10);
  prices[n - 1] = 81072;

  // --- weekday date labels ending 2026-06-19 -------------------------
  const dates: string[] = [];
  const cursor = new Date(2026, 5, 19);
  const collected: Date[] = [];
  while (collected.length < n) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      collected.unshift(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  collected.forEach(d =>
    dates.push(
      `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
        d.getDate(),
      ).padStart(2, "0")}`,
    ),
  );

  // --- moving averages -------------------------------------------------
  const movingAvg = (idx: number, period: number) => {
    if (idx + 1 < period) return null;
    let sum = 0;
    for (let i = idx - period + 1; i <= idx; i++) sum += prices[i];
    return Math.round(sum / period);
  };

  // --- RSI(14), Wilder smoothing ---------------------------------------
  const rsis: (number | null)[] = new Array(n).fill(null);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < n; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= 14) {
      avgGain += gain / 14;
      avgLoss += loss / 14;
      if (i === 14) {
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsis[i] = 100 - 100 / (1 + rs);
      }
    } else {
      avgGain = (avgGain * 13 + gain) / 14;
      avgLoss = (avgLoss * 13 + loss) / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsis[i] = 100 - 100 / (1 + rs);
    }
  }

  // --- MACD(12,26,9) -----------------------------------------------------
  const ema = (period: number) => {
    const k = 2 / (period + 1);
    const out: number[] = new Array(n).fill(0);
    out[0] = prices[0];
    for (let i = 1; i < n; i++) out[i] = prices[i] * k + out[i - 1] * (1 - k);
    return out;
  };
  const ema12 = ema(12);
  const ema26 = ema(26);
  const macdLine = prices.map((_, i) => ema12[i] - ema26[i]);
  const kSig = 2 / 10;
  const signalLine: number[] = new Array(n).fill(0);
  signalLine[0] = macdLine[0];
  for (let i = 1; i < n; i++) {
    signalLine[i] = macdLine[i] * kSig + signalLine[i - 1] * (1 - kSig);
  }

  return prices.map((price, i) => ({
    date: dates[i],
    price,
    ma5: movingAvg(i, 5),
    ma20: movingAvg(i, 20),
    ma60: movingAvg(i, 60),
    rsi: rsis[i] !== null ? Math.round((rsis[i] as number) * 100) / 100 : null,
    macd: Math.round(macdLine[i] * 100) / 100,
    signal: Math.round(signalLine[i] * 100) / 100,
    histogram: Math.round((macdLine[i] - signalLine[i]) * 100) / 100,
  }));
}

// 전체 시계열 데이터 (mock 데이터)
const FULL_SERIES = buildSeries();

// 기간별 slicing 기준
const PERIOD_DAYS: Record<Period, number> = {
  "1개월": 22,
  "3개월": 65,
  "6개월": 140,
};

// 원화 포맷
const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;
// 퍼센트 포맷
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export default function MainPage() {
  const [isTradeHistoryOpen, setIsTradeHistoryOpen] = useState(false);
  const { close, isOpen, mode, onChangeMode } = useModalStore();
  const { period } = useChartStore();

  /* 데이터 가공 */
  // 기간별 데이터 slicing
  const data = useMemo(() => {
    const span = PERIOD_DAYS[period];
    return FULL_SERIES.slice(FULL_SERIES.length - span);
  }, [period]);

  // 현재 / 이전 가격 비교
  const last = data[data.length - 1];
  const prev = data[data.length - 2] ?? last;

  useEffect(() => {
    console.log(last);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0b] text-zinc-100 font-sans p-4 lg:p-6">
      <div className="max-w-350 mx-auto space-y-4">
        {/* Header 영역 */}
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          {/* 좌측 메인 영역 */}
          <div className="space-y-4 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
              {/* 종목 카드 */}
              <StockCard last={last} prev={prev} won={won} pct={pct} />
              {/* 포트폴리오 카드 */}
              <PortfolioCard won={won} pct={pct} />
            </div>

            {/* 기간 선택 + MA 토글 */}
            <ChartControls PERIOD_DAYS={PERIOD_DAYS} />

            {/* 가격 + 이동평균선 차트 */}
            <PriceChart data={data} />

            {/* RSI / MACD 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RSIChart data={data} last={last} />
              <MACDChart data={data} last={last} />
            </div>
          </div>

          {/* 우측 사이드바 */}
          <div className="space-y-4 min-w-0">
            {/* AI 예측 종목 리스트 */}
            <AIStockList won={won} pct={pct} />

            {/* 매매일지 버튼 */}
            <button
              onClick={() => setIsTradeHistoryOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#141519] border border-[#26272c] hover:border-zinc-600 rounded-2xl py-3 text-sm font-medium text-zinc-300 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              매매일지 작성
            </button>
          </div>
        </div>

        {/* 하단 영역 (공시 + 리포트) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 공시 리스트 */}
          <DisclosureList />
          {/* 리포트 리스트 */}
          <ReportList won={won} />
        </div>
      </div>

      <Modal
        mode={mode}
        onChangeMode={onChangeMode}
        open={isOpen}
        onClose={close}
        title="로그인 또는 회원가입으로 시작하세요"
      >
        {mode === "login" ? <Login /> : <SignUp />}
      </Modal>

      {/* 매매일지 */}
      <TradeHistoryPanel
        isOpen={isTradeHistoryOpen}
        onClose={() => setIsTradeHistoryOpen(false)}
      />
    </div>
  );
}
