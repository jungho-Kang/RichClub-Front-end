import axios from "axios";
import dayjs from "dayjs";
import { Pencil, Plus, Trash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BADGE } from "@/constants/tradeStyles";
import { alertDanger, alertError, alertSuccess } from "@/lib/swal";
import type { Step, TradeData } from "@/types/trade-history";
import TradeHistoryHeader from "./TradeHistoryHeader";

interface TradeHistoryListProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  setSelectedLog: React.Dispatch<React.SetStateAction<TradeData | null>>; // 변경
}

const TradeHistoryList = ({
  onClose,
  setStep,
  setSelectedLog,
}: TradeHistoryListProps) => {
  const [tradeData, setTradeData] = useState<TradeData[]>([]);

  const getTradeHistory = async () => {
    try {
      const res = await axios.get("/api/v1/trade-log");
      setTradeData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTradeHistory = async (id: string) => {
    return axios.delete(`/api/v1/trade-log/${id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await alertDanger(
      "삭제하시겠어요?",
      "삭제된 기록은 휴지통으로 이동됩니다.",
      "삭제",
    );

    if (!result.isConfirmed) return;

    try {
      await deleteTradeHistory(id);
      setTradeData(prev => prev.filter(item => item.id !== id));
      await alertSuccess("삭제 완료", "기록이 휴지통으로 이동되었습니다.");
    } catch (error) {
      await alertError("삭제 실패", "잠시 후 다시 시도해주세요.");
    }
  };

  // 수정 버튼 클릭 시 TradeData 저장 후 edit step으로 이동
  const handleEdit = (item: TradeData) => {
    setSelectedLog(item);
    setStep("edit");
  };

  useEffect(() => {
    getTradeHistory();
  }, []);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">
            총 {tradeData.length}건의 기록
          </span>

          <div className="flex items-center gap-2">
            {/* 휴지통 이동 버튼 추가 */}
            <button
              onClick={() => setStep("trash")}
              className="flex items-center gap-1.5 text-xs text-zinc-500 border border-white/18 rounded-md px-2.5 py-1.5 hover:bg-white/7 hover:text-zinc-300 transition-colors"
            >
              <Trash className="w-3.5 h-3.5" />
              휴지통
            </button>

            <button
              onClick={() => setStep("form")}
              className="flex items-center gap-1.5 text-xs text-zinc-300 border border-white/18 rounded-md px-2.5 py-1.5 hover:bg-white/7 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />새 기록
            </button>
          </div>
        </div>

        {tradeData.length === 0 ? (
          <div className="text-center text-zinc-600 text-sm py-10">
            기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {tradeData.map(e => (
              <div
                key={e.id}
                className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 hover:border-white/16 transition-colors cursor-pointer"
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

                {/* 수정 + 삭제 버튼 */}
                <div className="flex justify-end gap-1.5 mt-2">
                  <button
                    onClick={() => handleEdit(e)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 border border-white/10 rounded px-2 py-1 hover:text-blue-400 hover:border-blue-400/30 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 border border-white/10 rounded px-2 py-1 hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
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

export default TradeHistoryList;
