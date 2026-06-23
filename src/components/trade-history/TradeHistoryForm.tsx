import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Step, TradeHistory, TradeType } from "@/types/trade-history";
import TradeHistoryHeader from "./TradeHistoryHeader";
import { BADGE } from "@/constants/tradeStyles";
import axios from "axios";
import Swal from "sweetalert2";

interface Stock {
  stock_code: string;
  stock_name: string;
}

interface TradeHistoryFormProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
}

const TRADE_TYPES: TradeType[] = ["매수", "매도", "관망"];

const InitData = [
  {
    stock_code: "005930",
    stock_name: "삼성전자",
  },
];

const TradeHistoryForm = ({ onClose, setStep }: TradeHistoryFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>(InitData);

  const { register, setValue, watch, handleSubmit, reset } =
    useForm<TradeHistory>({
      defaultValues: {
        stock_code: stocks[0].stock_code,
        stock_name: stocks[0].stock_name,
        trade_type: "매수",
        price: 0,
        quantity: 0,
        memo: "",
      },
    });

  const selectedStockName = watch("stock_name");
  const type = watch("trade_type");

  const getStocks = async () => {
    try {
      const res = await axios.get("/api/v1/stock/list");
      const sorted = [...res.data].sort((a, b) =>
        a.stock_name.localeCompare(b.stock_name),
      );
      setStocks(sorted);
    } catch (error) {
      console.log(error);
    }
  };

  const postTradeHistory = async (data: TradeHistory) => {
    try {
      await axios.post("/api/v1/trade-log", data);
      await Swal.fire({
        title: "저장 완료",
        text: "매매일지가 저장되었습니다.",
        icon: "success",
        background: "#101319",
        color: "#fff",
        confirmButtonColor: "#6F4CDB",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data: TradeHistory) => {
    postTradeHistory(data);

    reset({
      stock_code: stocks[0].stock_code,
      stock_name: stocks[0].stock_name,
      trade_type: "매수",
      price: 0,
      quantity: 0,
      memo: "",
    });

    setStep("list");
  };

  useEffect(() => {
    getStocks();
  }, []);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* 종목 */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">종목</label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-300 hover:bg-white/10 transition-colors"
              >
                <span>{selectedStockName}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-[#141519] border border-white/12 rounded-lg shadow-lg">
                  {stocks.map(stock => (
                    <button
                      type="button"
                      key={stock.stock_name}
                      onClick={() => {
                        setValue("stock_code", stock.stock_code);
                        setValue("stock_name", stock.stock_name);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors"
                    >
                      {`${stock.stock_name}(${stock.stock_code})`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 매매 구분 */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              매매 구분
            </label>

            <div className="flex gap-4 overflow-hidden">
              {TRADE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("trade_type", t)}
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

          {/* 가격 / 수량 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1.5">
                체결가 (₩)
              </label>
              <input
                type="number"
                {...register("price")}
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
                {...register("quantity")}
                placeholder="0"
                className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              매매 근거 / 메모
            </label>

            <textarea
              rows={3}
              {...register("memo")}
              placeholder="예: RSI 과매도 + MACD 골든크로스 확인 후 분할 매수"
              className="w-full px-3 py-2 bg-white/5 border border-white/12 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={() => {
              reset();
              setStep("list");
            }}
            className="flex-1 py-2 text-sm text-zinc-400 border border-white/15 rounded-lg hover:bg-white/5 transition-colors"
          >
            취소
          </button>

          <button
            type="submit"
            className="flex-1 py-2 text-sm font-medium text-zinc-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/16 transition-colors"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeHistoryForm;
