import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { coinGeckoApi } from '../../service/coinGeckoApi';
import type { WalletState } from '../../types/wallet.types';
import type { Token } from '../../types/token.types';

// ✅ Properly typed initial state
const initialState: WalletState = {
  portfolio: [],
  watchlist: [],
  marketTokens: [],
  loading: {
    portfolio: 'idle',
    watchlist: 'idle',
    marketTokens: 'idle',
    addToken: 'idle',
  },
  error: {
    portfolio: null,
    watchlist: null,
    marketTokens: null,
    addToken: null,
  },
  searchResults: [],
  trendingTokens: [],
  searchQuery: '',
  lastUpdated: {
    portfolio: null,
    watchlist: null,
    marketTokens: null,
  },
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  ensName: null,
    connector: null,
  chain:null
};


// Updated fetchPortfolioTokens in your portfolio slice
export const fetchPortfolioTokens = createAsyncThunk(
  'wallet/fetchPortfolioTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wallet: WalletState };
      
      // Extract portfolio data (id + holdings)
      const portfolioData = state.wallet.portfolio.map(token => ({
        id: token.id,
        holdings: token.holdings || 0
      }));
      
      if (portfolioData.length === 0) {
        return [];
      }

      // ✅ Use the new method from your API service
      const portfolioTokens = await coinGeckoApi.getPortfolioTokens(portfolioData);
      
      return portfolioTokens;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch portfolio');
    }
  }
);


// ✅ Improved Watchlist Tokens Fetch
export const fetchWatchlistTokens = createAsyncThunk(
  'wallet/fetchWatchlistTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wallet: WalletState };
      const watchlistIds = state.wallet.watchlist.map(token => token.id);
      
      if (watchlistIds.length === 0) {
        return [];
      }

      const marketData = await coinGeckoApi.getCoinsMarkets({
        ids: watchlistIds.join(','),
        vs_currency: 'usd',
        sparkline: true,
        price_change_percentage: '24h',
      });

      return marketData.map(data => coinGeckoApi.transformMarketDataToToken(data));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch watchlist');
    }
  }
);

// ✅ Market Tokens Fetch
export const fetchMarketTokens = createAsyncThunk(
  'wallet/fetchMarketTokens',
  async (params: { per_page?: number; page?: number } = {}, { rejectWithValue }) => {
    try {
      const marketData = await coinGeckoApi.getCoinsMarkets({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: params.per_page || 50,
        page: params.page || 1,
        sparkline: true,
        price_change_percentage: '24h',
      });

      return marketData.map(data => coinGeckoApi.transformMarketDataToToken(data));
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch market data');
    }
  }
);

// ✅ Search Tokens
export const searchTokens = createAsyncThunk(
  'wallet/searchTokens',
  async (query: string, { rejectWithValue }) => {
    try {
      if (query.trim().length < 2) {
        return [];
      }

      const searchResult = await coinGeckoApi.searchCoins(query);
      return searchResult.coins;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search tokens');
    }
  }
);

// ✅ Trending Tokens
export const fetchTrendingTokens = createAsyncThunk(
  'wallet/fetchTrendingTokens',
  async (_, { rejectWithValue }) => {
    try {
      const trendingResult = await coinGeckoApi.getTrendingCoins();
      return trendingResult.coins;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch trending tokens');
    }
  }
);

