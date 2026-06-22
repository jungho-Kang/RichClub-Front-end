import { useModalStore } from "@/stores/useModalStore";
import { getCookie } from "@/utils/cookie";
import { Activity } from "lucide-react";
import { useEffect } from "react";

const Header = () => {
  const { open, onChangeMode } = useModalStore();
  const accessToken = getCookie("access_token");

  useEffect(() => {
    console.log("이거 데이터 나옴???????????????????????????????", accessToken);
    console.log(document.cookie);
    // test();
  }, []);

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
      <div>
        {accessToken ? (
          <div className="flex items-center gap-4">
            {/* 사용자 정보 */}
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <div className="text-xs text-zinc-200 font-medium">사용자</div>
                <div className="text-[10px] text-zinc-500">로그인 상태</div>
              </div>

              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#7C5CFF] to-[#B794F4]" />
            </div>

            {/* 버튼 */}
            <button
              onClick={() => {
                open();
                onChangeMode("login");
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-white/15 text-zinc-300 hover:bg-white/5 transition-all"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              open();
              onChangeMode("login");
            }}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 active:scale-[0.98] transition-all"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
