export type BetStatus = 'WIN' | 'LOSS' | 'VOID' | 'PENDING';

export interface Bet {
  id: string;
  date: string;
  sport: string;
  market: string;
  event: string;
  stake: number;
  odds: number;
  status: BetStatus;
  profit: number;
}

export interface Stats {
  totalProfit: number;
  roi: number;
  hitRate: number;
  totalStaked: number;
  winCount: number;
  lossCount: number;
}
