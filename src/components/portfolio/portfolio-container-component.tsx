import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useAccount, useBalance, } from 'wagmi';
import DonutChartComponent from '../chart/donutChart-component';

// Token configuration for your supported chains (moved outside component to prevent re-creation)
const TOKEN_CONFIG: Record<number, Array<{symbol: string; address: string | null; name: string; color: string}>> = {
  // Ethereum Mainnet
  1: [
    { symbol: 'ETH', address: null, name: 'Ethereum', color: '#627EEA' },
    { symbol: 'BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'Wrapped Bitcoin', color: '#F7931A' },
    { symbol: 'DOGE', address: '0x4206931337dc273a630d328dA6441786BfaD668f', name: 'Dogecoin', color: '#C2A633' },
    { symbol: 'SOL', address: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c', name: 'Wrapped Solana', color: '#00FFA3' },
  ],
  // Polygon
  137: [
    { symbol: 'MATIC', address: null, name: 'Polygon', color: '#8247E5' },
    { symbol: 'ETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', name: 'Ethereum', color: '#627EEA' },
  ],
};

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  formatted: string;
  decimals: number;
  address: string | null;
  color: string;
  usdValue?: number;
}

interface PortfolioContainerProps {
  className?: string;
}

const PortfolioContainer: React.FC<PortfolioContainerProps> = ({ className }) => {
  const { address, isConnected, chainId } = useAccount();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Get supported tokens for current chain (memoized to prevent re-creation)
  const supportedTokens = useMemo(() => {
    if (!chainId || !TOKEN_CONFIG[chainId]) return [];
    return TOKEN_CONFIG[chainId];
  }, [chainId]);

  // Create stable token symbol string for price fetching
  const tokenSymbolsString = useMemo(() => 
    supportedTokens.map(token => token.symbol.toLowerCase()).join(','),
    [supportedTokens]
  );

  // Fetch token prices with proper dependency management
  const fetchTokenPrices = useCallback(async () => {
    if (!tokenSymbolsString) return;
    
    try {
      // Use CoinGecko IDs instead of symbols for better accuracy
      const coinGeckoIds: Record<string, string> = {
        'eth': 'ethereum',
        'btc': 'bitcoin', 
        'doge': 'dogecoin',
        'sol': 'solana',
        'matic': 'polygon'
      };
      
      const symbols = supportedTokens.map(token => 
        coinGeckoIds[token.symbol.toLowerCase()] || token.symbol.toLowerCase()
      ).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`
      );
      const prices = await response.json();
      
      const priceMap: Record<string, number> = {};
      supportedTokens.forEach(token => {
        const geckoId = coinGeckoIds[token.symbol.toLowerCase()] || token.symbol.toLowerCase();
        if (prices[geckoId]) {
          priceMap[token.symbol] = prices[geckoId].usd;
        }
      });
      
      setTokenPrices(priceMap);
    } catch (error) {
      console.error('Error fetching token prices:', error);
    }
  }, [supportedTokens, tokenSymbolsString]);

  // Fetch prices only when supported tokens change
  useEffect(() => {
    if (supportedTokens.length > 0) {
      fetchTokenPrices();
    }
  }, [fetchTokenPrices, supportedTokens.length]); // Use length instead of full array

  // Individual balance hooks for each supported token
  const balanceResults = supportedTokens.map(token => 
    useBalance({
      address,
      token: token.address as `0x${string}` | undefined,
      enabled: isConnected && !!address && !!chainId,
      watch: false, // Disable auto-watching to prevent continuous updates
      // query: {
      //   refetchInterval: 30000, // Refetch every 30 seconds instead of watching
      // }
    })
  );

  // Process balance data with proper dependency management
  useEffect(() => {
    if (!isConnected || !address) {
      setTokenBalances([]);
      return;
    }

    const loadingStates = balanceResults.map(result => result.isLoading);
    const isAnyLoading = loadingStates.some(loading => loading);
    setIsLoading(isAnyLoading);

    // Only process if all balances are loaded and we have prices
    const allDataLoaded = balanceResults.every(result => 
      !result.isLoading && (result.data || result.error)
    );

    if (!allDataLoaded) return;

    const processedBalances: TokenBalance[] = supportedTokens
      .map((token, index) => {
        const balanceResult = balanceResults[index];
        const balance = balanceResult.data;
        
        if (!balance || parseFloat(balance.formatted) === 0) return null;

        const usdValue = tokenPrices[token.symbol] 
          ? parseFloat(balance.formatted) * tokenPrices[token.symbol]
          : 0;

        return {
          symbol: token.symbol,
          name: token.name,
          balance: balance.value.toString(),
          formatted: balance.formatted,
          decimals: balance.decimals,
          address: token.address,
          color: token.color,
          usdValue,
        };
      })
      .filter((token): token is TokenBalance => token !== null);

    setTokenBalances(processedBalances);
    
  }, [
    isConnected,
    address,
    chainId,
    // Create stable references for balance results
    ...balanceResults.map(result => result.data?.formatted),
    ...balanceResults.map(result => result.isLoading),
    // Use stable price reference
    JSON.stringify(tokenPrices),
    supportedTokens.length
  ]);

  // Calculate portfolio allocations with stable dependencies
  const portfolioAllocations = useMemo(() => {
    if (tokenBalances.length === 0) return [];

    const totalValue = tokenBalances.reduce((sum, token) => sum + (token.usdValue || 0), 0);
    
    if (totalValue === 0) return [];

    return tokenBalances.map((token, index) => ({
      id: `${token.symbol}-${index}`,
      name: token.name,
      symbol: token.symbol,
      value: token.usdValue || 0,
      percentage: ((token.usdValue || 0) / totalValue) * 100,
      holdings: parseFloat(token.formatted),
      current_price: tokenPrices[token.symbol] || 0,
      color: token.color,
    }));
  }, [tokenBalances, tokenPrices]);

  const totalPortfolioValue = useMemo(() => {
    return portfolioAllocations.reduce((sum, allocation) => sum + allocation.value, 0);
  }, [portfolioAllocations]);

  // Show connection prompt if wallet not connected
  if (!isConnected) {
    return (
      <div 
        className={`p-6 rounded-xl ${className}`}
        style={{ 
          backgroundColor: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-primary)'
        }}
      >
        <h3 className="text-sm font-medium uppercase tracking-wide mb-4" 
            style={{ color: 'var(--color-text-secondary)' }}>
          Portfolio Total
        </h3>
        <div className="flex items-center justify-center h-64" 
             style={{ color: 'var(--color-text-secondary)' }}>
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm mb-2">Connect your wallet to view portfolio</p>
            <p className="text-xs opacity-75">Wallet connection required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DonutChartComponent 
      allocations={portfolioAllocations}
      isLoading={isLoading}
      totalValue={totalPortfolioValue}
    />
  );
};

export default PortfolioContainer;
