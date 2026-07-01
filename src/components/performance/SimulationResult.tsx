import type { SimulationData } from "@/types/performance";
import StatCard from "./StatCard";

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

function returnColor(v: number | null | undefined): string {
  if (v == null) return "text-gray-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-gray-400";
}

function signedPct(v: number): string {
  return `${v > 0 ? "+" : ""}${fmt(v)}%`;
}

interface SimulationResultProps {
  data: SimulationData;
  onViewDetail: (year: number) => void;
}

const SimulationResult = ({ data, onViewDetail }: SimulationResultProps) => (
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
                "",
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
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onViewDetail(y.year)}
                    className="px-2.5 py-1 rounded-md text-xs border border-white/10 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default SimulationResult;
