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
  name: string;
  code: string;
  price: number;
  changePct: number;

  // AI 관련
  signal?: "매수" | "매도" | "관망";
  confidence?: number;

  // 사용자 관련 (있으면)
  shares?: number;
  avgPrice?: number;
  pnlPct?: number;
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

export type Period = "1개월" | "3개월" | "6개월";
