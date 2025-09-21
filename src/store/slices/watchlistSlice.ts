// import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
// import { coinGeckoApi } from '../../service/coinGeckoApi';
// import { localStorageService } from '../../service/localStorage';
// import type { WatchlistToken } from '../../types/tokens.types';

// interface WatchlistState {
//   tokens: WatchlistToken[];
//   isLoading: boolean;
//   error: string | null;
//   lastUpdated: string | null;
//   page: number;
//   itemsPerPage: number;
//   totalItems: number;
// }

// const initialState: WatchlistState = {
//   tokens: [],
//   isLoading: false,
//   error: null,
//   lastUpdated: null,
//   page: 1,
//   itemsPerPage: 10,
//   totalItems: 0,
// };

// export const fetchWatchlistTokens = createAsyncThunk(
//   'watchlist/fetchTokens',
//   async (_, { rejectWithValue }) => {
//     try {
//       const watchlistIds = localStorageService.getWatchlist();
//       const holdings = localStorageService.getHoldings();
      
//       if (watchlistIds.length === 0) {
//         return [];
//       }

//       const marketData = await coinGeckoApi.getCoinsMarkets({
//         ids: watchlistIds.join(','),
//         vs_currency: 'usd',
//         order: 'market_cap_desc',
//         per_page: 250,
//         page: 1,
//         sparkline: true,
//         price_change_percentage: '24h',
//       });

//       const watchlistTokens: WatchlistToken[] = marketData.map(data => {
//         const token = coinGeckoApi.transformMarketDataToToken(data);
//         const tokenHoldings = holdings[token.id] || 0;
        
//         return {
//           ...token,
//           holdings: tokenHoldings,
//           value: token.current_price * tokenHoldings,
//         };
//       });

//       localStorageService.saveLastUpdate(new Date().toISOString());
      
//       return watchlistTokens;
//     } catch (error) {
//       console.error('Failed to fetch watchlist tokens:', error);
//       return rejectWithValue('Failed to fetch watchlist data');
//     }
//   }
// );

// export const addTokensToWatchlist = createAsyncThunk(
//   'watchlist/addTokens',
//   async (tokenIds: string[], { dispatch, rejectWithValue }) => {
//     try {
//       const currentWatchlist = localStorageService.getWatchlist();
//       const newTokenIds = tokenIds.filter(id => !currentWatchlist.includes(id));
      
//       if (newTokenIds.length === 0) {
//         return [];
//       }

//       const updatedWatchlist = [...currentWatchlist, ...newTokenIds];
//       localStorageService.saveWatchlist(updatedWatchlist);
      
//       // Refresh the watchlist to include new tokens
//       await dispatch(fetchWatchlistTokens());
      
//       return newTokenIds;
//     } catch (error) {
//       console.error('Failed to add tokens to watchlist:', error);
//       return rejectWithValue('Failed to add tokens to watchlist');
//     }
//   }
// );

// export const removeTokenFromWatchlist = createAsyncThunk(
//   'watchlist/removeToken',
//   async (tokenId: string, { dispatch, rejectWithValue }) => {
//     try {
//       const currentWatchlist = localStorageService.getWatchlist();
//       const updatedWatchlist = currentWatchlist.filter(id => id !== tokenId);
      
//       localStorageService.saveWatchlist(updatedWatchlist);
      
//       // Also remove holdings for this token
//       const holdings = localStorageService.getHoldings();
//       delete holdings[tokenId];
//       localStorageService.saveHoldings(holdings);
      
//       // Refresh the watchlist
//       await dispatch(fetchWatchlistTokens());
      
//       return tokenId;
//     } catch (error) {
//       console.error('Failed to remove token from watchlist:', error);
//       return rejectWithValue('Failed to remove token from watchlist');
//     }
//   }
// );

// export const updateTokenHoldings = createAsyncThunk(
//   'watchlist/updateHoldings',
//   async ({ tokenId, holdings }: { tokenId: string; holdings: number }, {  getState }) => {
//     try {
//       localStorageService.updateHolding(tokenId, holdings);
      
//       // Update local state immediately for better UX
//       const state = getState() as { watchlist: WatchlistState };
//       const token = state.watchlist.tokens.find(t => t.id === tokenId);
      
//       if (token) {
//         return {
//           tokenId,
//           holdings,
//           value: token.current_price * holdings,
//         };
//       }
      
//       return { tokenId, holdings, value: 0 };
//     } catch (error) {
//       console.error('Failed to update token holdings:', error);
//       throw error;
//     }
//   }
// );

