import type { Holding } from "@/types/performance";

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

function signedPct(v: number, digits = 2): string {
  return `${v > 0 ? "+" : ""}${Number(v).toFixed(digits)}%`;
}

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

export default HoldingGrid;
