import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import DonutChartComponent from '../chart/donutChart-component';

// ERC-20 ABI for balanceOf
const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

// Token configuration (unchanged)
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
  usdValue: number;
}

interface PortfolioContainerProps {
  className?: string;
}

const PortfolioContainer: React.FC<PortfolioContainerProps> = ({ className }) => {
  const { address, isConnected, chainId } = useAccount();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Get supported tokens for current chain
  const supportedTokens = useMemo(() => {
    if (!chainId || !TOKEN_CONFIG[chainId]) return [];
    return TOKEN_CONFIG[chainId];
  }, [chainId]);

  // Separate native and ERC-20 tokens
  const { nativeTokens, erc20Tokens } = useMemo(() => {
    const native = supportedTokens.filter(token => token.address === null);
    const erc20 = supportedTokens.filter(token => token.address !== null);
    return { nativeTokens: native, erc20Tokens: erc20 };
  }, [supportedTokens]);

  // Native token balance (ETH/MATIC)
  const nativeBalance = useBalance({
    address,
    query: {
      enabled: isConnected && !!address && !!chainId && nativeTokens.length > 0,
      refetchInterval: 30000,
    }
  });

  // ERC-20 token balances using useReadContracts
  const erc20Contracts = useMemo(() => {
    if (!address || erc20Tokens.length === 0) return [];
    
    return erc20Tokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf' as const,
      args: [address],
    }));
  }, [address, erc20Tokens]);

  const { data: erc20Balances, isLoading: isErc20Loading } = useReadContracts({
    contracts: erc20Contracts,
    query: {
      enabled: isConnected && !!address && !!chainId && erc20Contracts.length > 0,
      refetchInterval: 30000,
    }
  });

  // Fetch token prices
  const fetchTokenPrices = useCallback(async () => {
    if (supportedTokens.length === 0) return;
    
    try {
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
  }, [supportedTokens]);

  // Fetch prices when tokens change
  useEffect(() => {
    if (supportedTokens.length > 0) {
      fetchTokenPrices();
    }
  }, [fetchTokenPrices]);

  // Process all balance data
  useEffect(() => {
    if (!isConnected || !address) {
      setTokenBalances([]);
      return;
    }

    const isLoading = nativeBalance.isLoading || isErc20Loading;
    if (isLoading) return;

    const processedBalances: TokenBalance[] = [];

    // Process native token balance
    if (nativeBalance.data && parseFloat(nativeBalance.data.formatted) > 0 && nativeTokens[0]) {
      const nativeToken = nativeTokens[0];
      const usdValue = tokenPrices[nativeToken.symbol] 
        ? parseFloat(nativeBalance.data.formatted) * tokenPrices[nativeToken.symbol]
        : 0;

      processedBalances.push({
        symbol: nativeToken.symbol,
        name: nativeToken.name,
        balance: nativeBalance.data.value.toString(),
        formatted: nativeBalance.data.formatted,
        decimals: nativeBalance.data.decimals,
        address: nativeToken.address,
        color: nativeToken.color,
        usdValue,
      });
    }

    // Process ERC-20 token balances
    if (erc20Balances && erc20Balances.length > 0) {
      erc20Balances.forEach((balanceResult, index) => {
        if (balanceResult.status === 'success' && balanceResult.result) {
          const token = erc20Tokens[index];
          const balance = balanceResult.result as bigint;
          
          if (balance > 0n) {
            const formatted = formatUnits(balance, 18); // Adjust decimals as needed
            const usdValue = tokenPrices[token.symbol] 
              ? parseFloat(formatted) * tokenPrices[token.symbol]
              : 0;

            processedBalances.push({
              symbol: token.symbol,
              name: token.name,
              balance: balance.toString(),
              formatted,
              decimals: 18,
              address: token.address,
              color: token.color,
              usdValue,
            });
          }
        }
      });
    }

    setTokenBalances(processedBalances);
    
  }, [
    isConnected,
    address,
    chainId,
    nativeBalance.data,
    nativeBalance.isLoading,
    erc20Balances,
    isErc20Loading,
    tokenPrices,
    nativeTokens,
    erc20Tokens,
  ]);

  // Calculate portfolio allocations
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

  const isLoading = nativeBalance.isLoading || isErc20Loading;

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
