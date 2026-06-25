import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useChartStore } from "@/stores/useChartStore";
import { useStockStore } from "@/stores/useStockStore";

interface MACDData {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}

const CHART_HEIGHT = 150;

const MACDChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);

  const macdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const histSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [data, setData] = useState<MACDData[]>([]);
  const { selectedStock } = useStockStore();
  const {
    hoveredDate,
    setHoveredDate,
    priceScaleWidth,
    visibleRange,
    setVisibleRange,
  } = useChartStore();

  // ================= API =================
  const getMACDData = async () => {
    try {
      const res = await axios.get(
        `/api/v1/stock/chart/macd/${selectedStock.stock_code}`,
        {
          params: { period: "all" },
        },
      );

      const data: MACDData[] = res.data.data ?? [];
      setData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getMACDData();
  }, [selectedStock]);

  // ================= CHART =================
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
        // 값이 정확히 0일 때만 표기하고 나머지는 숨김 처리
        priceFormatter: (price: number) => {
          return price === 0 ? "0" : "";
        },
      },
      rightPriceScale: {
        minimumWidth: priceScaleWidth, // 전역 스토어 값 구독
        autoScale: true,
      },
      width: chartRef.current.clientWidth,
      height: CHART_HEIGHT,
    });

    chartInstance.current = chart;

    // ================= MACD =================
    const macdSeries = chart.addLineSeries({
      color: "#e4e4e7",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    macdSeriesRef.current = macdSeries;

    macdSeries.setData(
      data.map(d => ({
        time: d.date,
        value: d.macd,
      })),
    );

    // ================= SIGNAL =================
    const signalSeries = chart.addLineSeries({
      color: "#f59e0b",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    signalSeriesRef.current = signalSeries;

    signalSeries.setData(
      data.map(d => ({
        time: d.date,
        value: d.signal,
      })),
    );

    // ================= HISTOGRAM (BAR → LINE) =================
    const histSeries = chart.addHistogramSeries({
      color: "#10b981",
      priceLineVisible: false,
      lastValueVisible: false,
    });

    histSeriesRef.current = histSeries;

    histSeries.setData(
      data.map(d => ({
        time: d.date,
        value: d.histogram,
        color: d.histogram >= 0 ? "#10b981" : "#f43f5e",
      })),
    );

    // ================= CROSSHAIR SYNC =================
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

  // ================= HOVER SYNC =================
  useEffect(() => {
    if (!chartInstance.current || !hoveredDate) return;

    const target = data.find(d => d.date === hoveredDate);
    if (!target) return;

    chartInstance.current.setCrosshairPosition(
      target.macd,
      hoveredDate as any,
      macdSeriesRef.current!,
    );
  }, [hoveredDate, data]);

  // 차트 줌 공유
  useEffect(() => {
    if (!chartInstance.current || !visibleRange) return;

    chartInstance.current.timeScale().setVisibleLogicalRange(visibleRange);
  }, [visibleRange]);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-sm font-bold">MACD (12, 26, 9)</h3>
      </div>

      <div ref={chartRef} style={{ height: CHART_HEIGHT }} />
    </div>
  );
};

export default MACDChart;
