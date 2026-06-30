import { useEffect, useState } from "react";
import axios from "axios";
import { useStockStore } from "@/stores/useStockStore";

interface Trade {
  buy_date: string;
  sell_date: string | null;
  buy_price: number;
  sell_price: number | null;
  return_pct: number | null;
  unrealized_pct: number | null;
  is_holding: boolean;
  signal: "B" | "S";
}

interface WinrateSummary {
  avg_return_pct: number;
  cumulative_return_pct: number;
  hold_days: number;
  lose_count: number;
  max_loss_pct: number;
  max_return_pct: number;
  signal: string;
  total_signals: number;
  unrealized_pct: number | null;
  win_count: number;
  win_rate: number;
}

interface WinrateResult {
  stock_code?: string;
  stock_name?: string;
  period?: string;
  updated_at?: string;
  trades?: Trade[];
  results?: WinrateSummary[];
}

type TestMode = "ai" | "simple" | "indicator" | "combined";
type Period = "1m" | "3m" | "6m" | "all";

const MODE_CONFIG: Record<
  TestMode,
  { label: string; desc: string; endpoint: string }
> = {
  ai: {
    label: "AI",
    desc: "매수: AI 매수 신호 + MA60 상승 중 / 매도: AI 매도 신호 (침체구간 제외)",
    endpoint: "/api/v1/market/winrate",
  },
  simple: {
    label: "5일선",
    desc: "매수: AI 매수 신호 + MA60 하락 구간 제외 / 매도: 5일선 꺾임",
    endpoint: "/api/v1/market/winrate/simple",
  },
  combined: {
    label: "AI+지표",
    desc: "매수: AI+정배열(ma5>ma20>ma60) + MA60 상승 중 / 매도: AI 매도 or 역배열",
    endpoint: "/api/v1/market/winrate/combined",
  },
  indicator: {
    label: "지표",
    desc: "매수: MA 정배열+MA60 상승 중 / 매도: MA 역배열",
    endpoint: "/api/v1/market/winrate/indicator",
  },
};

const PERIODS: Period[] = ["1m", "3m", "6m", "all"];

const toApiDate = (yymmdd: string): string => {
  if (yymmdd.length !== 6) return "";
  const yy = yymmdd.slice(0, 2);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const year = parseInt(yy) <= 30 ? `20${yy}` : `19${yy}`;
  return `${year}-${mm}-${dd}`;
};

