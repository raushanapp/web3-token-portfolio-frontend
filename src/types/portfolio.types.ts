import type { Token } from "./token.types";

export interface PortfolioSummary {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
    lastUpdated?: string;
    // id: string|number| null
    topLoser?: [] | null;
    topGainer?:[]|null
}

// export interface PortfolioAllocation {
//   tokenId: string;
//   symbol: string;
//   value: number;
//   percentage: number;
//   color: string;
// }
export type isLoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';
export interface  PortfolioProps{
    portfolio: PortfolioSummary[],
    state:isLoadingState
}

export interface PortfolioToken extends Token {
  holdings: number;
  value: number;
  color?: string; // For chart colors
  dateAdded?: string;
}

export interface PortfolioAllocation {
  id: string;
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  holdings: number;
  current_price: number;
  color: string; // Required for donut chart
}