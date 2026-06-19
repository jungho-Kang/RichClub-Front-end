import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import CustomTooltip from "@/components/ui/CustomTooltip";
import { useChartStore } from "@/stores/useChartStore";
import type { PricePoint } from "@/types/stock";

interface PriceChartProps {
  data: PricePoint[];
}

const PriceChart = ({ data }: PriceChartProps) => {
  const { showMA5, showMA20, showMA60 } = useChartStore();

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <h3 className="text-sm font-bold mb-4">가격・이동평균선</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid stroke="#212227" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b6d76", fontSize: 10 }}
              axisLine={{ stroke: "#26272c" }}
              tickLine={false}
              minTickGap={36}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#6b6d76", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${Math.round(v / 1000)}천`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              name="종가"
              stroke="#e4e4e7"
              strokeWidth={1.75}
              dot={false}
            />
            {showMA5 && (
              <Line
                type="monotone"
                dataKey="ma5"
                name="MA5"
                stroke="#fbbf24"
                strokeWidth={1.25}
                dot={false}
                connectNulls
              />
            )}
            {showMA20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                name="MA20"
                stroke="#38bdf8"
                strokeWidth={1.25}
                dot={false}
                connectNulls
              />
            )}
            {showMA60 && (
              <Line
                type="monotone"
                dataKey="ma60"
                name="MA60"
                stroke="#a78bfa"
                strokeWidth={1.25}
                dot={false}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
