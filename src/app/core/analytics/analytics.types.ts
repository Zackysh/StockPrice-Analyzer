export interface Stock {
  date: Date;
  close: number;
  predicted?: number;
}

export interface CompleteStock {
  date: Date;
  close: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
}

export interface StockResponse {
  valid: Stock[];
  train: Stock[];
  complete: Stock[];
}
