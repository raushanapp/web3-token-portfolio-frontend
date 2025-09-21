import React from 'react';
import SparklineComponent from '../common/sparkLine-component';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import type { Token, } from '../../types/token.types';

interface WatchlistTableProps {
  tokens: Token[];
  isLoading: string;
}

const WatchlistTableComponent: React.FC<WatchlistTableProps> = ({ tokens, isLoading }) => {
   console.log(tokens)
    function generateRandomNumber(min:number, max:number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
        
    }
    

    const twoDigitNumber = generateRandomNumber(99, 999);
    const handleRemoveToken = (id: string) => {
        console.log(id)
    }
  

  if (isLoading==="idle" || isLoading==="pending") {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" 
                  style={{ color: 'var(--color-text-secondary)' }}>Token</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>24h %</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>Sparkline (7d)</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>Holdings</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>Value</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="table-row">
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse" 
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 rounded animate-pulse"
                       style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tokens?.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             style={{ color: 'var(--color-text-tertiary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1H8a1 1 0 00-1 1v1m5 0V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1" />
        </svg>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          No tokens in watchlist
        </h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Add some tokens to start tracking your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-background-tertiary)' }}>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>Token</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>24h %</th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>Sparkline (7d)</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>Holdings</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}>Value</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}></th>
          </tr>
        </thead>
        <tbody>
          {tokens?.map((token) => {
            const isPositive = token?.price_change_percentage_24h >= 0;

            return (
              <tr key={token.id} className="table-row">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-8 w-8 rounded-full" src={token.image} alt={token.name} />
                    <div className="ml-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {token.name}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {token.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm"
                    style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(token.current_price)}
                </td>
                
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${
                  isPositive ? 'price-positive' : 'price-negative'
                }`}>
                  <div className="flex items-center justify-end gap-1">
                    {isPositive ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V8m0 9H8" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7L7.8 16.2M7 7v9m0-9h9" />
                      </svg>
                    )}
                    {isPositive ? '+' : ''}{formatPercentage(token.price_change_percentage_24h)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="w-20 h-8 mx-auto">
                    <SparklineComponent 
                      data={token?.sparkline_in_7d?.price} 
                      color={isPositive ? '#84cc16' : '#ef4444'}
                    />
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {(token.current_price / twoDigitNumber).toFixed(2)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm"
                    style={{ color: 'var(--color-text-primary)' }}>
                  {formatCurrency(token?.current_price)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleRemoveToken(token.id)}
                    style={{ color: 'var(--color-text-tertiary)' }}
                    className="hover:text-red-500"
                  >
                    {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg> */}
                            ....
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WatchlistTableComponent;
