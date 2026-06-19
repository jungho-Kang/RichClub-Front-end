import CustomTooltip from "@/components/ui/CustomTooltip";
import type { PricePoint } from "@/types/stock";
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MACDChartProps {
  data: PricePoint[];
  last: PricePoint;
}

const MACDChart = ({ data, last }: MACDChartProps) => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">MACD (12, 26, 9)</h3>
        <span className="text-sm font-semibold text-zinc-200">
          {last.macd.toFixed(2)}
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
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
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="histogram" name="히스토그램" radius={[1, 1, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.histogram >= 0 ? "#10b981" : "#f43f5e"} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="macd"
              name="MACD"
              stroke="#e4e4e7"
              strokeWidth={1.25}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MACDChart;
