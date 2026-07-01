import { TELEGRAM_URL } from "@/constants/telegramUrl";
import { alertError, alertSuccess } from "@/lib/swal";
import axios from "axios";
import { useEffect, useState } from "react";

interface SubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: string;
  label: string;
  desc: string;
  monthlyPrice: number;
  features: string[];
  unavailable?: string[];
  badge?: { text: string; color: string };
  highlight?: string;
}

const PLANS: Plan[] = [
  {
    id: "basic-plan",
    label: "Demo",
    desc: "기본 기능 이용",
    monthlyPrice: 19900,
    features: [
      "글로벌 시장 현황",
      "차트 (일봉/5분봉)",
      "네이버 뉴스 검색",
      "매매일지",
      "관심종목",
      "골든보/침체구간 신호",
    ],
    unavailable: ["AI 예측 신호", "지표 예측 (today-signals)", "텔레그램 알림"],
  },
  {
    id: "ju-model",
    label: "Basic",
    desc: "ju-model-v2",
    monthlyPrice: 49900,
    features: [
      "글로벌 시장 현황",
      "차트 (일봉/5분봉)",
      "네이버 뉴스 검색",
      "매매일지",
      "AI 예측 신호 (ju-model-v2)",
      "지표 예측 (today-signals)",
      "관심종목",
      "골든보/침체구간 신호",
    ],
    unavailable: ["텔레그램 알림"],
    highlight: "#22c55e",
  },
  {
    id: "seo-model",
    label: "Pro",
    desc: "ju-model-v2 + seo-model-v1",
    monthlyPrice: 149900,
    features: [
      "글로벌 시장 현황",
      "차트 (일봉/5분봉)",
      "네이버 뉴스 검색",
      "매매일지",
      "AI 예측 신호 (ju-model-v2)",
      "AI 예측 신호 (seo-model-v1)",
      "지표 예측 (today-signals)",
      "관심종목",
      "골든보/침체구간 신호",
      "텔레그램 알림",
    ],
    badge: { text: "강력", color: "#a855f7" },
    highlight: "#7C5CFF",
  },
  {
    id: "auto-trade",
    label: "Max (자동매매)",
    desc: "ju-model-v2 + seo-model-v1\n키움 / 한국투자증권 API 연동",
    monthlyPrice: 249000,
    features: [
      "글로벌 시장 현황",
      "차트 (일봉/5분봉)",
      "네이버 뉴스 검색",
      "매매일지",
      "AI 예측 신호 (ju-model-v2)",
      "AI 예측 신호 (seo-model-v1)",
      "지표 예측 (today-signals)",
      "관심종목",
      "골든보/침체구간 신호",
      "텔레그램 알림",
      "키움증권 / 한국투자증권 자동매매",
      "신규 모델 즉시 체험",
    ],
    badge: { text: "NEW", color: "#f97316" },
    highlight: "#f97316",
  },
  {
    id: "telegram",
    label: "텔레그램",
    desc: "채널 단독 구독",
    monthlyPrice: 79900,
    features: [
      "텔레그램 알림 채널 구독",
      "AI 매수/매도 신호 알림",
      "프로그램 접근",
    ],
    unavailable: ["차트 / 지표 분석", "매매일지"],
    badge: { text: "추천", color: "#06b6d4" },
    highlight: "#06b6d4",
  },
];

