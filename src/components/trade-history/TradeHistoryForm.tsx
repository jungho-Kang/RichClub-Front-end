import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Step, TradeType } from "@/types/trade-history";

import TradeHistoryHeader from "./TradeHistoryHeader";

interface Stock {
  name: string;
}

interface TradeHistoryFormProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
}

// 주식명
const STOCKS: Stock[] = [
  { name: "삼성전자" },
  { name: "SK하이닉스" },
  { name: "LG에너지솔루션" },
  { name: "현대차" },
  { name: "NAVER" },
  { name: "카카오" },
  { name: "셀트리온" },
  { name: "한화에어로스페이스" },
  { name: "KB금융" },
];

const TRADE_TYPES: TradeType[] = ["매수", "매도", "관망"];

const BADGE: Record<TradeType, string> = {
  매수: "bg-green-500/20 text-green-400",
  매도: "bg-red-500/20 text-red-400",
  관망: "bg-zinc-500/20 text-zinc-400",
};

const TradeHistoryForm = ({ onClose, setStep }: TradeHistoryFormProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(STOCKS[0]);
  const [type, setType] = useState<TradeType>("매수");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [memo, setMemo] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">종목</label>
          <div className="relative">
            {/* 선택된 값 */}
            <button
              onClick={() => setIsOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors"
            >
              <span>{selectedStock?.name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 드롭다운 */}
            {isOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-[#141519] border border-white/12 rounded-lg shadow-lg">
                {STOCKS.map(stock => (
                  <button
                    onClick={() => {
                      setSelectedStock(stock);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                  >
                    {stock.name}
                    <span className="text-zinc-500 text-xs ml-1"></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            매매 구분
          </label>
          <div className="flex gap-4 overflow-hidden">
            {TRADE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 border border-white/15 rounded-lg text-sm transition-colors ${
                  type === t
                    ? `${BADGE[t]} font-bold`
                    : "text-zinc-500 hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1.5">
              체결가 (₩)
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-400 mb-1.5">
              수량 (주)
            </label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            매매 근거 / 메모
          </label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="예: RSI 과매도 + MACD 골든크로스 확인 후 분할 매수"
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-white/8">
        <button
          onClick={() => {
            setStep("list");
            setSelectedStock(STOCKS[0]);
            setType("매수");
            setPrice("");
            setQty("");
            setMemo("");
          }}
          className="flex-1 py-2 text-sm text-zinc-400 border border-white/15 rounded-lg hover:bg-white/5 transition-colors"
        >
          취소
        </button>
        <button
          onClick={() => {}}
          className="flex-1 py-2 text-sm font-medium text-zinc-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/16 transition-colors"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default TradeHistoryForm;
