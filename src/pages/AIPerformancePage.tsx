import Header from "@/components/layout/Header";
import { usePerformance, useSimulation } from "@/hooks/usePerformance";
import type {
  CalcMode,
  Holding,
  ModelId,
  Period,
  SimulationData,
  Trade,
} from "@/types/performance";
import { useMemo, useState } from "react";

/* ── 상수 ── */
const MODELS: { id: ModelId; label: string }[] = [
  { id: "ju-model-v2", label: "ju-model-v2" },
  { id: "seo-model-v1", label: "seo-model-v1" },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "6m", label: "6m" },
  { value: "all", label: "all" },
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

const PRINCIPAL_PRESETS = [1_000_000, 5_000_000, 10_000_000, 50_000_000];

type InnerTab = "holdings" | "trades" | "sim";

/* ── 유틸 ── */
function fmt(n: number | null | undefined, digits = 2): string {
  if (n == null) return "—";
  return Number(n).toFixed(digits);
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (abs >= 10_000) return `${Math.round(n / 10_000)}만원`;
  return `${n.toLocaleString()}원`;
}

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return n.toLocaleString();
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

function calcReturn(trades: Trade[], mode: CalcMode): number {
  if (!trades.length) return 0;
  const returns = trades.map(t => t.return_pct ?? 0);
  if (mode === "sum") return returns.reduce((a, b) => a + b, 0);
  if (mode === "avg")
    return returns.reduce((a, b) => a + b, 0) / returns.length;

  return 0;
}

