export type Step = "list" | "form";

export type TradeType = "매수" | "매도" | "관망";

export interface TradeHistory {
  stock_code: string;
  stock_name: string;
  trade_type: TradeType;
  price: number;
  quantity: number;
  memo: string;
}
