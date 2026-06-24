const LEGEND_ITEMS = [
  { label: "전환선", color: "#dc2626", type: "line" },
  { label: "기준선", color: "#2563eb", type: "line" },
  { label: "후행스팬", color: "#fff", type: "line" },
  { label: "선행스팬1", color: "rgba(34,197,94,0.8)", type: "line" },
  { label: "선행스팬2", color: "rgba(239,68,68,0.8)", type: "line" },
] as const;

interface PriceChartLegendProps {
  showMA5: boolean;
  showMA20: boolean;
  showMA60: boolean;
  showIchimoku: boolean;
}

const PriceChartLegend = ({
  showMA5,
  showMA20,
  showMA60,
  showIchimoku,
}: PriceChartLegendProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
      {showMA5 && (
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="inline-block w-5 h-0.5 rounded-full bg-[#fbbf24]" />
          MA5
        </span>
      )}
      {showMA20 && (
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="inline-block w-5 h-0.5 rounded-full bg-[#38bdf8]" />
          MA20
        </span>
      )}
      {showMA60 && (
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="inline-block w-5 h-0.5 rounded-full bg-[#a78bfa]" />
          MA60
        </span>
      )}
      {showIchimoku &&
        LEGEND_ITEMS.map(({ label, color }) => (
          <span
            key={label}
            className="flex items-center gap-1 text-[11px] text-gray-400"
          >
            <span
              className="inline-block w-5 h-0.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
    </div>
  );
};

export default PriceChartLegend;
