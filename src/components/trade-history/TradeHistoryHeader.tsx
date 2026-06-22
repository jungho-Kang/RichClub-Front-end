import { BookOpen, XIcon } from "lucide-react";

const TradeHistoryHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <BookOpen className="w-4 h-4 text-zinc-400" />
          매매일지
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-zinc-500 px-4 py-2.5 border-b border-white/8">
        매매 판단과 그 이유를 기록해 복기에 활용하세요.
      </p>
    </>
  );
};

export default TradeHistoryHeader;
