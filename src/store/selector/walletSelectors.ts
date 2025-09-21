import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { PortfolioSummary } from '../../types/portfolio.types';
import { coinGeckoApi } from '../../service/coinGeckoApi';

export const selectWallet = (state: RootState) => state.portfolio;
export const selectPortfolio = (state: RootState) => state.portfolio.portfolio;
export const selectWatchlist = (state: RootState) => state.portfolio.watchlist;
export const selectMarketTokens = (state: RootState) => state.portfolio.marketTokens;
export const selectSearchResults = (state: RootState) => state.portfolio.searchResults;
export const selectTrendingTokens = (state: RootState) => state.portfolio.trendingTokens;
export const selectSearchQuery = (state: RootState) => state.portfolio.searchQuery;

export const selectPortfolioLoading = (state: RootState) => state.portfolio.loading.portfolio;
export const selectWatchlistLoading = (state: RootState) => state.portfolio.loading.watchlist;
export const selectMarketTokensLoading = (state: RootState) => state.portfolio.loading.marketTokens;
export const selectAddTokenLoading = (state: RootState) => state.portfolio.loading.addToken;

export const selectPortfolioError = (state: RootState) => state.portfolio.error.portfolio;
export const selectWatchlistError = (state: RootState) => state.portfolio.error.watchlist;
export const selectMarketTokensError = (state: RootState) => state.portfolio.error.marketTokens;
export const selectAddTokenError = (state: RootState) => state.portfolio.error.addToken;


export const selectWalletConnection = (state: RootState) => ({
  isConnected: state.portfolio.isConnected,
  address: state.portfolio.address,
  chainId: state.portfolio.chainId,
  balance: state.portfolio.balance,
  ensName: state.portfolio.ensName,
  connector: state.portfolio.connector,
});

export const selectLastUpdated = (state: RootState) => state.portfolio.lastUpdated;

export const selectPortfolioSummary = createSelector(
  [selectPortfolio],
  (portfolio): PortfolioSummary => {
    if (portfolio.length === 0) {
        return {
        totalValue: 0,
        totalChange24h: 0,
        totalChangePercent24h: 0,
        topGainer: null,
        topLoser: null,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Calculate total portfolio value
    const totalValue = portfolio.reduce((sum, token) => {
      return sum + (token.value || 0);
    }, 0);
    
    // Calculate total 24h change in USD
    const totalChange24h = portfolio.reduce((sum, token) => {
      if (!token.price_change_percentage_24h || !token.value) return sum;
      const change24h = (token.price_change_percentage_24h / 100) * token.value;
      return sum + change24h;
    }, 0);

    // Calculate percentage change (corrected formula)
    const totalChangePercent24h = totalValue > 0 ? 
      (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

    // ✅ FIXED: Properly sort to find top gainer and loser
    // const sortedByChange = [...portfolio]
    //   .filter(token => token.price_change_percentage_24h != null)
    //   .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));

    return {
      totalValue,
      totalChange24h,
      totalChangePercent24h,
      topGainer:  null,
      topLoser:  null,
      lastUpdated: new Date().toISOString(),
    };
  }
);


export const selectPortfolioAllocation = createSelector(
  [selectPortfolio],
  (portfolio) => {
    if (portfolio.length === 0) {
      return [];
    }

    return coinGeckoApi.calculatePortfolioAllocation(portfolio);
  }
);


export const selectIsTokenInPortfolio = createSelector(
  [selectPortfolio, (_: RootState, tokenId: string) => tokenId],
  (portfolio, tokenId) => portfolio.some(token => token.id === tokenId)
);

export const selectIsTokenInWatchlist = createSelector(
  [selectWatchlist, (_: RootState, tokenId: string) => tokenId],
  (watchlist, tokenId) => watchlist.some(token => token.id === tokenId)
);

export const selectPortfolioTokenById = createSelector(
  [selectPortfolio, (_: RootState, tokenId: string) => tokenId],
  (portfolio, tokenId) => portfolio.find(token => token.id === tokenId) || null
);

export const selectAllLoadingStates = createSelector(
  [
    selectPortfolioLoading,
    selectWatchlistLoading,
    selectMarketTokensLoading,
    selectAddTokenLoading
  ],
  (portfolio, watchlist, marketTokens, addToken) => ({
    portfolio,
    watchlist,
    marketTokens,
    addToken,
    isAnyLoading: [portfolio, watchlist, marketTokens, addToken].includes('loading'),
  })
);

export const selectAllErrors = createSelector(
  [
    selectPortfolioError,
    selectWatchlistError,
    selectMarketTokensError,
    selectAddTokenError
  ],
  (portfolio, watchlist, marketTokens, addToken) => ({
    portfolio,
    watchlist,
    marketTokens,
    addToken,
    hasErrors: Boolean(portfolio || watchlist || marketTokens || addToken),
  })
);

export const selectAllTokens = createSelector(
  [selectPortfolio, selectWatchlist, selectMarketTokens],
  (portfolio, watchlist, marketTokens) => {
    const allTokens = new Map();
    
    // Add portfolio tokens (highest priority)
    portfolio.forEach(token => {
      allTokens.set(token.id, { 
        ...token, 
        source: 'portfolio' as const,
        inPortfolio: true,
        inWatchlist: false,
      });
    });
    
    // Add watchlist tokens (medium priority)
    watchlist.forEach(token => {
      if (!allTokens.has(token.id)) {
        allTokens.set(token.id, { 
          ...token, 
          source: 'watchlist' as const,
          inPortfolio: false,
          inWatchlist: true,
        });
      } else {
        // Mark as also in watchlist if already in portfolio
        const existing = allTokens.get(token.id);
        existing.inWatchlist = true;
      }
    });
    
    // Add market tokens (lowest priority)
    marketTokens.forEach(token => {
      if (!allTokens.has(token.id)) {
        allTokens.set(token.id, { 
          ...token, 
          source: 'market' as const,
          inPortfolio: false,
          inWatchlist: false,
        });
      }
    });
    
    return Array.from(allTokens.values());
  }
);

export const selectNeedsRefresh = createSelector(
  [selectLastUpdated],
  (lastUpdated) => {
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
    const now = Date.now();
    
    return {
      portfolio: !lastUpdated.portfolio || (now - lastUpdated.portfolio) > REFRESH_INTERVAL,
      watchlist: !lastUpdated.watchlist || (now - lastUpdated.watchlist) > REFRESH_INTERVAL,
      marketTokens: !lastUpdated.marketTokens || (now - lastUpdated.marketTokens) > REFRESH_INTERVAL,
      shouldRefreshAny: function() {
        return this.portfolio || this.watchlist || this.marketTokens;
      }
    };
  }
);

export const selectSearchState = createSelector(
  [selectSearchQuery, selectSearchResults],
  (query, results) => ({
    query,
    results,
    hasResults: results.length > 0,
    isSearching: query.length >= 2,
  })
);

export const selectPortfolioMetrics = createSelector(
  [selectPortfolio],
  (portfolio) => {
    if (portfolio.length === 0) {
      return {
        totalTokens: 0,
        gainers: 0,
        losers: 0,
        neutral: 0,
      };
    }

    const gainers = portfolio.filter(token => (token.price_change_percentage_24h || 0) > 0).length;
    const losers = portfolio.filter(token => (token.price_change_percentage_24h || 0) < 0).length;
    const neutral = portfolio.filter(token => (token.price_change_percentage_24h || 0) === 0).length;

    return {
      totalTokens: portfolio.length,
      gainers,
      losers,
      neutral,
    };
  }
);

