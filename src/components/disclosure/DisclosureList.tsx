import { Megaphone } from "lucide-react";
import type { Disclosure } from "@/types/stock";

// 공시 정보 리스트
const DISCLOSURES: Disclosure[] = [
  {
    tag: "수시공시",
    tone: "highlight",
    title: "단일판매・공급계약 체결 (3.2조원 규모 파운드리 수주)",
    company: "삼성전자",
    time: "오늘 09:12",
  },
  {
    tag: "수시공시",
    tone: "highlight",
    title: "신규시설 투자 결정 (배터리 합작공장 증설)",
    company: "LG에너지솔루션",
    time: "오늘 08:45",
  },
  {
    tag: "공시정정",
    tone: "neutral",
    title: "자기주식 취득 신탁계약 체결 결정",
    company: "NAVER",
    time: "어제 16:30",
  },
  {
    tag: "정기공시",
    tone: "info",
    title: "분기보고서 (2026.03) 제출",
    company: "SK하이닉스",
    time: "어제 15:02",
  },
  {
    tag: "수시공시",
    tone: "highlight",
    title: "최대주주등 소유주식 변동신고서",
    company: "SK하이닉스",
    time: "어제 11:20",
  },
  {
    tag: "수시공시",
    tone: "highlight",
    title: "투자판단 관련 주요경영사항 (신약 임상 3상 결과)",
    company: "셀트리온",
    time: "06-16 17:40",
  },
];

// 공시 태그 스타일
const tagClasses: Record<Disclosure["tone"], string> = {
  highlight: "bg-amber-500/15 text-amber-400",
  neutral: "bg-zinc-700/40 text-zinc-400",
  info: "bg-sky-500/15 text-sky-400",
};

const DisclosureList = () => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <Megaphone className="w-4 h-4 text-zinc-400" />
        시장지표
      </h3>
      <div className="space-y-4">
        {DISCLOSURES.map((d, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className={`text-[10px] font-medium rounded px-1.5 py-1 shrink-0 ${tagClasses[d.tone]}`}
            >
              {d.tag}
            </span>
            <div className="min-w-0">
              <div className="text-sm text-zinc-200 truncate">{d.title}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {d.company} ・ {d.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisclosureList;
