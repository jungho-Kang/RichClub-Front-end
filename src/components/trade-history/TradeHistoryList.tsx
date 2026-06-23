import type { Step, TradeHistory } from "@/types/trade-history";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BADGE } from "@/constants/tradeStyles";
import axios from "axios";
import dayjs from "dayjs";
import TradeHistoryHeader from "./TradeHistoryHeader";
import Swal from "sweetalert2";

interface TradeHistoryListProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
}

interface TradeData extends TradeHistory {
  id: string;
  total_amount: number;
  traded_at: string;
}

const TradeHistoryList = ({ onClose, setStep }: TradeHistoryListProps) => {
  const [tradeData, setTradeData] = useState<TradeData[]>([]);

  const goToForm = () => {
    setStep("form");
  };

  const getTradeHistory = async () => {
    try {
      const res = await axios.get("/api/v1/trade-log");
      console.log(res.data);
      setTradeData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTradeHistory = async (id: string) => {
    return axios.delete(`/api/v1/trade-log/${id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "삭제하시겠어요?",
      text: "삭제된 기록은 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      background: "#101319",
      color: "#fff",
      confirmButtonColor: "#E44B58",
      cancelButtonColor: "#929292",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTradeHistory(id);

      setTradeData(prev => prev.filter(item => item.id !== id));

      await Swal.fire({
        title: "삭제 완료",
        text: "기록이 정상적으로 삭제되었습니다.",
        icon: "success",
        background: "#101319",
        color: "#fff",
        confirmButtonColor: "#6F4CDB",
      });
    } catch (error) {
      await Swal.fire({
        title: "삭제 실패",
        text: "잠시 후 다시 시도해주세요.",
        icon: "error",
        background: "#101319",
        color: "#fff",
        confirmButtonColor: "#E44B58",
      });
    }
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
          <button
            onClick={goToForm}
            className="flex items-center gap-1.5 text-xs text-zinc-300 border border-white/18 rounded-md px-2.5 py-1.5 hover:bg-white/7 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />새 기록
          </button>
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

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">
                      {dayjs(e.traded_at).format("YYYY-MM-DD")}
                    </span>
                  </div>
                </div>

                {(e.price > 0 || e.quantity > 0) && (
                  <p className="text-xs text-zinc-500 mb-1">
                    체결가 ₩{e.price.toLocaleString()} · {e.quantity}주
                  </p>
                )}
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {e.memo}
                </p>
                {/* 하단: 삭제 버튼 */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="flex items-center gap-1 text-[11px] text-zinc-500 border border-white/10 rounded px-2 py-1 hover:text-red-400 hover:border-red-400/30 transition-colors cursor-pointer"
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
