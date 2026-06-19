import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "@/components/ui/CustomTooltip";
import type { PricePoint } from "@/types/stock";

export interface RSIChartProps {
  data: PricePoint[];
  last: PricePoint;
}

const RSIChart = ({ data, last }: RSIChartProps) => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">RSI (14)</h3>
        <span className="text-sm font-semibold text-zinc-200">
          {last.rsi?.toFixed(2) ?? "—"}
        </span>
      </div>
      {/* RSI */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b6d76", fontSize: 10 }}
              axisLine={{ stroke: "#26272c" }}
              tickLine={false}
              minTickGap={36}
            />
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={70} stroke="#3a3b42" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#3a3b42" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rsi"
              name="RSI"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RSIChart;
