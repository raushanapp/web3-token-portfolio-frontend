import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWalletConnect } from '../../hooks/useWalletConnect';

interface WalletStatusProps {
  className?: string;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ className = '' }) => {
    const { address, isConnected, ensName } = useWalletConnect();

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

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
                            // className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-black transition-all duration-200 hover:shadow-sm hover:transform hover:-translate-y-0.5"
                            style={{ 
                                backgroundColor: 'var(--color-success-500)',
                                fontSize: 'var(--font-size-sm)'
                            }}
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {chain.hasIcon && (
                          <div className="w-4 h-4">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
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

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Connected wallet status */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">
          {ensName || (address ? formatAddress(address) : 'Connected')}
        </span>
      </div>
      
      {/* Connect button for additional actions */}
      <ConnectButton showBalance={false} accountStatus="address" />
    </div>
  );
};

export default WalletStatus;
