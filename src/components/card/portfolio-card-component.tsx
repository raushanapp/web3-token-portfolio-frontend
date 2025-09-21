// import React from 'react';
// import { useAppSelector } from '../../store/index';
// import { formatCurrency, formatPercentage } from '../../utils/formatters';

// interface PortfolioCardProps {
//   lastUpdated: string | null;
// }

// const PortfolioCard: React.FC<PortfolioCardProps> = ({ lastUpdated }) => {
//   const { summary, isLoading } = useAppSelector(state => state.portfolio);
//   const { totalValue, totalChange24h, totalChangePercentage24h } = summary;

//   const isPositive = totalChange24h >= 0;

//   return (
//     <div className="portfolio-card">
//       <div className="mb-4">
//         <h3 className="text-sm font-medium uppercase tracking-wide mb-2" 
//             style={{ color: 'var(--color-text-secondary)' }}>
//           Portfolio Total
//         </h3>
//         <div className="mb-4">
//           {isLoading ? (
//             <div className="h-12 w-48 rounded animate-pulse" 
//                  style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
//           ) : (
//             <p className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
//               {formatCurrency(totalValue)}
//             </p>
//           )}
//         </div>
        
//         {!isLoading && (
//           <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
//             isPositive ? 'price-positive' : 'price-negative'
//           }`} style={{
//             backgroundColor: isPositive ? 'rgba(132, 204, 22, 0.1)' : 'rgba(239, 68, 68, 0.1)'
//           }}>
//             <svg 
//               className={`w-4 h-4 mr-1 ${isPositive ? 'rotate-0' : 'rotate-180'}`} 
//               fill="currentColor" 
//               viewBox="0 0 20 20"
//             >
//               <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
//             </svg>
//             {isPositive ? '+' : ''}{formatCurrency(Math.abs(totalChange24h))} ({formatPercentage(Math.abs(totalChangePercentage24h))})
//           </div>
//         )}
//       </div>

//       {lastUpdated && (
//         <div className="w-full h-1 rounded-full mb-2" 
//              style={{ backgroundColor: 'var(--color-success-500)' }}>
//         </div>
//       )}
      
//       <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
//         {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
//       </div>
//     </div>
//   );
// };

// export default PortfolioCard;


// src/components/card/portfolio-card-component.tsx
import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/index';
import { 
  selectPortfolioSummary, 
  selectPortfolioLoading,
  selectLastRefresh 
} from '../../store/slices/portfolioSlice';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PortfolioCardProps {
  lastUpdated?: string | null;
  summary?: {
    totalValue: number;
    totalChange24h: number;
    totalChangePercentage24h: number;
    lastUpdated: string;
  };
  isLoading?: boolean;
  showLastRefresh?: boolean;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ 
  lastUpdated,
  summary: propSummary,
  isLoading: propIsLoading,
//   showLastRefresh = true
}) => {
  // Use Redux selectors with fallback to props
  const reduxSummary = useAppSelector(selectPortfolioSummary);
  const reduxLoading = useAppSelector(selectPortfolioLoading);
  const lastRefresh = useAppSelector(selectLastRefresh);
  
  // Determine which data to use
  const summary = propSummary || reduxSummary;
  const isLoading = propIsLoading !== undefined ? propIsLoading : reduxLoading;
  
  const { totalValue, totalChange24h, totalChangePercentage24h } = summary;

  // Memoized calculations
  const isPositive = useMemo(() => totalChange24h >= 0, [totalChange24h]);
  const hasValue = useMemo(() => totalValue > 0, [totalValue]);
  
  // Format display timestamp
  const displayTimestamp = useMemo(() => {
    const timestamp = lastUpdated || lastRefresh || summary.lastUpdated;
    if (!timestamp) return null;
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return null;
    }
  }, [lastUpdated, lastRefresh, summary.lastUpdated]);

  return (
    <div 
      className="p-6 rounded-xl"
      style={{ 
        backgroundColor: 'var(--color-background-secondary)',
        border: '1px solid var(--color-border-primary)'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-medium uppercase tracking-wide mb-4" 
            style={{ color: 'var(--color-text-secondary)' }}>
          Portfolio Total
        </h3>

        {/* Main value display */}
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 w-64 rounded animate-pulse" 
                 style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
            <div className="h-6 w-32 rounded animate-pulse" 
                 style={{ backgroundColor: 'var(--color-background-tertiary)' }}></div>
          </div>
        ) : (
          <>
            <div className="text-5xl font-bold mb-3" 
                 style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(totalValue)}
            </div>
            
            {/* 24h Change Display */}
            {hasValue && (
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                isPositive ? 'price-positive' : 'price-negative'
              }`} style={{
                backgroundColor: isPositive 
                  ? 'rgba(132, 204, 22, 0.15)' 
                  : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${isPositive 
                  ? 'rgba(132, 204, 22, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                <svg 
                  className={`w-4 h-4 mr-2 transition-transform ${isPositive ? 'rotate-0' : 'rotate-180'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>
                  {isPositive ? '+' : ''}{formatCurrency(Math.abs(totalChange24h))}
                </span>
                <span className="ml-1 opacity-75">
                  ({formatPercentage(Math.abs(totalChangePercentage24h))})
                </span>
              </div>
            )}

            {/* Empty state */}
            {!hasValue && !isLoading && (
              <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Add tokens to your watchlist to see your portfolio value
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with timestamp */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
        <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {displayTimestamp ? `Last updated: ${displayTimestamp}` : 'No recent updates'}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;


