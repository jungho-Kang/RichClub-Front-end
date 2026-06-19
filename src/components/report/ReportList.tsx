import type { Report } from "@/types/stock";
import { FileBarChart2 } from "lucide-react";

// 증권사 리포트 리스트
const REPORTS: Report[] = [
  {
    rating: "매수",
    title: "HBM 모멘텀 본격화, 하반기 실적 레벨업 기대",
    company: "삼성전자",
    broker: "미래에셋증권",
    time: "오늘",
    targetPrice: 95000,
  },
  {
    rating: "매수",
    title: "AI 메모리 슈퍼사이클, 목표주가 상향",
    company: "SK하이닉스",
    broker: "한국투자증권",
    time: "오늘",
    targetPrice: 248000,
  },
  {
    rating: "중립",
    title: "광고 회복 더디나 비용 효율화 긍정적",
    company: "카카오",
    broker: "삼성증권",
    time: "어제",
    targetPrice: 45000,
  },
  {
    rating: "중립",
    title: "전기차 수요 둔화 반영, 단기 보수적 접근",
    company: "LG에너지솔루션",
    broker: "NH투자증권",
    time: "어제",
    targetPrice: 390000,
  },
  {
    rating: "매수",
    title: "수출 호조 전망 최대, 구조적 성장 국면",
    company: "한화에어로스페이스",
    broker: "키움증권",
    time: "06-16",
    targetPrice: 368000,
  },
];

// 리포트 등급 스타일
const ratingClasses: Record<Report["rating"], string> = {
  매수: "bg-emerald-500/15 text-emerald-400",
  중립: "bg-zinc-700/40 text-zinc-400",
  매도: "bg-rose-500/15 text-rose-400",
};

interface ReportListProps {
  won: (n: number) => string;
}

const ReportList = ({ won }: ReportListProps) => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <FileBarChart2 className="w-4 h-4 text-zinc-400" />
        증권사 리포트
      </h3>
      <div className="space-y-4">
        {REPORTS.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span
                className={`text-[10px] font-bold rounded px-1.5 py-1 shrink-0 ${ratingClasses[r.rating]}`}
              >
                {r.rating}
              </span>
              <div className="min-w-0">
                <div className="text-sm text-zinc-200 truncate">{r.title}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  {r.company} ・ {r.broker} ・ {r.time}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-zinc-500">목표가</div>
              <div className="text-sm font-semibold">{won(r.targetPrice)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;
