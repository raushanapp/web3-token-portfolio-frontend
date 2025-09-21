import React from 'react';
import WalletStatus from "../wallet/wallet-connect-component"
const Navbar: React.FC = () => {
  return (
    <nav style={{ 
      backgroundColor: 'var(--color-background-primary)', 
      borderBottom: '1px solid var(--color-border-primary)' 
    }}>
      <div className="full-width-container py-2">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-success-500)' }}
            >
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: 'var(--color-background-primary)' }}
              ></div>
            </div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Token Portfolio
            </h1>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-black transition-all duration-200 hover:shadow-sm hover:transform hover:-translate-y-0.5"
              style={{ 
                backgroundColor: 'var(--color-success-500)',
                fontSize: 'var(--font-size-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-success-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-success-500)';
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                />
                          </svg>
                          <WalletStatus
                            
                          />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
