interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  valueColor?: string;
}

const StatCard = ({
  label,
  value,
  sub,
  highlight,
  valueColor,
}: StatCardProps) => (
  <div
    className={`bg-[#161616] rounded-xl p-5 flex flex-col gap-1.5 border ${
      highlight ? "border-emerald-500/30" : "border-white/5"
    }`}
  >
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-3xl font-bold ${valueColor ?? "text-white"}`}>
      {value}
    </span>
    {sub && <span className="text-xs text-gray-600">{sub}</span>}
  </div>
);

export default StatCard;
