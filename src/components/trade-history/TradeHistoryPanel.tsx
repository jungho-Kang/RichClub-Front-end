import { useState } from "react";
import type { Step, TradeData } from "@/types/trade-history";

import TradeHistoryForm from "./TradeHistoryForm";
import TradeHistoryList from "./TradeHistoryList";
import TradeHistoryEditForm from "./TradeHistoryEditForm";
import TradeHistoryTrash from "./TradeHistoryTrash";

interface TradeHistoryPanelProps {
  onClose: () => void;
  isOpen: boolean;
}

export default function TradeHistoryPanel({
  onClose,
  isOpen,
}: TradeHistoryPanelProps) {
  const [step, setStep] = useState<Step>("list");
  const [selectedLog, setSelectedLog] = useState<TradeData | null>(null);

  const handleClose = () => {
    onClose();
    setStep("list");
  };

  if (!isOpen) return;

  return (
    <>
      <div
        className="fixed inset-0 z-5 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed right-0 top-0 z-10 min-h-screen bg-zinc-900 border border-white/10 rounded-xl max-w-full flex flex-col shadow-2xl">
        {step === "list" && (
          <TradeHistoryList
            onClose={handleClose}
            setStep={setStep}
            setSelectedLog={setSelectedLog} // 수정할 항목 ID 전달
          />
        )}
        {step === "form" && (
          <TradeHistoryForm onClose={handleClose} setStep={setStep} />
        )}
        {step === "edit" && selectedLog && (
          <TradeHistoryEditForm
            onClose={handleClose}
            setStep={setStep}
            log={selectedLog} // PATCH에 사용
          />
        )}
        {step === "trash" && (
          <TradeHistoryTrash onClose={handleClose} setStep={setStep} />
        )}
      </div>
    </>
  );
}
