export interface PricePoint {
  date: string;
  price: number;
  ma5: number | null;
  ma20: number | null;
  ma60: number | null;
  rsi: number | null;
  macd: number;
  signal: number;
  histogram: number;
}

export interface AIStock {
  confidence?: string;
  current_price: number;
  predicted_at: string;
  signal: "매수" | "매도" | "관망";
  signal_label: number;
  stock_code: string;
  stock_name: string;
}

export interface Disclosure {
  tag: string;
  tone: "highlight" | "neutral" | "info";
  title: string;
  company: string;
  time: string;
}

export interface Report {
  rating: "매수" | "중립" | "매도";
  title: string;
  company: string;
  broker: string;
  time: string;
  targetPrice: number;
}

export interface SelectedStockItem {
  stock_code: string;
  stock_name: string;
}