/* ── 서브 컴포넌트 ── */
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  valueColor?: string;
}
const StatCard = ({
  label,
  value,
  sub,
  highlight,
  valueColor,
}: StatCardProps) => (
  <div
    className={`bg-[#161616] rounded-xl p-5 flex flex-col gap-1.5 border ${highlight ? "border-emerald-500/30" : "border-white/5"}`}
  >
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-3xl font-bold ${valueColor ?? "text-white"}`}>
      {value}
    </span>
    {sub && <span className="text-xs text-gray-600">{sub}</span>}
  </div>
);

const HoldingGrid = ({ holdings }: { holdings: Holding[] }) => {
  if (!holdings.length)
    return (
      <p className="text-center text-gray-600 py-10 text-sm">
        현재 보유 종목이 없습니다.
      </p>
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
      {holdings.map((h, i) => (
        <div
          key={i}
          className="bg-[#161616] border border-white/5 rounded-lg p-4 flex flex-col gap-1.5"
        >
          <p className="text-sm font-semibold text-gray-200 truncate">
            {h.stock_name}
          </p>
          <p className="text-[10px] text-gray-600">{h.stock_code}</p>
          <p className="text-[11px] text-gray-500">
            매수 {h.buy_date} · {fmtPrice(h.buy_price)}원
          </p>
          <p className="text-[11px] text-gray-600">
            현재 {fmtPrice(h.current_price)}
          </p>
          <p
            className={`text-base font-bold mt-1 ${returnColor(h.unrealized_pct)}`}
          >
            {h.unrealized_pct != null ? signedPct(h.unrealized_pct) : "—"}
          </p>
        </div>
      ))}
    </div>
  );
};

const TradesTable = ({ trades }: { trades: Trade[] }) => {
  if (!trades.length)
    return (
      <p className="text-center text-gray-600 py-10 text-sm">
        매매 기록이 없습니다.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#111]">
            {[
              "종목",
              "종목코드",
              "매수일",
              "매도일",
              "매수가",
              "매도가",
              "수익률",
            ].map(h => (
              <th
                key={h}
                className="text-left text-xs text-gray-500 font-medium px-3 py-2.5 border-b border-white/5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr
              key={i}
              className="border-b border-white/3 hover:bg-white/2 transition-colors"
            >
              <td className="px-3 py-2.5 text-gray-300 font-medium">
                {t.stock_name}
              </td>
              <td className="px-3 py-2.5 text-gray-500 text-xs">
                {t.stock_code}
              </td>
              <td className="px-3 py-2.5 text-gray-400">{t.buy_date}</td>
              <td className="px-3 py-2.5 text-gray-400">
                {t.sell_date ?? "보유중"}
              </td>
              <td className="px-3 py-2.5 text-gray-400">
                {t.buy_price?.toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-gray-400">
                {t.sell_price?.toLocaleString() ?? "—"}
              </td>
              <td
                className={`px-3 py-2.5 font-semibold ${returnColor(t.return_pct)}`}
              >
                {t.return_pct != null ? signedPct(t.return_pct) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SimulationResult = ({ data }: { data: SimulationData }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="최종 금액" value={fmtMoney(data.total_final_amount)} />
      <StatCard
        label="총 수익"
        value={fmtMoney(data.total_profit)}
        valueColor={returnColor(data.total_profit)}
        highlight
      />
      <StatCard
        label="총 수익률"
        value={signedPct(data.total_return_pct)}
        valueColor={returnColor(data.total_return_pct)}
      />
    </div>

    {data.years.length > 0 && (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#111]">
              {[
                "연도",
                "거래",
                "승/패",
                "승률",
                "평균수익률",
                "최종금액",
                "수익",
                "수익률",
              ].map(h => (
                <th
                  key={h}
                  className="text-left text-xs text-gray-500 font-medium px-3 py-2.5 border-b border-white/5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.years.map(y => (
              <tr
                key={y.year}
                className="border-b border-white/3 hover:bg-white/2 transition-colors"
              >
                <td className="px-3 py-2.5 text-gray-300 font-medium">
                  {y.year}
                </td>
                <td className="px-3 py-2.5 text-gray-400">{y.total_trades}</td>
                <td className="px-3 py-2.5 text-gray-400">
                  {y.win_count}/{y.lose_count}
                </td>
                <td className="px-3 py-2.5 text-gray-400">
                  {fmt(y.win_rate)}%
                </td>
                <td
                  className={`px-3 py-2.5 font-semibold ${returnColor(y.avg_return_pct)}`}
                >
                  {signedPct(y.avg_return_pct)}
                </td>
                <td className="px-3 py-2.5 text-gray-300">
                  {fmtMoney(y.final_amount)}
                </td>
                <td
                  className={`px-3 py-2.5 font-semibold ${returnColor(y.profit)}`}
                >
                  {fmtMoney(y.profit)}
                </td>
                <td
                  className={`px-3 py-2.5 font-semibold ${returnColor(y.return_pct)}`}
                >
                  {signedPct(y.return_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

interface SimulationSectionProps {
  modelId: ModelId;
  year?: number | null;
}
const SimulationSection = ({ modelId, year }: SimulationSectionProps) => {
  const [principal, setPrincipal] = useState(10_000_000);
  const [maxStocks, setMaxStocks] = useState(10);
  const [submitted, setSubmitted] = useState({
    principal: 10_000_000,
    maxStocks: 10,
  });

  const { data, loading, error } = useSimulation({
    modelId,
    principal: submitted.principal,
    maxStocks: submitted.maxStocks,
    year,
  });

  return (
    <div className="mt-2 space-y-5">
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-5">
        <div className="space-y-2">
          <label className="text-xs text-gray-500">투자 원금</label>
          <div className="flex flex-wrap gap-2">
            {PRINCIPAL_PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setPrincipal(p)}
                className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                  principal === p
                    ? "bg-emerald-950 border-emerald-500 text-emerald-400"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {fmtMoney(p)}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={principal}
            onChange={e => setPrincipal(Number(e.target.value))}
            min={100_000}
            step={100_000}
            className="bg-[#0d0d0d] border border-white/10 rounded-lg text-gray-200 text-sm px-3 py-2 w-48 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">
            최대 동시 보유 종목 수
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={50}
              value={maxStocks}
              step={1}
              onChange={e => setMaxStocks(Number(e.target.value))}
              className="accent-emerald-400 w-40"
            />
            <span className="text-sm font-semibold text-emerald-400">
              {maxStocks}종목
            </span>
          </div>
        </div>

        <button
          onClick={() => setSubmitted({ principal, maxStocks })}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
        >
          시뮬레이션 실행
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-600 text-sm py-8">계산 중...</p>
      )}
      {error && <p className="text-red-400 text-sm py-4">오류: {error}</p>}
      {data && !loading && <SimulationResult data={data} />}
    </div>
  );
};

/* ── 메인 페이지 ── */
const AIPerformancePage = () => {
  const [modelId, setModelId] = useState<ModelId>("ju-model-v2");
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
    if (!data) return 0;
    if (!data.trades?.length) return 0;
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

  const calcModeLabel = CALC_MODES.find(c => c.value === calcMode)?.label ?? "";

  const innerTabs: { key: InnerTab; label: string }[] = [
    { key: "holdings", label: `현재 보유 (${data?.holdings?.length ?? 0})` },
    { key: "trades", label: `매매 기록 (${data?.trades?.length ?? 0}건)` },
    { key: "sim", label: "포트폴리오 시뮬레이션" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans">
      {/* 헤더 */}
      <div className="p-4 pb-0">
        <Header />
      </div>

      {/* 컨텐츠 */}
      <div className="p-6">
        {/* 타이틀 + 모델 탭 */}
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xl font-bold text-white">AI 실적</h2>
          <div className="flex gap-2">
            {MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`px-3 py-1 rounded-md text-xs border transition-colors ${
                  modelId === m.id
                    ? "bg-indigo-950 border-indigo-500 text-indigo-300"
                    : "bg-[#161616] border-white/10 text-gray-500 hover:border-white/20"
                }`}
              >
                {m.label}
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

          {/* 수익률 기준 — 우측 정렬 */}
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
                  className={`font-semibold w-8 shrink-0 ${calcMode === c.value ? "text-indigo-300" : "text-gray-500"}`}
                >
                  {c.label}
                </span>
                <span className="text-gray-500">{c.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* 로딩 / 에러 */}
        {loading && (
          <p className="text-center text-gray-600 text-sm py-12">
            데이터 불러오는 중...
          </p>
        )}
        {error && <p className="text-red-400 text-sm py-4">오류: {error}</p>}

        {data && !loading && (
          <>
            {/* 통계 카드 */}
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

            {/* 내부 탭 */}
            <div className="flex border-b border-white/5 mb-5">
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
            </div>

            {tab === "holdings" && (
              <HoldingGrid holdings={data.holdings ?? []} />
            )}
            {tab === "trades" && <TradesTable trades={data.trades ?? []} />}
            {tab === "sim" && (
              <SimulationSection
                modelId={modelId}
                year={yearMode ? year : null}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIPerformancePage;
