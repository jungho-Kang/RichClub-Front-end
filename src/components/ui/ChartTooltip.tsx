interface ChartTooltipProps {
  title: string;

  badge?: {
    text: string | null;
    color: "green" | "red" | "orange";
  };

  items: {
    label: string;
    value: string | number;
    color?: string;
    isWarning?: boolean;
  }[];
}

const badgeStyle = {
  green: "text-green-400 border-green-400/30 bg-green-400/10",
  red: "text-red-400 border-red-400/30 bg-red-400/10",
  orange: "text-orange-500 border-orange-500/30 bg-orange-500/10",
};

export default function ChartTooltip({
  title,
  items,
  badge,
}: ChartTooltipProps) {
  return (
    <div className="min-w-40 bg-[#141519] border border-[#2c2d33] rounded-sm shadow-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between gap-1 items-center px-3 py-2 border-b border-[#2c2d33]">
        <div className="text-xs text-zinc-400">{title}</div>

        {badge && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-sm font-medium border
        ${badgeStyle[badge.color]}
      `}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* 바디 */}
      <div className="px-3 py-2 space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
              )}

              <span className="text-zinc-400 text-[11px]">{item.label}</span>
            </div>

            <span
              className={`text-[12px] font-medium ${
                item.isWarning
                  ? "text-red-500 text-[10px]"
                  : item.label === "종가"
                    ? "text-white text-[13px]"
                    : "text-zinc-200"
              }`}
            >
              {typeof item.value === "number"
                ? item.value.toLocaleString("ko-KR")
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
