import MAToggle from "@/components/ui/MAToggle";
import { useChartStore } from "@/stores/useChartStore";

const ChartControls = () => {
  const {
    showMA5,
    showMA20,
    showMA60,
    showIchimoku,
    toggleMA5,
    toggleMA20,
    toggleMA60,
    toggleIchimoku,
  } = useChartStore();

  return (
    <div className="flex items-center justify-end flex-wrap gap-3">
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
        <MAToggle
          label="일목균형표"
          color="#fff"
          active={showIchimoku}
          onClick={() => toggleIchimoku()}
        />
      </div>
    </div>
  );
};

export default ChartControls;
