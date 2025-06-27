export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryDate: string;
  exitDate?: string;
  status: 'open' | 'closed';
  notes?: string;
  strategy?: string;
  pnl?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}