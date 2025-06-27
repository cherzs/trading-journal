import { Trade } from '../types/Trade';

export const getTradesKey = (userId: string): string => `trades_${userId}`;

export const saveTrades = (userId: string, trades: Trade[]): void => {
  localStorage.setItem(getTradesKey(userId), JSON.stringify(trades));
};

export const loadTrades = (userId: string): Trade[] => {
  const tradesStr = localStorage.getItem(getTradesKey(userId));
  return tradesStr ? JSON.parse(tradesStr) : [];
};

export const calculatePnL = (trade: Trade): number => {
  if (trade.status === 'open' || !trade.exitPrice) return 0;
  
  const difference = trade.type === 'buy' 
    ? trade.exitPrice - trade.entryPrice
    : trade.entryPrice - trade.exitPrice;
    
  return difference * trade.quantity;
};