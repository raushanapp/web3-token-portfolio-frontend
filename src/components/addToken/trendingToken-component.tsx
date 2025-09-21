// import React, { useState, useEffect } from 'react';
// import { coinGeckoApi } from '../../service/coinGeckoApi';
// import type { TrendingToken } from '../../types/tokens.types';

// interface TrendingTokensProps {
//   selectedTokens: Set<string>;
//   onTokenSelect: (tokenId: string, isSelected: boolean) => void;
// }

// const TrendingTokens: React.FC<TrendingTokensProps> = ({ selectedTokens, onTokenSelect }) => {
//   const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrendingTokens = async () => {
//       try {
//         const response = await coinGeckoApi.getTrendingCoins();
//         setTrendingTokens(response.coins);
//       } catch (error) {
//         console.error('Failed to fetch trending tokens:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTrendingTokens();
//   }, []);

//   const handleTokenToggle = (token: TrendingToken) => {
//     const isSelected = selectedTokens.has(token.item.id);
//     onTokenSelect(token.item.id, !isSelected);
//   };

//   if (isLoading) {
//     return (
//       <div>
//         <h3 className="text-lg font-medium text-gray-900 mb-3">Trending Tokens</h3>
//         <div className="space-y-3">
//           {[...Array(7)].map((_, i) => (
//             <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
//               <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
//               <div className="flex-1">
//                 <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
//                 <div className="h-3 bg-gray-200 rounded w-16"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h3 className="text-lg font-medium text-gray-900 mb-3">
//         🔥 Trending Tokens
//       </h3>
      
//       <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
//         {trendingTokens.map((trendingToken) => {
//           const token = trendingToken.item;
//           const isSelected = selectedTokens.has(token.id);
          
//           return (
//             <div
//               key={token.id}
//               onClick={() => handleTokenToggle(trendingToken)}
//               className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
//                 isSelected ? 'bg-primary-50' : ''
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <div className="relative">
//                   <img src={token.thumb} alt={token.name} className="w-8 h-8 rounded-full" />
//                   <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
//                     <span className="text-xs">#{token.market_cap_rank}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-900">{token.name}</div>
//                   <div className="text-sm text-gray-500">{token.symbol.toUpperCase()}</div>
//                 </div>
//               </div>
              
//               <div className="flex items-center">
//                 <input
//                   type="radio"
//                   checked={isSelected}
//                   onChange={() => {}} // Controlled by parent click
//                   className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
// export default TrendingTokens


import React, { useState, useEffect } from 'react';
import { coinGeckoApi } from '../../service/coinGeckoApi';
import type { TrendingToken } from '../../types/token.types';

interface TrendingTokensProps {
  selectedTokens: Set<string>;
  onTokenSelect: (tokenId: string, isSelected: boolean) => void;
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({ selectedTokens, onTokenSelect }) => {
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        const response = await coinGeckoApi.getTrendingCoins();
        setTrendingTokens(response.coins);
      } catch (error) {
        console.error('Failed to fetch trending tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTokens();
  }, []);

  const handleTokenToggle = (token: TrendingToken) => {
    const isSelected = selectedTokens.has(token.item.id);
    onTokenSelect(token.item.id, !isSelected);
  };

  if (isLoading) {
    return (
      <div className="trending-section">
        <h3 
          className="text-lg font-medium mb-3" 
          style={{ color: 'var(--color-text-primary)' }}
        >
          Trending
        </h3>
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
              <div 
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: 'var(--color-background-tertiary)' }}
              ></div>
              <div className="flex-1">
                <div 
                  className="h-4 rounded w-24 mb-1"
                  style={{ backgroundColor: 'var(--color-background-tertiary)' }}
                ></div>
                <div 
                  className="h-3 rounded w-16"
                  style={{ backgroundColor: 'var(--color-background-tertiary)' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="trending-section">
      <h3 
        className="text-lg font-medium mb-3" 
        style={{ color: 'var(--color-text-primary)' }}
      >
        Trending
      </h3>
      
      <div 
        className="max-h-64 overflow-y-auto rounded-lg"
        style={{
          backgroundColor: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-primary)'
        }}
      >
        {trendingTokens.map((trendingToken) => {
          const token = trendingToken.item;
          const isSelected = selectedTokens.has(token.id);
          
          return (
            <div
              key={token.id}
              onClick={() => handleTokenToggle(trendingToken)}
              className="token-search-item flex items-center justify-between p-3 cursor-pointer transition-colors"
              style={{
                backgroundColor: isSelected 
                  ? 'rgba(132, 204, 22, 0.1)' 
                  : 'transparent',
                borderBottom: '1px solid var(--color-border-primary)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--color-background-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={token.thumb} 
                    alt={token.name} 
                    className="w-8 h-8 rounded-full" 
                  />
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--color-success-500)',
                      color: '#000000',
                      fontSize: '10px'
                    }}
                  >
                    #{token.market_cap_rank}
                  </div>
                </div>
                <div>
                  <div 
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {token.name}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {token.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: isSelected ? 'var(--color-success-500)' : 'var(--color-border-secondary)',
                    backgroundColor: isSelected ? 'var(--color-success-500)' : 'transparent'
                  }}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingTokens;
