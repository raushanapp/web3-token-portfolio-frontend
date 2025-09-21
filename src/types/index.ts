export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
  market_cap_rank?: number;
}

export interface WatchlistToken extends Token {
  holdings: number;
  value: number;
}

export interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  large: string;
}

export interface PortfolioState {
  watchlist: WatchlistToken[];
  totalValue: number;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
}

export interface TokensState {
  searchResults: TokenSearchResult[];
  trending: TokenSearchResult[];
  isSearching: boolean;
  searchQuery: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
