// tokens.types.ts
export interface Token {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
  last_updated?: string;
}

export interface WatchlistToken extends Token {
  holdings: number;     // Amount of tokens held
  value: number;        // current_price * holdings
  dateAdded: string;   // When added to portfolio
}

export interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

export interface TrendingToken {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    slug: string;
    price_btc: number;
    score: number;
  };
}
