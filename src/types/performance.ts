// types/performance.types.ts

export type ModelId = "ju-model-v2" | "seo-model-v1";
export type Period = "1m" | "3m" | "6m" | "all";
export type CalcMode = "sum" | "avg" | "compound";

export interface Trade {
  stock_code: string;
  stock_name: string;
  buy_date: string;
  buy_price: number;
  sell_date?: string;
  sell_price?: number;
  return_pct: number;
  unrealized_pct?: number;
}

export interface Holding {
  stock_code: string;
  stock_name: string;
  buy_date: string;
  buy_price: number;
  current_price: number;
  unrealized_pct: number;
}

export interface PerformanceData {
  win_rate: number;
  win_count: number;
  lose_count: number;
  avg_return_pct: number;
  max_return_pct: number;
  max_loss_pct: number;
  holdings: Holding[];
  trades: Trade[];
  updated_at: string;
}

export interface SimulationYear {
  year: number;
  total_trades: number;
  win_count: number;
  lose_count: number;
  win_rate: number;
  avg_return_pct: number;
  final_amount: number;
  profit: number;
  return_pct: number;
}

export interface SimulationData {
  model_id: string;
  principal: number;
  max_stocks: number;
  years: SimulationYear[];
  total_final_amount: number;
  total_profit: number;
  total_return_pct: number;
  updated_at: string;
}

export interface UsePerformanceParams {
  modelId: ModelId;
  period?: Period;
  year?: number | null;
}

export interface UseSimulationParams {
  modelId: ModelId;
  principal: number;
  maxStocks: number;
  year?: number | null;
}

export interface UsePerformanceReturn {
  data: PerformanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseSimulationReturn {
  data: SimulationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