const WinrateTest = () => {
  const [mode, setMode] = useState<TestMode>("ai");
  const [period, setPeriod] = useState<Period>("3m");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<WinrateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [investment, setInvestment] = useState("1000000");

  const { selectedStock, selectedModel } = useStockStore();
  const { stock_code, stock_name } = selectedStock;

  // GET /api/v1/market/winrate — AI 승률 테스트 (침체구간 제외)
  // GET /api/v1/market/winrate/simple — 단순 승률 테스트 (AI 매수 + 5일선 매도)
  // GET /api/v1/market/winrate/indicator — 지표만 승률 테스트 (AI 신호 무시)
  // GET /api/v1/market/winrate/combined — AI+지표 동시 매수 승률 테스트
  const fetchWinrate = async (customStart?: string, customEnd?: string) => {
    if (!stock_code) return;
    setLoading(true);
    setResult(null);
    try {
      const params = {
        stock_code,
        period, // "1m" | "3m" | "6m" | "all" 그대로 전송
        hold_days: 5, // number로
        ...(customStart && { start_date: customStart }),
        ...(customEnd && { end_date: customEnd }),
        ...(mode !== "indicator" && { model_id: selectedModel }),
      };

      const res = await axios.get(MODE_CONFIG[mode].endpoint, { params });
      setResult(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stock_code) fetchWinrate();
  }, [stock_code, mode, period, selectedModel]);

  const handleDateSearch = () => {
    const sd = toApiDate(startDate);
    const ed = toApiDate(endDate);
    fetchWinrate(sd || undefined, ed || undefined);
    setStartDate("");
    setEndDate("");
  };

  const summary = result?.results?.[0];
  const cumReturn = summary?.cumulative_return_pct ?? 0;
  const isCumGood = cumReturn >= 0;

  const investmentNum = parseInt(investment.replace(/,/g, "")) || 0;
  const finalAmount = summary
    ? Math.round(investmentNum * (1 + cumReturn / 100))
    : 0;
  const profit = finalAmount - investmentNum;
  const isProfit = profit >= 0;

  const formatWon = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 100000000) return `${(n / 100000000).toFixed(0)}억원`;
    if (abs >= 10000) return `${(n / 10000).toFixed(0)}만원`;
    return `${n.toLocaleString()}원`;
  };

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 flex flex-col gap-3">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-white">
            AI 매매 시뮬레이터
          </span>
          {stock_name && (
            <span className="text-[11px] text-zinc-500">
              — {stock_name} {stock_code}
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-600 mt-0.5 leading-relaxed">
          {MODE_CONFIG[mode].desc}
        </p>
      </div>

      {/* 모드 탭 */}
      <div className="flex gap-1 bg-[#0f1013] p-1 rounded-lg">
        {(Object.keys(MODE_CONFIG) as TestMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-[11px] py-1.5 rounded-md transition-all duration-150 whitespace-nowrap ${
              mode === m
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            } active:scale-95`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}
      </div>

      {/* 기간 + 날짜 입력 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 text-[11px] py-1.5 rounded-md border transition-all duration-150 ${
                period === p
                  ? "border-[#7C5CFF] bg-[#7C5CFF]/10 text-[#9B7BFF]"
                  : "border-[#2a2d36] bg-[#0f1013] text-zinc-500 hover:text-white hover:border-zinc-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* 날짜 직접 입력 */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="YYMMDD"
            value={startDate}
            onChange={e =>
              setStartDate(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="flex-1 min-w-0 bg-[#0f1013] border border-[#2a2d36] rounded-lg px-2 py-1.5
                       text-[11px] text-white placeholder-zinc-700 text-center
                       focus:outline-none focus:border-[#7C5CFF] transition-colors"
          />
          <span className="text-zinc-600 text-[11px] shrink-0">~</span>
          <input
            type="text"
            placeholder="YYMMDD"
            value={endDate}
            onChange={e =>
              setEndDate(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="flex-1 min-w-0 bg-[#0f1013] border border-[#2a2d36] rounded-lg px-2 py-1.5
                       text-[11px] text-white placeholder-zinc-700 text-center
                       focus:outline-none focus:border-[#7C5CFF] transition-colors"
          />
          <button
            onClick={handleDateSearch}
            disabled={loading}
            className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white
                       bg-[#7C5CFF] hover:bg-[#6a4de0] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            조회
          </button>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col gap-3">
          {/* 거래 내역 skeleton */}
          <div className="flex flex-col gap-2">
            <div className="w-12 h-3 bg-[#23242a] rounded animate-pulse" />
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex justify-between py-2 border-b border-[#23242a]"
              >
                <div className="flex gap-2 items-center">
                  <div className="w-4 h-3 bg-[#23242a] rounded animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <div className="w-20 h-2.5 bg-[#23242a] rounded animate-pulse" />
                    <div className="w-20 h-2.5 bg-[#23242a] rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-14 h-3 bg-[#23242a] rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* 누적 요약 skeleton */}
          <div className="bg-[#0f1013] border border-[#23242a] rounded-xl px-3 py-3 flex flex-col gap-2">
            <div className="w-16 h-2.5 bg-[#23242a] rounded animate-pulse" />
            <div className="w-24 h-7 bg-[#23242a] rounded animate-pulse" />
            <div className="w-40 h-2.5 bg-[#23242a] rounded animate-pulse" />
          </div>
          {/* 시뮬레이터 skeleton */}
          <div className="flex flex-col gap-2">
            <div className="w-28 h-2.5 bg-[#23242a] rounded animate-pulse" />
            <div className="w-full h-9 bg-[#23242a] rounded-lg animate-pulse" />
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="flex-1 h-7 bg-[#23242a] rounded-md animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-14 bg-[#23242a] rounded-xl animate-pulse" />
              <div className="h-14 bg-[#23242a] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 결과 */}
      {!loading && result && (
        <>
          {/* 거래 내역 */}
          <div className="flex flex-col gap-0">
            <div className="text-[11px] text-zinc-500 mb-1.5">거래 내역</div>
            <div className="flex flex-col h-36 overflow-y-auto">
              {result.trades?.length ? (
                result.trades.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-[#23242a] last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold w-4 ${t.signal === "B" ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {t.signal}
                      </span>
                      <div className="text-[10px] text-zinc-400 leading-relaxed">
                        <div>{t.buy_date}</div>
                        {t.sell_date && <div>~ S {t.sell_date}</div>}
                        {t.is_holding && (
                          <div className="text-zinc-600">보유중</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {t.return_pct !== null ? (
                        <span
                          className={`text-[12px] font-semibold tabular-nums ${t.return_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {t.return_pct >= 0 ? "+" : ""}
                          {t.return_pct.toFixed(2)}%
                        </span>
                      ) : t.unrealized_pct !== null ? (
                        <div className="text-right">
                          <div
                            className={`text-[12px] font-semibold tabular-nums ${t.unrealized_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                          >
                            {t.unrealized_pct >= 0 ? "+" : ""}
                            {t.unrealized_pct.toFixed(2)}%
                          </div>
                          <div className="text-[10px] text-zinc-600">
                            보유중 · 미실현
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-600">
                            보유중
                          </div>
                          <div className="text-[10px] text-zinc-700">
                            미실현
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[12px] text-zinc-600">
                  거래 내역이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 누적 요약 */}
          <div className="bg-[#0f1013] border border-[#23242a] rounded-xl px-3 py-3">
            <div className="text-[10px] text-zinc-600 mb-1">
              정산 {summary?.total_signals ?? 0}건 누적
            </div>
            <div
              className={`text-2xl font-bold tabular-nums ${isCumGood ? "text-emerald-400" : "text-rose-400"}`}
            >
              {isCumGood ? "+" : ""}
              {cumReturn.toFixed(2)}%
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">
              {summary?.win_count ?? 0}승 {summary?.lose_count ?? 0}패
              &nbsp;·&nbsp; 적중률 {(summary?.win_rate ?? 0).toFixed(0)}%
              &nbsp;·&nbsp; 평균{" "}
              {(summary?.avg_return_pct ?? 0) >= 0 ? "+" : ""}
              {(summary?.avg_return_pct ?? 0).toFixed(2)}%
            </div>
          </div>

          {/* 투자 시뮬레이터 */}
          <div className="flex flex-col gap-2">
            <div className="text-[11px] text-zinc-500">
              만약 이대로 투자했다면?
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={Number(investment).toLocaleString()}
                onChange={e => setInvestment(e.target.value.replace(/,/g, ""))}
                className="flex-1 min-w-0 bg-[#0f1013] border border-[#2a2d36] rounded-lg px-3 py-2
                           text-sm text-white text-right
                           focus:outline-none focus:border-[#7C5CFF] transition-colors"
              />
              <span className="text-[11px] text-zinc-600 shrink-0">원</span>
            </div>

            {/* 빠른 선택 */}
            <div className="flex gap-1">
              {[100, 500, 1000, 5000].map(v => (
                <button
                  key={v}
                  onClick={() => setInvestment(String(v * 10000))}
                  className="flex-1 text-[10px] py-1.5 rounded-md border border-[#2a2d36]
                             bg-[#0f1013] text-zinc-500 hover:text-white hover:border-zinc-600
                             transition-all"
                >
                  {v}만
                </button>
              ))}
            </div>

            {/* 결과 */}
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <div className="bg-[#0f1013] border border-[#23242a] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-zinc-600 mb-0.5">
                  {(investmentNum / 10000).toLocaleString()}만원 투자
                </div>
                <div
                  className={`text-sm font-semibold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {isProfit ? "+" : ""}
                  {formatWon(profit)}
                </div>
              </div>
              <div className="bg-[#0f1013] border border-[#23242a] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-zinc-600 mb-0.5">최종금액</div>
                <div
                  className={`text-sm font-semibold ${isProfit ? "text-white" : "text-rose-400"}`}
                >
                  {formatWon(finalAmount)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 종목 미선택 */}
      {!loading && !result && !stock_code && (
        <div className="py-6 text-center text-[12px] text-zinc-600">
          종목을 선택하면 자동으로 분석합니다
        </div>
      )}
    </div>
  );
};

export default WinrateTest;
