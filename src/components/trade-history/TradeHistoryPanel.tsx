import { useState } from "react";
import type { Step } from "@/types/trade-history";

import TradeHistoryForm from "./TradeHistoryForm";
import TradeHistoryList from "./TradeHistoryList";

interface TradeHistoryPanelProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function TradeHistoryPanel({
  onClose,
  isOpen,
}: TradeHistoryPanelProps) {
  const [step, setStep] = useState<Step>("list");

  // const handleSave = () => {
  //   if (!selectedStock) return;
  //   setStep("list");
  // };

  if (!isOpen) return;

  return (
    <>
      {/* 배경 blur */}
      <div
        className="fixed inset-0 z-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-10 min-h-screen bg-zinc-900 border border-white/10 rounded-xl max-w-full flex flex-col shadow-2xl">
        {/* 매매일지 목록 */}
        {step === "list" && (
          <TradeHistoryList onClose={onClose} setStep={setStep} />
        )}

        {/* ── Step 2: 입력 폼 ── */}
        {step === "form" && (
          <TradeHistoryForm onClose={onClose} setStep={setStep} />
        )}
      </div>
    </>
  );
}
