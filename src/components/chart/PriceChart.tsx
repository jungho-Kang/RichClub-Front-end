import axios from "axios";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

import type { CandleData, SignalData } from "@/types/stock";

import { useChartStore } from "@/stores/useChartStore";
import { useStockStore } from "@/stores/useStockStore";
import { getIchimokuSeriesData } from "@/utils/chartUtils";

import ChartTooltip from "@/components/ui/ChartTooltip";
import { useTooltipStore } from "@/stores/useTooltipStore";
import PriceChartLegend from "./PriceChartLegend";

const CHART_HEIGHT = 350;

const PriceChart = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [candleData, setCandleData] = useState<CandleData[]>([]);
  // 시그널 데이터 state
  const [signalData, setSignalData] = useState<SignalData[]>([]);

  const { tooltip, setTooltip } = useTooltipStore();
  const { selectedStock, selectedModel } = useStockStore();
  const {
    showMA5,
    showMA20,
    showMA60,
    showIchimoku,
    setHoveredDate,
    hoveredDate,
    priceScaleWidth,
    setPriceScaleWidth,
    visibleRange,
    setVisibleRange,
    setCandleDateRange,
    resetChart,
  } = useChartStore();

  // ================= API =================
  const getCandleData = async () => {
    try {
      const res = await axios.get(
        `/api/v1/stock/chart/candle/${selectedStock.stock_code}`,
        { params: { days: 0 } },
      );
      setCandleData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getSignalData = async () => {
    try {
      const res = await axios.get("/api/v1/stock/ai/predictions", {
        params: {
          stock_name: selectedStock.stock_name,
          model_id: selectedModel,
        },
      });
      setSignalData(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    resetChart();
    getCandleData();
    getSignalData();
  }, [selectedStock, selectedModel]);

  useEffect(() => {
    if (!chartRef.current || !overlayRef.current || candleData.length === 0)
      return;

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
      rightPriceScale: {
        minimumWidth: priceScaleWidth, // 전역 스토어 값 구독
        autoScale: true,
      },
      width: chartRef.current.clientWidth,
      height: CHART_HEIGHT,
    });

    chartInstance.current = chart;

    // Y축 실제 너비를 측정해서 Zustand 스토어에 보낼 함수
    const updateActualWidth = () => {
      if (!chartInstance.current) return;
      // 라이브러리가 렌더링한 실제 right 축의 픽셀 너비 가져오기
      const actualWidth = chartInstance.current.priceScale("right").width();
      if (actualWidth > 0) {
        setPriceScaleWidth(actualWidth);
      }
    };

    // 데이터가 세팅되고 차트가 그려진 직후(100ms 뒤) 실제 너비를 측정
    const timer = setTimeout(updateActualWidth, 100);

    // 브라우저 창 크기가 바뀔 때 주가 자릿수 레이아웃 변경에 대응
    window.addEventListener("resize", updateActualWidth);

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

    const overlay = overlayRef.current;
    overlay.width = chartRef.current.clientWidth;
    overlay.height = CHART_HEIGHT;

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

    const dates = candleData.map(d => d.datetime.slice(0, 10));
    setCandleDateRange({ from: dates[0], to: dates[dates.length - 1] });

    // Buy / Sell 마커 세팅 로직
    if (signalData.length > 0 && candleData.length > 0) {
      const validDates = new Set(candleData.map(d => d.datetime.slice(0, 10)));

      const markers = signalData
        .filter(item => item.signal === "매수" || item.signal === "매도")
        .filter(item => validDates.has(item.predicted_at.slice(0, 10))) // 캔들 데이터 범위 안에 있는 것만
        .map(item => {
          const isBuy = item.signal === "매수";
          return {
            time: item.predicted_at.slice(0, 10),
            position: isBuy ? "belowBar" : "aboveBar",
            color: isBuy ? "#22c55e" : "#ef4444",
            shape: isBuy ? "arrowUp" : "arrowDown",
            text: isBuy ? "BUY" : "SELL",
            size: 1,
          } as const;
        })
        .sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        );

      candleSeries.setMarkers(markers);
    }

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
      const { tenkanData, kijunData, chikouData, spanAData, spanBData } =
        getIchimokuSeriesData(candleData);

      const tenkanSeries = chart.addLineSeries({
        color: "#dc2626",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      tenkanSeries.setData(tenkanData);

      const kijunSeries = chart.addLineSeries({
        color: "#2563eb",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      kijunSeries.setData(kijunData);

      const chikouSeries = chart.addLineSeries({
        color: "#fff",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      chikouSeries.setData(chikouData);

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
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    }

    const to = dates[dates.length - 1];
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() - 90);
    const from = toDate.toISOString().slice(0, 10);
    chart.timeScale().setVisibleRange({
      from: from as any,
      to: to as any,
    });

    return () => {
      clearTimeout(timer); // 타이머 제거
      window.removeEventListener("resize", updateActualWidth); // 이벤트 리스너 제거
      chart.remove();
      const ctx = overlay.getContext("2d");
      ctx?.clearRect(0, 0, overlay.width, overlay.height);
    };
  }, [candleData, showMA5, showMA20, showMA60, showIchimoku, signalData]);

  // 다른 차트 컴포넌트에 의해 전역 너비(priceScaleWidth)가 늘어나면 내 차트 축도 동기화
  useEffect(() => {
    if (!chartInstance.current) return;

    chartInstance.current.priceScale("right").applyOptions({
      minimumWidth: priceScaleWidth,
    });
  }, [priceScaleWidth]);

  // 차트 줌 상태 공유(확대/축소)
  useEffect(() => {
    if (!chartInstance.current || !visibleRange) return;

    chartInstance.current.timeScale().setVisibleLogicalRange(visibleRange);
  }, [visibleRange]);

  useEffect(() => {
    if (!chartInstance.current || !candleSeriesRef.current) return;

    const chart = chartInstance.current;
    const series = candleSeriesRef.current;

    if (!hoveredDate) {
      chart.clearCrosshairPosition();
      setTooltip(null);
      return;
    }

    const target = candleData.find(
      d => d.datetime.slice(0, 10) === hoveredDate,
    );
    if (!target) return;

    chart.setCrosshairPosition(target.close, hoveredDate as any, series);

    // 좌표 계산
    const x = chart.timeScale().timeToCoordinate(hoveredDate as any);
    const y = series.priceToCoordinate(target.close);

    if (x === null || y === null) return;

    // badge 계산
    const ma5 = Number(target.ma5);
    const ma20 = Number(target.ma20);
    const ma60 = Number(target.ma60);

    let badge: { text: string; color: "green" | "red" | "orange" } | undefined;
    if (ma5 > ma20 && ma20 > ma60) {
      badge = { text: "정배열", color: "green" };
    } else if (ma5 < ma20 && ma20 < ma60) {
      badge = { text: "역배열", color: "red" };
    }

    setTooltip({
      price: {
        x,
        y,
        date: hoveredDate,
        open: Math.round(Number(target.open)),
        high: Math.round(Number(target.high)),
        low: Math.round(Number(target.low)),
        close: Math.round(Number(target.close)),
        ma5: Math.round(ma5),
        ma20: Math.round(ma20),
        ma60: Math.round(ma60),
        badge,
      },
    });
  }, [hoveredDate, candleData]);

  return (
    <div className="bg-[#141519] border border-[#26272c] rounded-2xl p-5">
      <h3 className="text-sm font-bold mb-3">가격・이동평균선</h3>

      {/* 범례 */}
      <PriceChartLegend
        showMA5={showMA5}
        showMA20={showMA20}
        showMA60={showMA60}
        showIchimoku={showIchimoku}
      />

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

        {tooltip?.price && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: tooltip.price.x + 12,
              top: tooltip.price.y + 12,
              zIndex: 9999,
            }}
          >
            <ChartTooltip
              title={tooltip.price.date}
              badge={tooltip.price.badge}
              items={[
                {
                  label: "시가",
                  value: tooltip.price.open,
                },
                {
                  label: "고가",
                  value: tooltip.price.high,
                },
                {
                  label: "저가",
                  value: tooltip.price.low,
                },
                {
                  label: "종가",
                  value: tooltip.price.close,
                },

                ...(showMA5 && tooltip.price.ma5 != null
                  ? [
                      {
                        label: "MA5",
                        value: tooltip.price.ma5,
                      },
                    ]
                  : []),

                ...(showMA20 && tooltip.price.ma20 != null
                  ? [
                      {
                        label: "MA20",
                        value: tooltip.price.ma20,
                      },
                    ]
                  : []),

                ...(showMA60 && tooltip.price.ma60 != null
                  ? [
                      {
                        label: "MA60",
                        value: tooltip.price.ma60,
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
