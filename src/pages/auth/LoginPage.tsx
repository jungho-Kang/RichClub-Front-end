import ForgotPassword from "@/components/auth/ForgotPassword";
import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";
import { useState } from "react";

function LoginPage() {
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

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
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <h1 className="text-[22px] font-bold tracking-tight text-white">
              Rich
              <span className="bg-linear-to-r from-[#7C5CFF] to-[#B794F4] bg-clip-text text-transparent">
                Club
              </span>
            </h1>
          </div>

          <p className="text-center text-[13px] text-gray-500 mb-7">
            오늘의 시장이 기다리고 있습니다
          </p>

          <main>
            <Login onForgotPassword={() => setIsForgotOpen(true)} />
          </main>

          <p className="mt-6 text-center text-[13px] text-gray-600">
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => setIsSignUpOpen(true)}
              className="text-[#9B7BFF] underline underline-offset-2
                         hover:text-[#B794F4] transition-colors duration-200
                         focus-visible:outline-none focus-visible:rounded-sm
                         focus-visible:ring-2 focus-visible:ring-[#7C5CFF] cursor-pointer"
            >
              회원가입
            </button>
          </p>
        </div>
      </div>

      <ForgotPassword
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />
      <SignUp isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </div>
  );
}

export default LoginPage;
