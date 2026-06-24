import axios from "axios";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface MarketIndicator {
  change_pct: number;
  name: string;
  price: number;
  symbol: string;
  trend: string;
}

const MarketIndicatorList = () => {
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicator[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const getMarketIndicator = async () => {
    try {
      const res = await axios.get("/api/v1/market/global");
      setMarketIndicators(res.data.items || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMarketIndicator();
  }, []);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-[#23242a]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">시장지표</h3>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-3">
        {loading ? (
          <div className="p-3 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-zinc-800 animate-pulse"
                style={{ width: `${60 + i * 8}%` }}
              />
            ))}
          </div>
        ) : marketIndicators.length === 0 ? (
          <div className="text-sm text-zinc-500 py-8 text-center">
            표시할 지표가 없습니다
          </div>
        ) : (
          <div className="divide-y divide-[#23242a]">
            {marketIndicators.map(item => {
              const isUp = item.trend === "up" || item.change_pct > 0;
              const isDown = item.trend === "down" || item.change_pct < 0;
              const changeColor = isUp
                ? "text-emerald-400"
                : isDown
                  ? "text-red-400"
                  : "text-zinc-400";
              const changePrefix = isUp ? "+" : "";

              return (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  {/* 왼쪽: 이름 */}
                  <div>
                    <div className="text-sm text-zinc-200">{item.name}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {item.symbol}
                    </div>
                  </div>

                  {/* 오른쪽: 가격 + 등락 */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-zinc-100">
                      {item.price.toLocaleString()}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${changeColor}`}>
                      {changePrefix}
                      {item.change_pct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketIndicatorList;