// ✅ Improved Add Token to Portfolio
export const addTokenToPortfolio = createAsyncThunk(
  'wallet/addTokenToPortfolio',
  async (
    { tokenId, holdings }: { tokenId: string; holdings: number },
    { rejectWithValue }
  ) => {
    try {
      const marketData = await coinGeckoApi.getCoinsMarkets({
        ids: tokenId,
        vs_currency: 'usd',
        sparkline: true,
        price_change_percentage: '24h',
      });

      if (marketData.length === 0) {
        throw new Error('Token not found');
      }

      const token = marketData[0];
      const value = token.current_price * holdings;

      return {
        ...token,
        holdings: holdings,
        value: value,
        dateAdded: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add token to portfolio');
    }
  }
);

// ✅ Properly typed slice
const portfolioSLice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // Portfolio actions
    updateTokenHoldings: (
      state,
      action: PayloadAction<{ tokenId: string; holdings: number }>
    ) => {
      const { tokenId, holdings } = action.payload;
      const tokenIndex = state.portfolio.findIndex(token => token.id === tokenId);
      
      if (tokenIndex !== -1) {
        const token = state.portfolio[tokenIndex];
        token.holdings = holdings;
        token.value = token.current_price * holdings;
      }
    },

    removeFromPortfolio: (state, action: PayloadAction<string>) => {
      state.portfolio = state.portfolio.filter(token => token.id !== action.payload);
    },

    // Watchlist actions
    addToWatchlist: (state, action: PayloadAction<Token>) => {
      const exists = state.watchlist.some(token => token.id === action.payload.id);
      if (!exists) {
        state.watchlist.push(action.payload);
      }
    },

    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(token => token.id !== action.payload);
    },

    // Search actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      if (action.payload.trim().length < 2) {
        state.searchResults = [];
      }
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },

    // Error management
    clearError: (state, action: PayloadAction<keyof WalletState['error']>) => {
      state.error[action.payload] = null;
    },

    clearAllErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key as keyof WalletState['error']] = null;
      });
    },

    // Reset actions
    resetPortfolio: (state) => {
      state.portfolio = [];
      state.loading.portfolio = 'idle';
      state.error.portfolio = null;
      state.lastUpdated.portfolio = null;
    },

    resetWatchlist: (state) => {
      state.watchlist = [];
      state.loading.watchlist = 'idle';
      state.error.watchlist = null;
      state.lastUpdated.watchlist = null;
    },

    // Wallet connection actions
    setWalletConnection: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        address?: string | null;
        chainId?: number | null;
        balance?: string | null;
        ensName?: string | null;
          connector?: string | null;
        chain?:string | null
      }>
    ) => {
      const { isConnected, address, chainId, balance, ensName, connector,chain } = action.payload;
      state.isConnected = isConnected;
      state.address = address || null;
      state.chainId = chainId || null;
      state.balance = balance || null;
      state.ensName = ensName || null;
        state.connector = connector || null;
        state.chain=chain || null
    },

    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.balance = null;
      state.ensName = null;
        state.connector = null;
        state.chain=null
    },
  },

  extraReducers: (builder) => {
    // ✅ Portfolio tokens with proper typing
    builder
      .addCase(fetchPortfolioTokens.pending, (state) => {
        state.loading.portfolio = 'loading';
        state.error.portfolio = null;
      })
      .addCase(fetchPortfolioTokens.fulfilled, (state, action) => {
          state.loading.portfolio = 'succeeded';
          console.log(action.payload,)
        state.portfolio = action.payload;
        state.lastUpdated.portfolio = Date.now();
      })
      .addCase(fetchPortfolioTokens.rejected, (state, action) => {
        state.loading.portfolio = 'failed';
        state.error.portfolio = action.payload as string;
      });

    // ✅ Watchlist tokens
    builder
      .addCase(fetchWatchlistTokens.pending, (state) => {
        state.loading.watchlist = 'loading';
        state.error.watchlist = null;
      })
      .addCase(fetchWatchlistTokens.fulfilled, (state, action) => {
        state.loading.watchlist = 'succeeded';
        state.watchlist = action.payload;
        state.lastUpdated.watchlist = Date.now();
      })
      .addCase(fetchWatchlistTokens.rejected, (state, action) => {
        state.loading.watchlist = 'failed';
        state.error.watchlist = action.payload as string;
      });

    // ✅ Market tokens
    builder
      .addCase(fetchMarketTokens.pending, (state) => {
        state.loading.marketTokens = 'loading';
        state.error.marketTokens = null;
      })
      .addCase(fetchMarketTokens.fulfilled, (state, action) => {
        state.loading.marketTokens = 'succeeded';
        state.marketTokens = action.payload;
        state.lastUpdated.marketTokens = Date.now();
      })
      .addCase(fetchMarketTokens.rejected, (state, action) => {
        state.loading.marketTokens = 'failed';
        state.error.marketTokens = action.payload as string;
      });

    // ✅ Search tokens
    builder
      .addCase(searchTokens.pending, () => {
        // Optional: Add loading state for search if needed
        // state.loading.search = 'loading';
      })
      .addCase(searchTokens.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(searchTokens.rejected, (state, action) => {
        state.searchResults = [];
        state.error.marketTokens = action.payload as string;
      });

    // ✅ Trending tokens
    builder
      .addCase(fetchTrendingTokens.fulfilled, (state, action) => {
        state.trendingTokens = action.payload;
      })
      .addCase(fetchTrendingTokens.rejected, ( action) => {
        console.error('Failed to fetch trending tokens:', action);
      });

    // ✅ Add token to portfolio
    builder
      .addCase(addTokenToPortfolio.pending, (state) => {
        state.loading.addToken = 'loading';
        state.error.addToken = null;
      })
      .addCase(addTokenToPortfolio.fulfilled, (state, action) => {
        state.loading.addToken = 'succeeded';
        
        // Remove from watchlist if it exists
        state.watchlist = state.watchlist.filter(token => token.id !== action.payload.id);
        
        // Add to portfolio or update existing
        const existingIndex = state.portfolio.findIndex(token => token.id === action.payload.id);
        if (existingIndex !== -1) {
          state.portfolio[existingIndex] = action.payload;
        } else {
          state.portfolio.push(action.payload);
        }
      })
      .addCase(addTokenToPortfolio.rejected, (state, action) => {
        state.loading.addToken = 'failed';
        state.error.addToken = action.payload as string;
      });
  },
});

export const {
  updateTokenHoldings,
  removeFromPortfolio,
  addToWatchlist,
  removeFromWatchlist,
  setSearchQuery,
  clearSearchResults,
  clearError,
  clearAllErrors,
  resetPortfolio,
  resetWatchlist,
  setWalletConnection,
  disconnectWallet,
} = portfolioSLice.actions;

export default portfolioSLice.reducer;

export type WalletSliceState = typeof initialState;

