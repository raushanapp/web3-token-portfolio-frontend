import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWalletConnect } from '../../hooks/useWalletConnect';

interface WalletStatusProps {
  className?: string;
  showBalance?: boolean;
  showChain?: boolean;
  compact?: boolean;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ 
  className = '',
  showBalance = true,
  showChain = true,
  compact = false
}) => {
  const { 
    address, 
    isConnected, 
    ensName, 
    chain, 
    disconnect, 
    isDisconnecting,
    displayName,
    displayBalance,
    formatAddress
  } = useWalletConnect();

  const [showDropdown, setShowDropdown] = useState(false);

  // Not connected state
  if (!isConnected) {
    return (
      <div className={`flex items-center ${className}`}>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:transform hover:-translate-y-0.5"
                        style={{ 
                          backgroundColor: 'var(--color-success-500)',
                          fontSize: 'var(--font-size-sm)'
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Connect Wallet</span>
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                        style={{ backgroundColor: 'var(--color-error-500)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>Wrong Network</span>
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      {showChain && (
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                          style={{ 
                            backgroundColor: 'var(--color-background-tertiary)',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-4 h-4"
                            />
                          )}
                          <span>{chain.name}</span>
                        </button>
                      )}

                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-success-500)' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-300"></div>
                        <span>{account.displayName}</span>
                        {showBalance && account.displayBalance && (
                          <span className="text-sm opacity-90">({account.displayBalance})</span>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    );
  }

  // Connected state - Enhanced version
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <ConnectButton showBalance={false} accountStatus="address" chainStatus="icon" />
      </div>
    );
  }

  // Full connected state with custom styling
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Chain indicator */}
      {showChain && chain && (
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{ 
            backgroundColor: chain.unsupported ? 'var(--color-error-50)' : 'var(--color-background-tertiary)',
            borderColor: chain.unsupported ? 'var(--color-error-200)' : 'var(--color-border-primary)',
            color: chain.unsupported ? 'var(--color-error-700)' : 'var(--color-text-primary)'
          }}
        >
          {chain.iconUrl && (
            <img
              alt={chain.name ?? 'Chain icon'}
              src={chain.iconUrl}
              className="w-4 h-4"
            />
          )}
          <span className="text-sm font-medium">
            {chain.name || `Chain ${chain.id}`}
          </span>
          {chain.unsupported && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
      )}

      {/* Connected wallet status */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:shadow-sm"
          style={{ 
            backgroundColor: 'var(--color-success-50)',
            borderColor: 'var(--color-success-200)',
            color: 'var(--color-success-800)'
          }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {displayName}
            </span>
            {showBalance && displayBalance && (
              <span className="text-xs opacity-75">
                {displayBalance}
              </span>
            )}
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            ></div>
            
            {/* Dropdown content */}
            <div 
              className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg border z-20 py-2"
              style={{ 
                backgroundColor: 'var(--color-background-secondary)',
                borderColor: 'var(--color-border-primary)'
              }}
            >
              {/* Address info */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Address</p>
                <p className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {address && formatAddress(address, 8)}
                </p>
                {ensName && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    ENS: {ensName}
                  </p>
                )}
              </div>

              {/* Balance info */}
              {displayBalance && (
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Balance</p>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {displayBalance}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address || '');
                    setShowDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>
                
                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ color: 'var(--color-error-500)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletStatus;