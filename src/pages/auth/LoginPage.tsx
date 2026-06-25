import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";
import { useState } from "react";

type Mode = "login" | "signup";

function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");

  // TODO: 이메일 인증 기능 생기면 회원가입 폼을 모달창으로 바꾸고 API 붙이기
  // 모달창을 알파스퀘어 방식으로 적용 (Figma 참고)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0b0d12] relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-85 h-85 bg-[#6F4CDB] opacity-[0.16] blur-[100px] rounded-full -top-28 -left-20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute w-75 h-75 bg-[#B794F4] opacity-[0.10] blur-[100px] rounded-full -bottom-24 -right-16"
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#141519]/88 backdrop-blur-xl border border-[#2a2d36] rounded-2xl px-8 pt-9 pb-7">
          {/* 로고 */}
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <h1 className="text-[22px] font-bold tracking-tight text-white">
              Rich
              <span className="bg-linear-to-r from-[#7C5CFF] to-[#B794F4] bg-clip-text text-transparent">
                Club
              </span>
            </h1>
          </div>

          {/* 한 줄 멘트 */}
          <p className="text-center text-[13px] text-gray-500 mb-7">
            오늘의 시장이 기다리고 있습니다
          </p>

          {/* 로그인 폼 */}
          <main>{mode === "login" ? <Login /> : <SignUp />}</main>

          {/* 회원가입 텍스트 링크 */}
          {mode === "login" && (
            <p className="mt-6 text-center text-[13px] text-gray-600">
              계정이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-[#9B7BFF] underline underline-offset-2
                         hover:text-[#B794F4] transition-colors duration-200
                         focus-visible:outline-none focus-visible:rounded-sm
                         focus-visible:ring-2 focus-visible:ring-[#7C5CFF] cursor-pointer"
              >
                회원가입
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
