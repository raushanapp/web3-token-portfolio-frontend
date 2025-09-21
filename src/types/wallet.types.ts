import type { Token, TokenSearchResult, TrendingToken, } from "./token.types";

export interface WalletStates {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  ensName: string | null;
    connector: string | null;
    chain:string | null
}


export interface WalletState {
 portfolio: WatchlistToken[];        // ✅ Array of WatchlistToken
  watchlist: Token[];                 // ✅ Array of Token
  marketTokens: Token[];              // ✅ Array of Token
  
  // UI state
  loading: {
    portfolio: 'idle' | 'loading' | 'succeeded' | 'failed';
    watchlist: 'idle' | 'loading' | 'succeeded' | 'failed';
    marketTokens: 'idle' | 'loading' | 'succeeded' | 'failed';
    addToken: 'idle' | 'loading' | 'succeeded' | 'failed';
  };
  
  // Error messages
  error: {
    portfolio: string | null;
    watchlist: string | null;
    marketTokens: string | null;
    addToken: string | null;
  };
  
  // Search and trending data
  searchResults: TokenSearchResult[];
  trendingTokens: TrendingToken[];
  searchQuery: string;
  
  // Last updated timestamps
  lastUpdated: {
    portfolio: number | null;
    watchlist: number | null;
    marketTokens: number | null;
  };
    
    isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  ensName: string | null;
    connector: string | null;
    chain:string| null
}

// Add to your existing token types if not present
export interface WatchlistToken extends Token {
  holdings: number;
  value: number; // current_price * holdings
  dateAdded?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  topGainer: WatchlistToken[] | null;
  topLoser: WatchlistToken[] | null;
}
