import React, { useEffect } from 'react';
// import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Import updated slice actions and selectors

import { useWallet } from "./hooks/useWallets";
// Components
import Navbar from './components/layout/navbar-layout-component';
// import PortfolioCard from './components/card/portfolio-card-component';
// import DonutChartComponent from './components/chart/donutChart-component';
// import { RefreshButton } from './components/portfolio/refresh-button-component';
import WatchlistTableComponent from './components/table/watchlistTable-component';
import { PaginationFooter } from './components/common/pagination-footer-component';
import type { Token, } from './types/token.types';
import PortfolioContainer from './components/portfolio/portfolio-container-component';
// import AddTokenModal from './components/addToken/addToken-component';

const App: React.FC = () => {
  const { loading, refreshMarketData, marketTokens } = useWallet();
  
  const [itemsTablePerPage, setItemsTablePerPage] = React.useState<Token[]>();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [totalsItems,setTotalsItems] = React.useState<number>(0);
  
  
  useEffect(() => {
    if (loading.marketTokens !== "succeeded") {
      refreshMarketData()
    }
    const firstTime = marketTokens.slice(0, 10);
    setItemsTablePerPage(firstTime)
    setTotalsItems(marketTokens.length)
  }, [loading.marketTokens, marketTokens, refreshMarketData,]);

   

  const handlePageChange =React.useCallback((pageArrow: string, currentPage: number):void => {
    if (pageArrow === "left" && currentPage !== 1) {
      setCurrentPage((prev: number) => prev - 1);
    }
    if (pageArrow === "right" && itemsPerPage !== totalsItems) {
      setCurrentPage((prev: number) => prev + 1);

    }
    if (currentPage === itemsPerPage) {
      setItemsPerPage((prev) => prev + 10);
    }
  },[itemsPerPage, totalsItems]);

  
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-primary)' }}>
      <Navbar />
      
      <main className="full-width-container py-8">
        {/* <PortfolioHeader /> */}

        

        {/* Portfolio Overview Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              {/* <PortfolioCard 
                lastUpdated={lastUpdated} 
                summary={portfolioSummary}
                isLoading={portfolioLoading}
              /> */}
            </div>
            
            <div className="lg:col-span-2">
               <PortfolioContainer/>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="watchlist-container mb-8">
          <div className="watchlist-header-row">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Watchlist
                </h2>
                <span className="text-sm px-2 py-1 rounded" 
                      style={{ 
                        backgroundColor: 'var(--color-background-tertiary)',
                        color: 'var(--color-text-secondary)' 
                      }}>
                  {marketTokens.length}tokens
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* {autoRefresh && (
                  <div className="flex items-center gap-1 text-xs" 
                       style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="w-2 h-2 rounded-full animate-pulse" 
                         style={{ backgroundColor: 'var(--color-success-500)' }}></div>
                    <span>Auto-refresh</span>
                  </div>
                )} */}
                
                {/* <RefreshButton 
                  onRefresh={handleRefreshPrices} 
                  isLoading={isAnyLoading}
                  lastRefresh={portfolioLastRefresh}
                /> */}
                
                {/* <button
                  onClick={handleAddToken}
                  className="btn-portfolio-primary flex items-center gap-2"
                  disabled={isAnyLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Token
                </button> */}
              </div>
            </div>
          </div>
          
          <WatchlistTableComponent 
            tokens={itemsTablePerPage ?? []} 
            isLoading={loading.marketTokens}
            // onRefresh={handleRefreshPrices}
          />
          
          {totalsItems  && (
            <div style={{ 
              padding: 'var(--spacing-6)', 
              borderTop: '1px solid var(--color-border-primary)',
              backgroundColor: 'var(--color-background-secondary)'
            }}>
              <PaginationFooter 
                currentPage={currentPage}
                totalItems={totalsItems}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>

        {/* <AddTokenModal
          isOpen={isAddTokenModalOpen}
          onClose={handleCloseAddTokenModal}
          onTokensAdded={handleRefreshPrices}
        /> */}
      </main>
    </div>
  );
};

export default App;
