import type { Trade } from "@/types/performance";
import { useMemo } from "react";

function returnColor(v: number | null | undefined): string {
  if (v == null) return "text-gray-500";
  if (v > 0) return "text-emerald-400";
  if (v < 0) return "text-red-400";
  return "text-gray-400";
}

function signedPct(v: number, digits = 2): string {
  return `${v > 0 ? "+" : ""}${Number(v).toFixed(digits)}%`;
}

const TradesTable = ({ trades }: { trades: Trade[] }) => {
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      // 매도일이 없으면(보유중) 가장 최근으로 취급해 맨 위로
      const aTime = a.sell_date ? new Date(a.sell_date).getTime() : Infinity;
      const bTime = b.sell_date ? new Date(b.sell_date).getTime() : Infinity;
      return bTime - aTime;
    });
  }, [trades]);

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
              "보유 현금",
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
          {sortedTrades.map((t, i) => {
            return (
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
                <td className="px-3 py-2.5 text-gray-400">
                  {t.cash_after?.toLocaleString() ?? "—"}
                </td>
                <td
                  className={`px-3 py-2.5 font-semibold ${returnColor(t.return_pct)}`}
                >
                  {t.return_pct != null ? signedPct(t.return_pct) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradesTable;
