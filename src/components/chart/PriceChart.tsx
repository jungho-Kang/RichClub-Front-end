import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { useChartStore } from "@/stores/useChartStore";
import axios from "axios";

interface CandleData {
  close: number;
  datetime: string;
  high: number;
  low: number;
  ma5: number;
  ma20: number;
  ma60: number;
  open: number;
  volume: number;
}

const CHART_HEIGHT = 350;

const LEGEND_ITEMS = [
  { label: "전환선", color: "#dc2626", type: "line" },
  { label: "기준선", color: "#2563eb", type: "line" },
  { label: "후행스팬", color: "#fff", type: "line" },
  { label: "선행스팬1", color: "rgba(34,197,94,0.8)", type: "line" },
  { label: "선행스팬2", color: "rgba(239,68,68,0.8)", type: "line" },
] as const;

const PriceChart = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  // series ref 추가
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [candleData, setCandleData] = useState<CandleData[]>([]);
  const {
    showMA5,
    showMA20,
    showMA60,
    showIchimoku,
    setHoveredDate,
    hoveredDate,
  } = useChartStore();

  // ================= API =================
  const getCandleData = async () => {
    try {
      const res = await axios.get(`/api/v1/stock/chart/candle/${"005930"}`, {
        params: { days: 180 },
      });
      setCandleData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCandleData();
  }, []);

  // ================= utils =================
  const addDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const subDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  };

  // ================= Ichimoku 계산 =================
  const getIchimoku = (data: CandleData[]) => {
    return data.map((_, i) => {
      const slice9 = data.slice(Math.max(0, i - 8), i + 1);
      const slice26 = data.slice(Math.max(0, i - 25), i + 1);
      const slice52 = data.slice(Math.max(0, i - 51), i + 1);

      const high9 = Math.max(...slice9.map(d => d.high));
      const low9 = Math.min(...slice9.map(d => d.low));
      const high26 = Math.max(...slice26.map(d => d.high));
      const low26 = Math.min(...slice26.map(d => d.low));
      const high52 = Math.max(...slice52.map(d => d.high));
      const low52 = Math.min(...slice52.map(d => d.low));

      const tenkan = (high9 + low9) / 2;
      const kijun = (high26 + low26) / 2;
      const spanA = (tenkan + kijun) / 2;
      const spanB = (high52 + low52) / 2;

      return {
        time: data[i].datetime.slice(0, 10),
        tenkan,
        kijun,
        spanA,
        spanB,
        close: data[i].close,
      };
    });
  };

  useEffect(() => {
    if (
      !chartRef.current ||
      !wrapperRef.current ||
      !overlayRef.current ||
      candleData.length === 0
    )
      return;

    // 매 렌더마다 구름 캔버스를 먼저 비움 (off 전환 시 잔상 방지)
    const overlayCtx = overlayRef.current.getContext("2d");
    if (overlayCtx) {
      overlayCtx.clearRect(
        0,
        0,
        overlayRef.current.width,
        overlayRef.current.height,
      );
    }

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#aaa",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      localization: {
        dateFormat: "yyyy.MM.dd",
      },
      width: chartRef.current.clientWidth,
      height: CHART_HEIGHT,
    });

    chartInstance.current = chart;

    // ================= Crosshair Sync (RSI / MACD 연동용) =================
    chart.subscribeCrosshairMove(param => {
      // 마우스가 차트 밖으로 나갔을 때
      if (!param.time) {
        setHoveredDate(null);
        return;
      }

      // lightweight-charts의 time 값을 string으로 변환해서 저장
      setHoveredDate(param.time as string);
    });

    const overlay = overlayRef.current;
    overlay.width = chartRef.current.clientWidth;
    overlay.height = CHART_HEIGHT;

    // ================= 캔들 =================
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#3CB371",
      downColor: "#E44B58",
      borderVisible: false,
      wickUpColor: "#3CB371",
      wickDownColor: "#E44B58",
      priceLineVisible: false,
    });

    candleSeriesRef.current = candleSeries;

    candleSeries.setData(
      candleData.map(item => ({
        time: item.datetime.slice(0, 10),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })),
    );

    // ================= MA =================
    if (showMA5) {
      const ma5 = chart.addLineSeries({
        color: "#fbbf24",
        lineWidth: 1,
        priceLineVisible: false,
      });
      ma5.setData(
        candleData.map(d => ({ time: d.datetime.slice(0, 10), value: d.ma5 })),
      );
    }
    if (showMA20) {
      const ma20 = chart.addLineSeries({
        color: "#38bdf8",
        lineWidth: 1,
        priceLineVisible: false,
      });
      ma20.setData(
        candleData.map(d => ({ time: d.datetime.slice(0, 10), value: d.ma20 })),
      );
    }
    if (showMA60) {
      const ma60 = chart.addLineSeries({
        color: "#a78bfa",
        lineWidth: 1,
        priceLineVisible: false,
      });
      ma60.setData(
        candleData.map(d => ({ time: d.datetime.slice(0, 10), value: d.ma60 })),
      );
    }

    // ================= Ichimoku (on/off) =================
    if (showIchimoku) {
      const ichimoku = getIchimoku(candleData);

      // 전환선
      const tenkanSeries = chart.addLineSeries({
        color: "#dc2626",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      tenkanSeries.setData(
        ichimoku.map(d => ({ time: d.time, value: d.tenkan })),
      );

      // 기준선
      const kijunSeries = chart.addLineSeries({
        color: "#2563eb",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      kijunSeries.setData(
        ichimoku.map(d => ({ time: d.time, value: d.kijun })),
      );

      // 후행스팬 — 현재 종가를 26일 과거에 표시
      const chikouSeries = chart.addLineSeries({
        color: "#fff",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      chikouSeries.setData(
        ichimoku.map(d => ({ time: subDays(d.time, 26), value: d.close })),
      );

      // 선행스팬1 (26일 선행)
      const spanAData = ichimoku.map(d => ({
        time: addDays(d.time, 26),
        value: d.spanA,
      }));
      // 선행스팬2 (26일 선행)
      const spanBData = ichimoku.map(d => ({
        time: addDays(d.time, 26),
        value: d.spanB,
      }));

      const span1Series = chart.addLineSeries({
        color: "rgba(34,197,94,0.8)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      span1Series.setData(spanAData);

      const span2Series = chart.addLineSeries({
        color: "rgba(239,68,68,0.8)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      span2Series.setData(spanBData);

      // 구름 드로우
      const drawCloud = () => {
        const ctx = overlay.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, overlay.width, overlay.height);
        const timeScale = chart.timeScale();

        for (let i = 1; i < spanAData.length; i++) {
          const prevA = spanAData[i - 1];
          const currA = spanAData[i];
          const prevB = spanBData[i - 1];
          const currB = spanBData[i];

          const x1 = timeScale.timeToCoordinate(prevA.time as any);
          const x2 = timeScale.timeToCoordinate(currA.time as any);
          const y1a = candleSeries.priceToCoordinate(prevA.value);
          const y2a = candleSeries.priceToCoordinate(currA.value);
          const y1b = candleSeries.priceToCoordinate(prevB.value);
          const y2b = candleSeries.priceToCoordinate(currB.value);

          if (
            x1 == null ||
            x2 == null ||
            y1a == null ||
            y2a == null ||
            y1b == null ||
            y2b == null
          )
            continue;

          const isBull = currA.value > currB.value;
          const fillColor = isBull
            ? "rgba(34,197,94,0.25)"
            : "rgba(239,68,68,0.25)";

          ctx.beginPath();
          ctx.moveTo(x1, y1a);
          ctx.lineTo(x2, y2a);
          ctx.lineTo(x2, y2b);
          ctx.lineTo(x1, y1b);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
      };

      chart.timeScale().subscribeVisibleTimeRangeChange(drawCloud);
      chart.subscribeCrosshairMove(drawCloud);
      requestAnimationFrame(() => requestAnimationFrame(drawCloud));
    } else {
      // off 시 구름 캔버스 비우기
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    };
  }, [candleData, showMA5, showMA20, showMA60, showIchimoku]);

  useEffect(() => {
    if (!chartInstance.current || !candleSeriesRef.current) return;

    const chart = chartInstance.current;
    const series = candleSeriesRef.current;

    if (!hoveredDate) {
      chart.clearCrosshairPosition();
      return;
    }

    // 👉 해당 날짜 데이터 찾기
    const target = candleData.find(
      d => d.datetime.slice(0, 10) === hoveredDate,
    );

    if (!target) return;

    // 👉 crosshair 이동 (이게 핵심)
    chart.setCrosshairPosition(target.close, hoveredDate as any, series);
  }, [hoveredDate, candleData]);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <h3 className="text-sm font-bold mb-3">가격・이동평균선</h3>

      {/* ── 범례 ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
        {showMA5 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="inline-block w-5 h-0.5 rounded-full bg-[#fbbf24]" />
            MA5
          </span>
        )}
        {showMA20 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="inline-block w-5 h-0.5 rounded-full bg-[#38bdf8]" />
            MA20
          </span>
        )}
        {showMA60 && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="inline-block w-5 h-0.5 rounded-full bg-[#a78bfa]" />
            MA60
          </span>
        )}
        {showIchimoku &&
          LEGEND_ITEMS.map(({ label, color }) => (
            <span
              key={label}
              className="flex items-center gap-1 text-[11px] text-gray-400"
            >
              <span
                className="inline-block w-5 h-0.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </span>
          ))}
      </div>

      {/* ── 차트 영역 ── */}
      <div
        ref={wrapperRef}
        className="relative w-full"
        style={{ height: CHART_HEIGHT, backgroundColor: "#141519" }}
      >
        <canvas
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />
        <div
          ref={chartRef}
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        />
      </div>
    </div>
  );
};

export default PriceChart;
