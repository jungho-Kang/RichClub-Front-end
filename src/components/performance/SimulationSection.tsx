import { useState } from "react";
import { useSimulation } from "@/hooks/usePerformance";
import type { ModelId } from "@/types/performance";
import SimulationResult from "./SimulationResult";
import SimulationDetailModal from "./Simulationdetailmodal";

const PRINCIPAL_PRESETS = [1_000_000, 5_000_000, 10_000_000, 50_000_000];

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  if (abs >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (abs >= 10_000) return `${Math.round(n / 10_000)}만원`;
  return `${n.toLocaleString()}원`;
}

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
  const [detailYear, setDetailYear] = useState<number | null>(null);

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
      {data && !loading && (
        <SimulationResult data={data} onViewDetail={y => setDetailYear(y)} />
      )}

      {detailYear != null && (
        <SimulationDetailModal
          modelId={modelId}
          year={detailYear}
          maxStocks={submitted.maxStocks}
          onClose={() => setDetailYear(null)}
        />
      )}
    </div>
  );
};

export default SimulationSection;
