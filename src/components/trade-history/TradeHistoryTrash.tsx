import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

import type { Step, TradeHistory } from "@/types/trade-history";
import { BADGE } from "@/constants/tradeStyles";
import { alertDanger, alertError, alertSuccess } from "@/lib/swal";
import TradeHistoryHeader from "./TradeHistoryHeader";

interface TradeHistoryTrashProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
}

interface TradeData extends TradeHistory {
  id: string;
  total_amount: number;
  traded_at: string;
}

const TradeHistoryTrash = ({ onClose, setStep }: TradeHistoryTrashProps) => {
  const [trashData, setTrashData] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTrashList = async () => {
    try {
      const res = await axios.get("/api/v1/trade-log/trash");
      setTrashData(res.data);
    } catch (error) {
      await alertError("불러오기 실패", "휴지통 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 복구
  const handleRestore = async (id: string) => {
    try {
      await axios.post(`/api/v1/trade-log/${id}/restore`);
      setTrashData(prev => prev.filter(item => item.id !== id));
      await alertSuccess("복구 완료", "기록이 매매일지로 복구되었습니다.");
    } catch (error) {
      await alertError("복구 실패", "잠시 후 다시 시도해주세요.");
    }
  };

  // 영구 삭제
  const handlePermanentDelete = async (id: string) => {
    const result = await alertDanger(
      "영구 삭제하시겠어요?",
      "삭제된 기록은 복구할 수 없습니다.",
      "영구 삭제",
    );

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/v1/trade-log/${id}/permanent`);
      setTrashData(prev => prev.filter(item => item.id !== id));
      await alertSuccess("삭제 완료", "기록이 영구 삭제되었습니다.");
    } catch (error) {
      await alertError("삭제 실패", "잠시 후 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    getTrashList();
  }, []);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* 상단 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">
            {isLoading ? "불러오는 중..." : `총 ${trashData.length}건`}
          </span>
          <button
            onClick={() => setStep("list")}
            className="text-xs text-zinc-400 border border-white/15 rounded-md px-2.5 py-1.5 hover:bg-white/7 transition-colors"
          >
            목록으로
          </button>
        </div>

        {/* 안내 배지 */}
        <div className="flex items-center gap-1.5 text-xs text-red-400/80 bg-red-400/8 border border-red-400/15 rounded-lg px-3 py-2 mb-3">
          <span>휴지통의 기록은 복구하거나 영구 삭제할 수 있습니다.</span>
        </div>

        {/* 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
            불러오는 중...
          </div>
        ) : trashData.length === 0 ? (
          <div className="text-center text-zinc-600 text-sm py-10">
            휴지통이 비어있습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {trashData.map(e => (
              <div
                key={e.id}
                className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 hover:border-white/16 transition-colors opacity-70"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${BADGE[e.trade_type]}`}
                    >
                      {e.trade_type}
                    </span>
                    <span className="text-sm font-medium text-zinc-200">
                      {e.stock_name}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600">
                    {dayjs(e.traded_at).format("YYYY-MM-DD")}
                  </span>
                </div>

                {(e.price > 0 || e.quantity > 0) && (
                  <p className="text-xs text-zinc-500 mb-1">
                    체결가 ₩{e.price.toLocaleString()} · {e.quantity}주
                  </p>
                )}
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {e.memo}
                </p>

                {/* 복구 + 영구삭제 버튼 */}
                <div className="flex justify-end gap-1.5 mt-2">
                  <button
                    onClick={() => handleRestore(e.id)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 border border-white/10 rounded px-2 py-1 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    복구
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(e.id)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 border border-white/10 rounded px-2 py-1 hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    영구 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistoryTrash;
