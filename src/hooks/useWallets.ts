import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import type { AppDispatch, } from '../store';
import {
  fetchPortfolioTokens,
  fetchWatchlistTokens,
  fetchMarketTokens,
  searchTokens,
  fetchTrendingTokens,
  addTokenToPortfolio,
  updateTokenHoldings,
  removeFromPortfolio,
  addToWatchlist,
  removeFromWatchlist,
  setSearchQuery,
  clearSearchResults,
  clearError,
} from '../store/slices/portfolioSlice';
import {
  selectPortfolio,
  selectWatchlist,
  selectMarketTokens,
  selectPortfolioSummary,
  selectSearchResults,
  selectTrendingTokens,
  selectPortfolioLoading,
  selectWatchlistLoading,
  selectMarketTokensLoading,
  selectPortfolioError,
  selectWatchlistError,
  selectPortfolioAllocation, // ✅ ADD THIS LINE
  selectNeedsRefresh,
} from '../store/selector/walletSelectors';
import type { Token } from '../types/token.types';



export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const portfolio = useSelector(selectPortfolio);
  const watchlist = useSelector(selectWatchlist);
  const marketTokens = useSelector(selectMarketTokens);
  const portfolioSummary = useSelector(selectPortfolioSummary);
  const portfolioAllocation = useSelector(selectPortfolioAllocation); 
  const searchResults = useSelector(selectSearchResults);
  const trendingTokens = useSelector(selectTrendingTokens);
  
  // Loading states
  const portfolioLoading = useSelector(selectPortfolioLoading);
  const watchlistLoading = useSelector(selectWatchlistLoading);
  const marketTokensLoading = useSelector(selectMarketTokensLoading);
  
  // Errors
  const portfolioError = useSelector(selectPortfolioError);
  const watchlistError = useSelector(selectWatchlistError);
  
  console.log("Portfolio Allocation:", portfolioAllocation); // ✅ Debug log
  
  // Refresh status
  const needsRefresh = useSelector(selectNeedsRefresh);

  // ✅ Use useCallback for callable functions
  const refreshPortfolio = useCallback(() => {
    console.log("Refreshing Portfolio...");
    dispatch(fetchPortfolioTokens());
  }, [dispatch]);

  const refreshWatchlist = useCallback(() => {
    dispatch(fetchWatchlistTokens());
  }, [dispatch]);

  const refreshMarketData = useCallback((params?: { per_page?: number; page?: number }) => {
    dispatch(fetchMarketTokens(params || {}));
  }, [dispatch]);

  const searchForTokens = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim().length >= 2) {
      dispatch(searchTokens(query));
    }
  }, [dispatch]);

  const loadTrendingTokens = useCallback(() => {
    dispatch(fetchTrendingTokens());
  }, [dispatch]);

  const addTokenWithHoldings = useCallback((tokenId: string, holdings: number) => {
    dispatch(addTokenToPortfolio({ tokenId, holdings }));
  }, [dispatch]);

  const updateHoldings = useCallback((tokenId: string, holdings: number) => {
    dispatch(updateTokenHoldings({ tokenId, holdings }));
  }, [dispatch]);

  const removeFromPortfolioAction = useCallback((tokenId: string) => {
    dispatch(removeFromPortfolio(tokenId));
  }, [dispatch]);

  const addToWatchlistAction = useCallback((token: Token) => {
    dispatch(addToWatchlist(token));
  }, [dispatch]);

  const removeFromWatchlistAction = useCallback((tokenId: string) => {
    dispatch(removeFromWatchlist(tokenId));
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const clearPortfolioError = useCallback(() => {
    dispatch(clearError('portfolio'));
  }, [dispatch]);

  const clearWatchlistError = useCallback(() => {
    dispatch(clearError('watchlist'));
  }, [dispatch]);

  // ✅ Use useEffect for automatic side effects (not returned functions)
  useEffect(() => {
    // Auto-load initial data when hook mounts
    if (portfolio.length === 0) {
      refreshPortfolio();
    }
    if (marketTokens.length === 0) {
      refreshMarketData();
    }
    loadTrendingTokens();
  }, []);

  // Auto-refresh logic
  const refreshIfNeeded = useCallback(() => {
    if (needsRefresh.portfolio) {
      refreshPortfolio();
    }
    if (needsRefresh.watchlist) {
      refreshWatchlist();
    }
    if (needsRefresh.marketTokens) {
      refreshMarketData();
    }
  }, []);

  return {
    // Data
    portfolio,
    watchlist,
    marketTokens,
    portfolioSummary,
    portfolioAllocation, // ✅ ADD THIS
    searchResults,
    trendingTokens,

    // Loading states
    loading: {
      portfolio: portfolioLoading,
      watchlist: watchlistLoading,
      marketTokens: marketTokensLoading,
    },

    // Errors
    errors: {
      portfolio: portfolioError,
      watchlist: watchlistError,
    },

    // Actions (all callable functions)
    refreshPortfolio,
    refreshWatchlist,
    refreshMarketData,
    searchForTokens,
    loadTrendingTokens,
    addTokenWithHoldings,
    updateHoldings,
    removeFromPortfolio: removeFromPortfolioAction,
    addToWatchlist: addToWatchlistAction,
    removeFromWatchlist: removeFromWatchlistAction,
    clearSearch,
    clearPortfolioError,
    clearWatchlistError,
    refreshIfNeeded,
    needsRefresh,
  };
};
