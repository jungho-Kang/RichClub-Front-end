import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Step, TradeType } from "@/types/trade-history";

import TradeHistoryHeader from "./TradeHistoryHeader";

interface Entry {
  id: string;
  stock: string;
  type: TradeType;
  price: number;
  qty: number;
  date: string;
  memo: string;
}

interface TradeHistoryListProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
}

const INITIAL_ENTRIES: Entry[] = [
  {
    id: "1",
    stock: "삼성전자",
    type: "매수",
    price: 68400,
    qty: 58,
    date: "2025-06-12",
    memo: "20일선 지지 확인, RSI 35 반등 시도. 1차 분할 매수.",
  },
  {
    id: "2",
    stock: "LG에너지솔루션",
    type: "관망",
    price: 372000,
    qty: 0,
    date: "2025-06-15",
    memo: "데드크로스 우려로 추가 매수 보류. 추세 확인 후 대응.",
  },
];

const BADGE: Record<TradeType, string> = {
  매수: "bg-green-500/20 text-green-400",
  매도: "bg-red-500/20 text-red-400",
  관망: "bg-zinc-500/20 text-zinc-400",
};

const TradeHistoryList = ({ onClose, setStep }: TradeHistoryListProps) => {
  const goToForm = () => {
    setStep("form");
  };

  const [entries, setEntries] = useState<Entry[]>(INITIAL_ENTRIES);

  useEffect(() => {
    setEntries(INITIAL_ENTRIES);
  }, []);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-zinc-500">
            총 {entries.length}건의 기록
          </span>
          <button
            onClick={goToForm}
            className="flex items-center gap-1.5 text-xs text-zinc-300 border border-white/18 rounded-md px-2.5 py-1.5 hover:bg-white/7 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />새 기록
          </button>
        </div>
        {entries.length === 0 ? (
          <div className="text-center text-zinc-600 text-sm py-10">
            기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map(e => (
              <div
                key={e.id}
                className="bg-white/4 border border-white/8 rounded-lg px-3 py-2.5 hover:border-white/16 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${BADGE[e.type]}`}
                    >
                      {e.type}
                    </span>
                    <span className="text-sm font-medium text-zinc-200">
                      {e.stock}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600">{e.date}</span>
                </div>
                {(e.price > 0 || e.qty > 0) && (
                  <p className="text-xs text-zinc-500 mb-1">
                    체결가 ₩{e.price.toLocaleString()} · {e.qty}주
                  </p>
                )}
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {e.memo}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistoryList;