const BADGE_GRADIENTS: Record<string, { from: string; to: string }> = {
  강력: { from: "#f59e0b", to: "#ef4444" },
  NEW: { from: "#f97316", to: "#ef4444" },
  추천: { from: "#06b6d4", to: "#7C5CFF" },
};

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default function Subscription({
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionProps) {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const fetchSubscription = async () => {
    try {
      const res = await axios.get("/api/v1/subscription");
      setCurrentPlan(res.data.plan);
    } catch {
      setCurrentPlan(null);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSubscription();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPrice = (base: number) =>
    cycle === "yearly" ? Math.round(base * 0.8) : base;

  // 구독 변경
  const handleSubscribe = async (planId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await axios.post("/api/v1/subscription", { plan_id: planId });
      await fetchSubscription();
      onSuccess?.();
      if (planId === "telegram") {
        window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
      }
      await alertSuccess("구독 완료", "플랜이 성공적으로 변경되었습니다.");
      onClose();
    } catch {
      await alertError("구독 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-6xl bg-[#0f1117] border border-[#2a2d36] rounded-2xl shadow-2xl flex flex-col justify-between h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2a2d36] shrink-0">
          <span className="text-base font-semibold text-white">요금제</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* 월간/연간 토글 */}
        <div className="flex items-center gap-3 px-8 pt-5 pb-2 shrink-0">
          <div className="flex bg-[#1a1d24] border border-[#2a2d36] rounded-lg p-0.5">
            {(["monthly", "yearly"] as BillingCycle[]).map(c => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${cycle === c ? "bg-[#2a2d36] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {c === "monthly" ? "월간" : "연간"}
              </button>
            ))}
          </div>
          {cycle === "yearly" && (
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
              20% 절약
            </span>
          )}
          <span className="text-xs text-zinc-500">
            * 프로그램 기본 사용료는 모든 유료 플랜에 포함됩니다.
          </span>
        </div>

        {/* 플랜 카드 */}
        <div className="overflow-x-auto px-8 pb-6 pt-3">
          {" "}
          {/* ← hidden → auto */}
          <div className="flex gap-3">
            {PLANS.map(plan => {
              const isCurrent = currentPlan === plan.id;
              const price = getPrice(plan.monthlyPrice);
              const originalPrice = plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  style={
                    plan.highlight
                      ? { borderColor: isCurrent ? plan.highlight : undefined }
                      : {}
                  }
                  className={`flex-1 flex flex-col rounded-xl border p-4 transition-colors
                    ${
                      isCurrent
                        ? "bg-[#141519]"
                        : "bg-[#141519] border-[#2a2d36] hover:border-[#3a3d46]"
                    }`}
                >
                  {/* 플랜 이름 + 뱃지 */}
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className="text-sm font-bold"
                      style={{ color: plan.highlight ?? "#e4e4e7" }}
                    >
                      {plan.label}
                    </span>
                    {plan.badge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-sm"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${BADGE_GRADIENTS[plan.badge.text]?.from}, ${BADGE_GRADIENTS[plan.badge.text]?.to})`,
                        }}
                      >
                        {plan.badge.text}
                      </span>
                    )}
                  </div>

                  {/* 설명 */}
                  <p className="text-[11px] text-zinc-500 whitespace-pre-line mb-3 leading-relaxed">
                    {plan.desc}
                  </p>

                  {/* 가격 */}
                  <div className="mb-4">
                    {cycle === "yearly" && (
                      <p className="text-[11px] text-zinc-600 line-through mb-0.5">
                        월 {fmt(originalPrice)}원
                      </p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-white">
                        월 {fmt(price)}원
                      </span>
                      {cycle === "yearly" && (
                        <span className="text-[10px] text-[#22c55e] font-semibold">
                          -20%
                        </span>
                      )}
                    </div>
                    {plan.id !== "telegram" && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        프로그램 이용료 포함
                      </p>
                    )}
                  </div>

                  {/* 기능 목록 */}
                  <div className="flex flex-col gap-1.5 flex-1 mb-4">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-1.5">
                        <span className="text-[#22c55e] text-xs mt-0.5 shrink-0">
                          ✓
                        </span>
                        <span className="text-[11px] text-zinc-300 leading-relaxed">
                          {f}
                        </span>
                      </div>
                    ))}
                    {plan.unavailable?.map(f => (
                      <div
                        key={f}
                        className="flex items-start gap-1.5 opacity-35"
                      >
                        <span className="text-zinc-500 text-xs mt-0.5 shrink-0">
                          ✕
                        </span>
                        <span className="text-[11px] text-zinc-500 leading-relaxed line-through">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 버튼 */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 text-xs font-medium rounded-lg border border-white/10 text-zinc-500 cursor-default"
                    >
                      현재 이용 중
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading}
                      style={
                        plan.highlight ? { background: plan.highlight } : {}
                      }
                      className={`w-full py-2 text-xs font-semibold rounded-lg text-white transition-opacity
                        hover:opacity-85 disabled:opacity-50
                        ${!plan.highlight ? "bg-[#2a2d36] hover:bg-[#3a3d46]" : ""}`}
                    >
                      {currentPlan ? "변경하기" : "구독 신청하기"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 투자 위험 고지 */}
        <div className="px-8 pb-6 shrink-0 flex flex-col gap-3">
          <div className="bg-[#141519] border border-[#2a2d36] rounded-xl px-5 py-4">
            <p className="text-[11px] font-semibold text-zinc-400 mb-1.5">
              투자 위험 고지
            </p>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              본 서비스는 투자 참고용 정보 제공 서비스이며, 투자 권유 또는 금융
              자문이 아닙니다. AI 예측 신호 및 자동매매 기능은 시장 상황에 따라
              손실이 발생할 수 있으며, 원금 보장이 되지 않습니다. 모든 투자
              결정과 그에 따른 손익은 전적으로 이용자 본인에게 귀속되며, 본
              서비스 제공자는 투자 결과에 대한 법적 책임을 지지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
