import { TrendingUp } from "lucide-react";

// 포트폴리오 요약
const PORTFOLIO = {
  total: 21015000,
  gain: 1184000,
  gainPct: 5.97,
};

interface PortfolioCardProps {
  won: (n: number) => string;
  pct: (n: number) => string;
}

const PortfolioCard = ({ won, pct }: PortfolioCardProps) => {
  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5 flex flex-col justify-center">
      <div className="text-[11px] text-zinc-500 mb-2">총 평가자산</div>
      <div className="text-2xl font-bold tracking-tight mb-1.5">
        {won(PORTFOLIO.total)}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        {`+${won(PORTFOLIO.gain)}`}
        <span className="text-emerald-400/80">{pct(PORTFOLIO.gainPct)}</span>
      </div>
    </div>
  );
};

export default PortfolioCard;
