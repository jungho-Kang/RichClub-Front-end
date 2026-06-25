import type { TradeType } from "./trade-history";

export interface AIStock {
  current_price: number;
  predicted_at: string;
  signal: TradeType;
  stock_code: string;
  stock_name: string;
  change_pct: number;

  confidence?: number;
  signal_label?: number;
}

export interface SelectedStockItem {
  stock_code: string;
  stock_name: string;
}

// ===== PriceChart interface =====
export interface CandleData {
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
export interface SignalData {
  stock_code: string;
  stock_name: string;
  current_price: number;
  change_pct: number;
  signal: TradeType;
  signal_label: number;
  confidence: number | null;
  predicted_at: string;
}
export interface PriceChartTooltip {
  x: number;
  y: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ma5?: number;
  ma20?: number;
  ma60?: number;
  badge?: {
    text: string | null;
    color: "green" | "red" | "orange";
  };
}

// RSIChart interface
export interface RSIData {
  date: string;
  rsi: number;
  signal: number | null;
  rsiBreakDown?: boolean;
}
export interface RSIChartTooltip {
  x: number;
  y: number;
  date: string;
  rsi: number;
  signal: number;
  badge?: {
    text: string | null;
    color: "green" | "red" | "orange";
  };
  rsiBreakText?: string;
}

// MACDChart interface
export interface MACDData {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}
export interface MACDChartTooltip {
  x: number;
  y: number;
  date: string;
  macd: number;
  signal: number;
  histogram: number;
  badge?: {
    text: string | null;
    color: "green" | "red" | "orange";
  };
}

// Tooltip 통합 interface
export interface TooltipState {
  macd?: MACDChartTooltip;
  rsi?: RSIChartTooltip;
  price?: PriceChartTooltip;
}
