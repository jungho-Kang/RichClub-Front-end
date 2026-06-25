import axios from "axios";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

import type { RSIData } from "@/types/stock";

import { useChartStore } from "@/stores/useChartStore";
import { useStockStore } from "@/stores/useStockStore";

import ChartTooltip from "@/components/ui/ChartTooltip";
import { useTooltipStore } from "@/stores/useTooltipStore";

const CHART_HEIGHT = 150;

const RSIChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  // series ref 추가
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [data, setData] = useState<RSIData[]>([]);

  const { tooltip, setTooltip } = useTooltipStore();
  const { selectedStock } = useStockStore();
  const {
    hoveredDate,
    setHoveredDate,
    priceScaleWidth,
    visibleRange,
    setVisibleRange,
  } = useChartStore();

  const calcRSISignal = (data: number[], period: number) => {
    const result: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
        continue;
      }

      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((a, b) => a + b, 0) / period;

      result.push(avg);
    }

    return result;
  };

  // ================= API =================
  const getRSIData = async () => {
    try {
      const res = await axios.get(
        `/api/v1/stock/chart/rsi/${selectedStock.stock_code}`,
        {
          params: { period: "all" },
        },
      );
      const data: RSIData[] = res.data.data;
      // signalValues 계산해서 dataState에 넣기
      if (data) {
        const rsiValues = data.map(d => d.rsi);
        const signalValues = calcRSISignal(rsiValues, 9);

        const merged = data.map((d, i, arr) => {
          const prev = arr[i - 1];

          // ================= 핵심 추가 로직 =================
          const rsiBreakDown =
            prev?.rsi != null && d.rsi != null && prev.rsi >= 70 && d.rsi < 70;

          return {
            ...d,
            signal: signalValues[i],
            rsiBreakDown,
          };
        });
        setData(merged);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getRSIData();
  }, [selectedStock]);

  // ================= 차트 =================
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

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
      rightPriceScale: {
        minimumWidth: priceScaleWidth, // 전역 스토어 값 구독
        autoScale: true,
      },
      width: chartRef.current.clientWidth,
      height: CHART_HEIGHT,
    });

    chartInstance.current = chart;

    // ================= RSI =================
    const rsiSeries = chart.addLineSeries({
      color: "#a78bfa",
      lineWidth: 2,
      priceLineVisible: false,
    });

    rsiSeriesRef.current = rsiSeries;

    rsiSeries.setData(
      data.map(d => ({
        time: d.date,
        value: d.rsi,
      })),
    );

    // ================= SIGNAL (RSI MA) =================
    const signalSeries = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 2,
      priceLineVisible: false,
    });

    signalSeriesRef.current = signalSeries;

    signalSeries.setData(
      data
        .filter(d => d.signal !== null && d.signal !== undefined)
        .map(d => ({
          time: d.date,
          value: d.signal!,
        })),
    );

    // ================= 기준선 =================
    const overbought = chart.addLineSeries({
      color: "#E44B58",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    const oversold = chart.addLineSeries({
      color: "#3CB371",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    overbought.setData(data.map(d => ({ time: d.date, value: 70 })));
    oversold.setData(data.map(d => ({ time: d.date, value: 30 })));

    chart.subscribeCrosshairMove(param => {
      if (!param.time || !param.point) {
        setHoveredDate(null);
        return;
      }

      setHoveredDate(param.time as string);
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (!range) return;

      setVisibleRange(range);
    });

    if (!visibleRange) {
      chart.timeScale().fitContent();
    }

    return () => {
      chart.remove();
    };
  }, [data]);

  // ================= HOVER SYNC =================
  useEffect(() => {
    if (!chartInstance.current || !rsiSeriesRef.current) return;

    const chart = chartInstance.current;
    const series = rsiSeriesRef.current;

    if (!hoveredDate) {
      chart.clearCrosshairPosition();
      setTooltip(null);
      return;
    }

    // 해당 날짜의 RSI 값 찾기
    const target = data.find(d => d.date === hoveredDate);

    if (!target) return;

    // 진짜 crosshair 이동 (점 찍힘)
    chart.setCrosshairPosition(target.rsi, hoveredDate as any, series);

    // x 좌표: 날짜 → 픽셀 변환
    const x = chart.timeScale().timeToCoordinate(hoveredDate as any);
    // y 좌표: 값 → 픽셀 변환
    const y = series.priceToCoordinate(target.rsi);

    if (x === null || y === null) return;

    // badge 계산
    let badge: { text: string; color: "green" | "red" | "orange" } | undefined;
    if (target.rsiBreakDown) {
      badge = { text: "매도!", color: "red" };
    } else if (target.rsi >= 70) {
      badge = { text: "과매수", color: "orange" };
    } else if (target.rsi <= 30) {
      badge = { text: "과매도", color: "green" };
    }

    const signalTarget = target.signal ?? 0;

    setTooltip({
      rsi: {
        x,
        y,
        date: hoveredDate,
        rsi: target.rsi,
        signal: signalTarget,
        badge,
        rsiBreakText: target.rsiBreakDown
          ? "RSI 70 하방이탈 - 매도 신호"
          : undefined,
      },
    });
  }, [hoveredDate, data]);

  // 차트 줌 공유
  useEffect(() => {
    if (!chartInstance.current || !visibleRange) return;

    chartInstance.current.timeScale().setVisibleLogicalRange(visibleRange);
  }, [visibleRange]);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4 relative">
      <h3 className="text-sm font-bold mb-3">RSI (10, 9)</h3>

      <div ref={chartRef} className="w-full" style={{ height: CHART_HEIGHT }} />

      {tooltip?.rsi && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: tooltip.rsi.x + 10,
            top: tooltip.rsi.y + 10,
            zIndex: 50,
          }}
        >
          <ChartTooltip
            title={tooltip.rsi.date}
            badge={tooltip.rsi.badge}
            items={[
              ...(tooltip.rsi.rsiBreakText
                ? [
                    {
                      label: "",
                      value: tooltip.rsi.rsiBreakText,
                      color: "",
                      isWarning: true,
                    },
                  ]
                : []),
              {
                label: "RSI",
                value: tooltip.rsi.rsi,
                color: "#a78bfa",
              },
              {
                label: "Signal",
                value: tooltip.rsi.signal,
                color: "#f59e0b",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default RSIChart;
