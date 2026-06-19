import type { Period } from "@/types/stock";
import MAToggle from "@/components/ui/MAToggle";
import { useChartStore } from "@/stores/useChartStore";

interface ChartControlsProps {
  PERIOD_DAYS: Record<Period, number>;
}

const ChartControls = ({ PERIOD_DAYS }: ChartControlsProps) => {
  const {
    period,
    showMA5,
    showMA20,
    showMA60,
    setPeriod,
    toggleMA5,
    toggleMA20,
    toggleMA60,
  } = useChartStore();

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* 기간 선택 */}
      <div className="flex items-center gap-1 bg-[#141519] border border-[#26272c] rounded-xl p-1">
        {(Object.keys(PERIOD_DAYS) as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-colors ${
              period === p
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* MA 토글 */}
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <MAToggle
          label="MA5"
          color="#fbbf24"
          active={showMA5}
          onClick={() => toggleMA5()}
        />
        <MAToggle
          label="MA20"
          color="#38bdf8"
          active={showMA20}
          onClick={() => toggleMA20()}
        />
        <MAToggle
          label="MA60"
          color="#a78bfa"
          active={showMA60}
          onClick={() => toggleMA60()}
        />
      </div>
    </div>
  );
};

export default ChartControls;
