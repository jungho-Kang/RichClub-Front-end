import axios from "axios";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

import { alertError, alertSuccess } from "@/lib/swal";
import { btnPrimary, inputClass } from "@/lib/styles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "code" | "password";

const TIMER_SECONDS = 5 * 60;

const formatTime = (sec: number) => {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function ForgotPassword({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emailForm = useForm<{ email: string }>();
  const codeForm = useForm<{ code: string }>();
  const passwordForm = useForm<{
    newPassword: string;
    confirmPassword: string;
  }>();

  const {
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = passwordForm;

  const emailValue = emailForm.watch("email");
  const codeValue = codeForm.watch("code");
  const newPasswordValue = passwordForm.watch("newPassword");
  const confirmPasswordValue = passwordForm.watch("confirmPassword");

  const isPasswordMatch =
    !!confirmPasswordValue && newPasswordValue === confirmPasswordValue;
  const isPasswordMismatch =
    !!confirmPasswordValue && newPasswordValue !== confirmPasswordValue;

  // 타이머
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive]);

  // 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("email");
        setEmail("");
        setTimer(TIMER_SECONDS);
        setTimerActive(false);
        emailForm.reset();
        codeForm.reset();
        passwordForm.reset();
      }, 200);
    }
  }, [isOpen]);

  // ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const titleMap: Record<Step, string> = {
    email: "비밀번호 찾기",
    code: "비밀번호 찾기",
    password: "비밀번호 변경",
  };

  // 인증코드 발송
  const sendCode = async (email: string) => {
    try {
      await axios.post("/api/v1/auth/password/send-code", {
        email,
      });
    } catch (error) {
      await alertError("발송 실패", "가입되지 않은 이메일입니다.");
      throw error;
    }
  };

  const onSubmitEmail = emailForm.handleSubmit(async data => {
    try {
      await sendCode(data.email);
      setEmail(data.email);
      setTimer(TIMER_SECONDS);
      setTimerActive(true);
      await alertSuccess(
        "인증코드 발송 완료",
        `${data.email}로 인증코드를 전송했습니다. 메일을 확인해 주세요.`,
      );
      setStep("code");
    } catch (error) {
      console.log(error);
    }
  });

  const handleResend = async () => {
    setResending(true);
    try {
      await sendCode(email);
      setTimer(TIMER_SECONDS);
      setTimerActive(true);
      await alertSuccess("재전송 완료", "메일함을 다시 확인해 주세요.");
    } catch (error) {
      console.log(error);
    } finally {
      setResending(false);
    }
  };

  const onSubmitCode = codeForm.handleSubmit(async data => {
    try {
      // 인증코드 검증
      await axios.post("/api/v1/auth/password/verify-code", {
        email,
        code: data.code,
      });
      setTimerActive(false);
      setStep("password");
    } catch (error) {
      console.log(error);
      await alertError("인증 실패", "인증코드가 올바르지 않습니다.");
    }
  });

  const onSubmitPassword = passwordForm.handleSubmit(async data => {
    try {
      // 비밀번호 재설정
      await axios.post("/api/v1/auth/password/reset", {
        email,
        code: codeForm.getValues("code"),
        new_password: data.newPassword,
      });
      await alertSuccess(
        "비밀번호 변경 완료",
        "비밀번호가 성공적으로 변경되었습니다.",
      );
      onClose();
    } catch (error) {
      console.log(error);
      await alertError(
        "변경 실패",
        "비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.",
      );
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-90 bg-[#141519] border border-[#2a2d36]
                   rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d36]">
          <div className="w-7" />
          <span className="text-[14px] font-semibold text-white">
            {titleMap[step]}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-7 h-7 flex items-center justify-center text-gray-500
                       hover:text-white transition-colors rounded-sm cursor-pointer
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* 1단계: 이메일 */}
          {step === "email" && (
            <form onSubmit={onSubmitEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-gray-400">이메일</label>
                <input
                  type="email"
                  autoFocus
                  placeholder="example@email.com"
                  {...emailForm.register("email", { required: true })}
                  className={inputClass}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting || !emailValue}
                className={btnPrimary}
              >
                {emailForm.formState.isSubmitting
                  ? "전송 중…"
                  : "인증코드 발송"}
              </button>
            </form>
          )}

          {/* 2단계: 인증코드 */}
          {step === "code" && (
            <form onSubmit={onSubmitCode} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-gray-400">인증코드</label>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className={`text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-[#7C5CFF] rounded-sm
                                ${
                                  resending
                                    ? "text-zinc-600 cursor-not-allowed"
                                    : "text-[#9B7BFF] underline underline-offset-2 hover:text-[#B794F4] cursor-pointer"
                                }`}
                  >
                    {resending ? "재전송 중…" : "재전송"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="코드 6자리 입력"
                    {...codeForm.register("code", { required: true })}
                    disabled={timer === 0}
                    className={`${inputClass} pr-16 ${timer === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <span
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-[12px] tabular-nums
                                    ${timer === 0 ? "text-red-400" : "text-gray-500"}`}
                  >
                    ⏱ {formatTime(timer)}
                  </span>
                </div>
                {timer === 0 && (
                  <p className="text-[12px] text-red-400">
                    인증 시간이 만료되었습니다. 재전송 버튼을 눌러주세요.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={
                  codeForm.formState.isSubmitting || !codeValue || timer === 0
                }
                className={btnPrimary}
              >
                {codeForm.formState.isSubmitting ? "확인 중…" : "확인"}
              </button>
            </form>
          )}

          {/* 3단계: 비밀번호 변경 */}
          {step === "password" && (
            <form onSubmit={onSubmitPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-gray-400">새 비밀번호</label>
                <input
                  type="password"
                  autoFocus
                  placeholder="8 ~ 16자 이내 입력"
                  {...passwordForm.register("newPassword", {
                    required: true,
                    minLength: {
                      value: 8,
                      message: "비밀번호는 8자 이상 입력해주세요.",
                    },
                    maxLength: {
                      value: 16,
                      message: "비밀번호는 16자 이하로 입력해주세요.",
                    },
                  })}
                  className={`${inputClass} ${pwErrors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  autoComplete="new-password"
                />
                {pwErrors.newPassword && (
                  <p className="text-[12px] text-red-400 mt-0.5">
                    {pwErrors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] text-gray-400">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  placeholder="8 ~ 16자 이내 입력"
                  {...passwordForm.register("confirmPassword", {
                    required: true,
                  })}
                  className={`${inputClass} ${isPasswordMismatch ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                  autoComplete="new-password"
                />
                {isPasswordMismatch && (
                  <p className="text-[12px] text-red-400 mt-0.5">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={
                  pwSubmitting ||
                  !newPasswordValue ||
                  !confirmPasswordValue ||
                  !isPasswordMatch ||
                  !!pwErrors.newPassword
                }
                className={btnPrimary}
              >
                {pwSubmitting ? "처리 중…" : "변경"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
