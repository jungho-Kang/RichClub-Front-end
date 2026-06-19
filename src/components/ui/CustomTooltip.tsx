import type { TooltipProps } from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

type CustomTooltipProps = TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    // 차트 툴팁 (모든 차트에서 재사용 가능)
    <div className="bg-[#1b1c21] border border-[#2c2d33] rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-500 mb-1">{label}</div>

      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-zinc-400">{entry.name}</span>
          <span className="text-zinc-100 font-medium ml-auto">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString("ko-KR")
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomTooltip;
