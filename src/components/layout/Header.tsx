import { useModalStore } from "@/stores/useModalStore";
import { Activity } from "lucide-react";

const Header = () => {
  const { open } = useModalStore();
  // TODO : 종목 검색 만들기
  return (
    <header className="flex items-center justify-between bg-[#141519] border border-[#26272c] rounded-2xl px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Rich
            <span className="bg-linear-to-r from-[#7C5CFF] to-[#B794F4] bg-clip-text text-transparent">
              Club
            </span>
          </h2>
          <div className="text-[11px] text-zinc-500 leading-tight">
            AI 매매 시그널
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
        <button
          onClick={() => open()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
        >
          로그인
        </button>
      </div>
    </header>
  );
};

export default Header;