// const watchlistSlice = createSlice({
//   name: 'watchlist',
//   initialState,
//   reducers: {
//     setPage: (state, action: PayloadAction<number>) => {
//       state.page = action.payload;
//     },
//     setItemsPerPage: (state, action: PayloadAction<number>) => {
//       state.itemsPerPage = action.payload;
//       state.page = 1; // Reset to first page when changing items per page
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     initializeFromStorage: (state) => {
//       const watchlistIds = localStorageService.getWatchlist();
//       const lastUpdate = localStorageService.getLastUpdate();
      
//       state.totalItems = watchlistIds.length;
//       state.lastUpdated = lastUpdate;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchWatchlistTokens.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchWatchlistTokens.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.tokens = action.payload;
//         state.totalItems = action.payload.length;
//         state.lastUpdated = new Date().toISOString();
//       })
//       .addCase(fetchWatchlistTokens.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })
//     //   .addCase(addTokensToWatchlist.fulfilled, (state, action) => {
//     //     // Tokens are added through fetchWatchlistTokens call
//     //   })
//     //   .addCase(removeTokenFromWatchlist.fulfilled, (state, action) => {
//     //     // Tokens are removed through fetchWatchlistTokens call
//     //   })
//       .addCase(updateTokenHoldings.fulfilled, (state, action) => {
//         const { tokenId, holdings, value } = action.payload;
//         const tokenIndex = state.tokens.findIndex(t => t.id === tokenId);
        
//         if (tokenIndex !== -1) {
//           state.tokens[tokenIndex].holdings = holdings;
//           state.tokens[tokenIndex].value = value;
//         }
//       });
//   },
// });

// export const { setPage, setItemsPerPage, clearError, initializeFromStorage } = watchlistSlice.actions;
// export default watchlistSlice.reducer;



import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { coinGeckoApi, transformMarketDataToWatchlistToken } from '../api/coinGeckoApi';
import { localStorageService } from '../../service/localStorage';
import type { WatchlistToken } from '../../types/token.types';

interface WatchlistState {
  tokens: WatchlistToken[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  page: number;
  itemsPerPage: number;
  totalItems: number;
}

const initialState: WatchlistState = {
  tokens: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  page: 1,
  itemsPerPage: 10,
  totalItems: 0,
};

// Enhanced thunk that uses RTK Query behind the scenes
export const fetchWatchlistTokens = createAsyncThunk(
  'watchlist/fetchTokens',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const watchlistIds = localStorageService.getWatchlist();
      const holdings = localStorageService.getHoldings();
      
      if (watchlistIds.length === 0) {
        return [];
      }

      // Use RTK Query to fetch market data
      const result = await dispatch(
        coinGeckoApi.endpoints.getMarketData.initiate({
          ids: watchlistIds.join(','),
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: watchlistIds.length,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h',
        })
      );

      if (result.error) {
        throw new Error('Failed to fetch market data');
      }

      const watchlistTokens: WatchlistToken[] = result.data?.map(data => 
        transformMarketDataToWatchlistToken(data, holdings[data.id] || 0)
      ) || [];

      localStorageService.saveLastUpdate(new Date().toISOString());
      
      return watchlistTokens;
    } catch (error) {
      console.error('Failed to fetch watchlist tokens:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch watchlist data');
    }
  }
);

// Add tokens to watchlist
export const addTokensToWatchlist = createAsyncThunk(
  'watchlist/addTokens',
  async (tokenIds: string[], { dispatch, rejectWithValue }) => {
    try {
      const currentWatchlist = localStorageService.getWatchlist();
      const newTokenIds = tokenIds.filter(id => !currentWatchlist.includes(id));
      
      if (newTokenIds.length === 0) {
        return [];
      }

      const updatedWatchlist = [...currentWatchlist, ...newTokenIds];
      localStorageService.saveWatchlist(updatedWatchlist);
      
      // Refresh the watchlist to include new tokens
      await dispatch(fetchWatchlistTokens());
      
      return newTokenIds;
    } catch (error) {
      console.error('Failed to add tokens to watchlist:', error);
      return rejectWithValue('Failed to add tokens to watchlist');
    }
  }
);

// Remove token from watchlist
export const removeTokenFromWatchlist = createAsyncThunk(
  'watchlist/removeToken',
  async (tokenId: string, { dispatch, rejectWithValue }) => {
    try {
      const currentWatchlist = localStorageService.getWatchlist();
      const updatedWatchlist = currentWatchlist.filter(id => id !== tokenId);
      
      localStorageService.saveWatchlist(updatedWatchlist);
      
      // Remove holdings for this token
      const holdings = localStorageService.getHoldings();
      delete holdings[tokenId];
      localStorageService.saveHoldings(holdings);
      
      // Refresh the watchlist
      await dispatch(fetchWatchlistTokens());
      
      return tokenId;
    } catch (error) {
      console.error('Failed to remove token from watchlist:', error);
      return rejectWithValue('Failed to remove token from watchlist');
    }
  }
);

// Update token holdings
export const updateTokenHoldings = createAsyncThunk(
  'watchlist/updateHoldings',
  async ({ tokenId, holdings }: { tokenId: string; holdings: number }, { getState }) => {
    try {
      localStorageService.updateHolding(tokenId, holdings);
      
      const state = getState() as { watchlist: WatchlistState };
      const token = state.watchlist.tokens.find(t => t.id === tokenId);
      
      if (token) {
        return {
          tokenId,
          holdings,
          value: token.current_price * holdings,
        };
      }
      
      return { tokenId, holdings, value: 0 };
    } catch (error) {
      console.error('Failed to update token holdings:', error);
      throw error;
    }
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeFromStorage: (state) => {
      const watchlistIds = localStorageService.getWatchlist();
      const lastUpdate = localStorageService.getLastUpdate();
      
      state.totalItems = watchlistIds.length;
      state.lastUpdated = lastUpdate;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist tokens
      .addCase(fetchWatchlistTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWatchlistTokens.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload;
        state.totalItems = action.payload.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchWatchlistTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add tokens
      .addCase(addTokensToWatchlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTokensToWatchlist.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addTokensToWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Remove tokens
      .addCase(removeTokenFromWatchlist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeTokenFromWatchlist.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(removeTokenFromWatchlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update holdings
      .addCase(updateTokenHoldings.fulfilled, (state, action) => {
        const { tokenId, holdings, value } = action.payload;
        const tokenIndex = state.tokens.findIndex(t => t.id === tokenId);
        
        if (tokenIndex !== -1) {
          state.tokens[tokenIndex].holdings = holdings;
          state.tokens[tokenIndex].value = value;
        }
      });
  },
});

export const { setPage, setItemsPerPage, clearError, initializeFromStorage } = watchlistSlice.actions;
export default watchlistSlice.reducer;
