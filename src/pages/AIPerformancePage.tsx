import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { usePerformance } from "@/hooks/usePerformance";
import { useStockStore } from "@/stores/useStockStore";
import type { CalcMode, ModelId, Period } from "@/types/performance";

import StatCard from "@/components/performance/StatCard";
import HoldingGrid from "@/components/performance/HoldingGrid";
import TradesTable from "@/components/performance/TradesTable";

/* ── 상수 ── */
const PERIODS: { value: Period; label: string }[] = [
  { value: "1m", label: "1개월" },
  { value: "3m", label: "3개월" },
  { value: "6m", label: "6개월" },
  { value: "all", label: "전체" },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021] as const;

const CALC_MODES: { value: CalcMode; label: string; desc: string }[] = [
  {
    value: "sum",
    label: "합산",
    desc: "완료된 모든 거래의 수익률을 단순 합산합니다.",
  },
  { value: "avg", label: "평균", desc: "거래 1건당 평균 수익률입니다." },
];

type InnerTab = "holdings" | "trades";

/* ── 유틸 ── */
function fmt(n: number | null | undefined, digits = 2): string {
  if (n == null) return "—";
  return Number(n).toFixed(digits);
}

function returnColor(v: number | null | undefined): string {
  if (v == null) return "text-gray-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-gray-400";
}

function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${fmt(v)}%`;
}

function calcReturn(trades: any[], mode: CalcMode): number {
  if (!trades.length) return 0;
  const returns = trades.map(t => t.return_pct ?? 0);
  if (mode === "sum") return returns.reduce((a, b) => a + b, 0);
  if (mode === "avg")
    return returns.reduce((a, b) => a + b, 0) / returns.length;
  return 0;
}

/* ── 메인 페이지 ── */
const AIPerformancePage = () => {
  const { models } = useStockStore();
  const navigate = useNavigate();

  const [modelId, setModelId] = useState<ModelId>(
    models.length > 0 ? models[0].id : "ju-model-v2",
  );
  const [period, setPeriod] = useState<Period>("3m");
  const [yearMode, setYearMode] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const [calcMode, setCalcMode] = useState<CalcMode>("sum");
  const [showDesc, setShowDesc] = useState(false);
  const [tab, setTab] = useState<InnerTab>("holdings");

  const { data, loading, error } = usePerformance({
    modelId,
    period: yearMode ? undefined : period,
    year: yearMode ? year : null,
  });

  const computedReturn = useMemo(() => {
    if (!data?.trades?.length) return 0;
    return calcReturn(data.trades, calcMode);
  }, [data, calcMode]);

  const handlePeriod = (p: Period) => {
    setYearMode(false);
    setPeriod(p);
    setYear(null);
  };

  const handleYear = (y: number) => {
    setYearMode(true);
    setYear(y);
  };

  const goToSimulation = () => {
    const params = new URLSearchParams({ modelId });
    if (yearMode && year) params.set("year", String(year));
    navigate(`/performance/simulation?${params.toString()}`);
  };

  const calcModeLabel = CALC_MODES.find(c => c.value === calcMode)?.label ?? "";

  const innerTabs: { key: InnerTab; label: string }[] = [
    { key: "holdings", label: `현재 보유 (${data?.holdings?.length ?? 0})` },
    { key: "trades", label: `매매 기록 (${data?.trades?.length ?? 0}건)` },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans">
      <div className="p-4 pb-0">
        <Header />
      </div>

      <div className="p-6">
        {/* 타이틀 + 모델 탭 */}
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xl font-bold text-white">AI 실적</h2>
          <div className="flex gap-2">
            {models.map(m => (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                  modelId === m.id
                    ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 / 연도 필터 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 mr-1">기간</span>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => handlePeriod(p.value)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  !yearMode && period === p.value
                    ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/10" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-600 mr-1">연도</span>
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => handleYear(y)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  yearMode && year === y
                    ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-gray-600">수익률</span>
            {CALC_MODES.map(c => (
              <button
                key={c.value}
                onClick={() => setCalcMode(c.value)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  calcMode === c.value
                    ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={() => setShowDesc(v => !v)}
              className="text-[10px] text-gray-600 hover:text-gray-400 ml-1 transition-colors"
            >
              {showDesc ? "닫기" : "설명 보기"}
            </button>
          </div>
        </div>

        {/* 수익률 설명 */}
        {showDesc && (
          <div className="mb-4 bg-[#111] border border-white/5 rounded-xl p-4 space-y-1.5">
            {CALC_MODES.map(c => (
              <div key={c.value} className="flex gap-3 text-xs">
                <span
                  className={`font-semibold w-8 shrink-0 ${
                    calcMode === c.value ? "text-indigo-300" : "text-gray-500"
                  }`}
                >
                  {c.label}
                </span>
                <span className="text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-600 text-sm py-12">
            데이터 불러오는 중...
          </p>
        )}
        {error && <p className="text-red-400 text-sm py-4">오류: {error}</p>}

        {data && !loading && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatCard
                label="승률"
                value={`${fmt(data.win_rate)}%`}
                sub={`${data.win_count}승 ${data.lose_count}패`}
                highlight
                valueColor="text-emerald-400"
              />
              <StatCard
                label={`수익률 (${calcModeLabel})`}
                value={signedPct(computedReturn)}
                sub={`최대 +${fmt(data.max_return_pct)}% / 최대 ${fmt(data.max_loss_pct)}%`}
                valueColor={returnColor(computedReturn)}
              />
              <StatCard
                label="거래 횟수"
                value={`${data.win_count + data.lose_count}건`}
                sub={`평균 ${fmt(data.avg_return_pct)}%`}
              />
            </div>

            <div className="flex border-b border-white/5 mb-5 items-center">
              {innerTabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-5 py-2.5 text-sm border-b-2 transition-colors ${
                    tab === t.key
                      ? "border-emerald-500 text-gray-100"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={goToSimulation}
                className="ml-auto px-4 py-2 text-xs rounded-md bg-indigo-950 border border-indigo-500 text-indigo-300 hover:bg-indigo-900 transition-colors"
              >
                수익 시뮬레이션
              </button>
            </div>

            {tab === "holdings" && (
              <HoldingGrid holdings={data.holdings ?? []} />
            )}
            {tab === "trades" && <TradesTable trades={data.trades ?? []} />}
          </>
        )}
      </div>
    </div>
  );
};

export default AIPerformancePage;
