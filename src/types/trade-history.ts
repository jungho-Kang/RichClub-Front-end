export type Step = "list" | "form" | "edit" | "trash";

export type TradeType = "매수" | "매도" | "관망";

// 작성용 Trade (post data)
export interface TradeHistory {
  stock_code: string;
  stock_name: string;
  trade_type: TradeType;
  price: number;
  quantity: number;
  memo: string;
}

// 조회용 Trade (get data)
export interface TradeData extends TradeHistory {
  id: string;
  total_amount: number;
  traded_at: string;
}
