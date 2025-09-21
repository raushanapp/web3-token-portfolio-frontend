// import React, { useState, useCallback, useEffect,useMemo } from 'react';
// import { coinGeckoApi } from '../../service/coinGeckoApi';
// import { debounce } from '../../utils/debounde';
// import type { TokenSearchResult } from '../../types/tokens.types';

// interface TokenSearchProps {
//   selectedTokens: Set<string>;
//   onTokenSelect: (tokenId: string, isSelected: boolean) => void;
// }

// const TokenSearch: React.FC<TokenSearchProps> = ({ selectedTokens, onTokenSelect }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   const searchTokens = useCallback(async (query: string) => {
//     if (query.trim().length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     setIsSearching(true);
//     try {
//       const response = await coinGeckoApi.searchCoins(query);
//       setSearchResults(response.coins.slice(0, 10)); // Limit to 10 results
//     } catch (error) {
//       console.error('Search error:', error);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   }, []);

//     const debouncedSearch = useMemo(() => debounce(searchTokens, 500), [searchTokens]);

//     useEffect(() => {
//         debouncedSearch(searchQuery);
//     }, [searchQuery, debouncedSearch]);
    

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setSearchQuery(e.target.value);
//         debouncedSearch(e.target.value);
//     };

//   const handleTokenToggle = (token: TokenSearchResult) => {
//     const isSelected = selectedTokens.has(token.id);
//     onTokenSelect(token.id, !isSelected);
//   };

//   return (
//     <div className="mb-6">
//       <h3 className="text-lg font-medium text-gray-900 mb-3">Search Tokens</h3>
      
//       {/* Search Input */}
//       <div className="relative mb-4">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//         </div>
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={handleInputChange}
//           placeholder="Search for cryptocurrencies..."
//           className="input-field pl-10"
//         />
//         {isSearching && (
//           <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//             <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//           </div>
//         )}
//       </div>

//       {/* Search Results */}
//       {searchQuery.trim().length >= 2 && (
//         <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
//           {searchResults.length === 0 && !isSearching && (
//             <div className="p-4 text-center text-gray-500">
//               No tokens found for "{searchQuery}"
//             </div>
//           )}
          
//           {searchResults.map((token) => {
//             const isSelected = selectedTokens.has(token.id);
//             return (
//               <div
//                 key={token.id}
//                 onClick={() => handleTokenToggle(token)}
//                 className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
//                   isSelected ? 'bg-primary-50' : ''
//                 }`}
//               >
//                 <div className="flex items-center space-x-3">
//                   <img src={token.thumb} alt={token.name} className="w-8 h-8 rounded-full" />
//                   <div>
//                     <div className="font-medium text-gray-900">{token.name}</div>
//                     <div className="text-sm text-gray-500">{token.symbol.toUpperCase()}</div>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center">
//                   <input
//                     type="radio"
//                     checked={isSelected}
//                     onChange={() => {}} // Controlled by parent click
//                     className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };
// export default TokenSearch

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { coinGeckoApi } from '../../service/coinGeckoApi';
import { debounce } from '../../utils/debounde';
import type { TokenSearchResult } from '../../types/token.types';

interface TokenSearchProps {
  selectedTokens: Set<string>;
  onTokenSelect: (tokenId: string, isSelected: boolean) => void;
}

const TokenSearch: React.FC<TokenSearchProps> = ({ selectedTokens, onTokenSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchTokens = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await coinGeckoApi.searchCoins(query);
      setSearchResults(response.coins.slice(0, 10));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(searchTokens, 500), [searchTokens]);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleTokenToggle = (token: TokenSearchResult) => {
    const isSelected = selectedTokens.has(token.id);
    onTokenSelect(token.id, !isSelected);
  };

  return (
    <div className="mb-6">
      <h3 
        className="text-lg font-medium mb-3" 
        style={{ color: 'var(--color-text-primary)' }}
      >
        Search Tokens
      </h3>
      
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search tokens (e.g., ETH, SOL)..."
          className="search-input w-full pl-10 pr-10"
          style={{
            backgroundColor: 'var(--color-background-tertiary)',
            border: '1px solid var(--color-border-primary)',
            color: 'var(--color-text-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            fontSize: 'var(--font-size-sm)'
          }}
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg 
              className="w-5 h-5 animate-spin" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery.trim().length >= 2 && (
        <div 
          className="max-h-64 overflow-y-auto rounded-lg"
          style={{
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-primary)'
          }}
        >
          {searchResults.length === 0 && !isSearching && (
            <div 
              className="p-4 text-center"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              No tokens found for "{searchQuery}"
            </div>
          )}
          
          {searchResults.map((token) => {
            const isSelected = selectedTokens.has(token.id);
            return (
              <div
                key={token.id}
                onClick={() => handleTokenToggle(token)}
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
                  <img 
                    src={token.thumb} 
                    alt={token.name} 
                    className="w-8 h-8 rounded-full" 
                  />
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
                
                <div className="flex items-center">
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
      )}
    </div>
  );
};

export default TokenSearch;
