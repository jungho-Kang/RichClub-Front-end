import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useChartStore } from "@/stores/useChartStore";
import { useStockStore } from "@/stores/useStockStore";

interface RSIData {
  date: string;
  rsi: number;
  signal: number | null;
}

const CHART_HEIGHT = 150;

const RSIChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  // series ref 추가
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [data, setData] = useState<RSIData[]>([]);
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

        const merged = data.map((d, i) => ({
          ...d,
          signal: signalValues[i],
        }));
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

    // ================= emit (PriceChart 역할도 가능) =================
    chart.subscribeCrosshairMove(param => {
      if (!param.time) {
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

  // ================= follower (핵심) =================
  useEffect(() => {
    if (!chartInstance.current || !rsiSeriesRef.current) return;

    const chart = chartInstance.current;
    const series = rsiSeriesRef.current;

    if (!hoveredDate) {
      chart.clearCrosshairPosition();
      return;
    }

    // 해당 날짜의 RSI 값 찾기
    const target = data.find(d => d.date === hoveredDate);

    if (!target) return;

    // 진짜 crosshair 이동 (점 찍힘)
    chart.setCrosshairPosition(target.rsi, hoveredDate as any, series);
  }, [hoveredDate, data]);

  // 차트 줌 공유
  useEffect(() => {
    if (!chartInstance.current || !visibleRange) return;

    chartInstance.current.timeScale().setVisibleLogicalRange(visibleRange);
  }, [visibleRange]);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-3">RSI (10, 9)</h3>

      <div ref={chartRef} className="w-full" style={{ height: CHART_HEIGHT }} />
    </div>
  );
};

export default RSIChart;
