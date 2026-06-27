import axios from "axios";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";

import { alertError, alertSuccess } from "@/lib/swal";
import { BADGE } from "@/constants/tradeStyles";
import type {
  Step,
  TradeData,
  TradeHistory,
  TradeType,
} from "@/types/trade-history";
import TradeHistoryHeader from "./TradeHistoryHeader";

interface Stock {
  stock_code: string;
  stock_name: string;
}

interface TradeHistoryEditFormProps {
  onClose: () => void;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  log: TradeData;
}

const TRADE_TYPES: TradeType[] = ["매수", "매도", "관망"];

const TradeHistoryEditForm = ({
  onClose,
  setStep,
  log,
}: TradeHistoryEditFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<TradeHistory>({
    defaultValues: {
      stock_code: log.stock_code,
      stock_name: log.stock_name,
      trade_type: log.trade_type,
      price: log.price,
      quantity: log.quantity,
      memo: log.memo,
    },
  });

  const selectedStockName = watch("stock_name");
  const type = watch("trade_type");

  // 종목 드롭다운 목록 조회
  const getStocks = async () => {
    try {
      const res = await axios.get("/api/v1/stock/list");
      const sorted = [...res.data].sort((a: Stock, b: Stock) =>
        a.stock_name.localeCompare(b.stock_name),
      );
      setStocks(sorted);
    } catch (error) {
      console.log(error);
    }
  };

  // 매매 기록 수정 요청
  const patchTradeHistory = async (data: TradeHistory) => {
    await axios.patch(`/api/v1/trade-log/${log.id}`, data);
  };

  // 폼 제출 성공 시
  const onSubmit = async (data: TradeHistory) => {
    try {
      await patchTradeHistory(data);
      await alertSuccess("수정 완료", "매매일지가 수정되었습니다.");
      setStep("list");
    } catch (error) {
      await alertError("수정 실패", "잠시 후 다시 시도해주세요.");
    }
  };

  // 폼 유효성 검사 실패 시
  const onError = () => {
    const messages: string[] = [];
    if (errors.price) messages.push("· " + errors.price.message);
    if (errors.quantity) messages.push("· " + errors.quantity.message);
    alertError("입력 오류", messages.join("\n") || "필수 항목을 입력해주세요.");
  };

  // 마운트 시 종목 목록 조회
  useEffect(() => {
    getStocks();
  }, []);

  return (
    <div>
      <TradeHistoryHeader onClose={onClose} />

      <form onSubmit={handleSubmit(onSubmit, onError)} className="flex-1">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* 수정 모드 안내 배지 */}
          <div className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-400/8 border border-amber-400/15 rounded-lg px-3 py-2">
            <span>기존 기록을 수정하고 있습니다.</span>
          </div>

          {/* 종목 드롭다운 */}
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
                  className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* 드롭다운 목록 */}
              {isOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-[#141519] border border-white/12 rounded-lg shadow-lg">
                  {stocks.map(stock => (
                    <button
                      type="button"
                      key={stock.stock_code}
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
            <div className="flex gap-4">
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

          {/* 체결가 / 수량 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1.5">
                체결가 (₩)
              </label>
              <input
                type="number"
                {...register("price", {
                  required: "체결가를 입력해주세요.",
                  validate: v => Number(v) > 0 || "체결가는 0보다 커야 합니다.",
                })}
                placeholder="0"
                className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.price
                    ? "border-red-500/60"
                    : "border-white/12 focus:border-white/30"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1.5">
                수량 (주)
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: "수량을 입력해주세요.",
                  validate: v => Number(v) > 0 || "수량은 0보다 커야 합니다.",
                })}
                placeholder="0"
                className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors [&::-webkit-inner-spin-button]:appearance-none ${
                  errors.quantity
                    ? "border-red-500/60"
                    : "border-white/12 focus:border-white/30"
                }`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* 매매 근거 메모 */}
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

        {/* 취소 / 수정 저장 버튼 */}
        <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-white/8">
          <button
            type="button"
            onClick={() => setStep("list")}
            className="flex-1 py-2 text-sm text-zinc-400 border border-white/15 rounded-lg hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 py-2 text-sm font-medium text-zinc-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/16 transition-colors"
          >
            수정 저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeHistoryEditForm;
