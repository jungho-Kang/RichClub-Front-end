import { useEffect } from "react";
import { useChartStore } from "@/stores/useChartStore";
import type { IChartApi } from "lightweight-charts";

export const useChartSync = (
  chart: IChartApi | null,
  overlay: HTMLCanvasElement | null,
) => {
  const { crosshairX, visibleRange } = useChartStore();

  // crosshair 따라가기
  useEffect(() => {
    if (!overlay) return;

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (crosshairX == null) return;

    ctx.beginPath();
    ctx.moveTo(crosshairX, 0);
    ctx.lineTo(crosshairX, overlay.height);
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [crosshairX]);

  // zoom sync
  useEffect(() => {
    if (!chart || !visibleRange) return;
    chart.timeScale().setVisibleRange(visibleRange);
  }, [visibleRange]);
};
