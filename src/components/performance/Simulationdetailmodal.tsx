import { useEffect } from "react";
import { useSimulationDetail } from "@/hooks/usePerformance";
import type { ModelId } from "@/types/performance";
import TradesTable from "./TradesTable";

interface SimulationDetailModalProps {
  modelId: ModelId;
  year: number;
  maxStocks: number;
  onClose: () => void;
}

const SimulationDetailModal = ({
  modelId,
  year,
  maxStocks,
  onClose,
}: SimulationDetailModalProps) => {
  const { data, loading, error } = useSimulationDetail({
    modelId,
    year,
    maxStocks,
  });

  // ESC로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">
            {year}년 매매 기록{" "}
            <span className="text-xs font-normal text-gray-500 ml-1">
              (최대 {maxStocks}종목)
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading && (
            <p className="text-center text-gray-600 text-sm py-12">
              불러오는 중...
            </p>
          )}
          {error && <p className="text-red-400 text-sm py-4">오류: {error}</p>}
          {data && !loading && (
            <>
              {data.trades.length === 0 ? (
                <p className="text-center text-gray-600 text-sm py-12">
                  해당 연도의 거래 기록이 없습니다.
                </p>
              ) : (
                <TradesTable trades={data.trades} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationDetailModal;
