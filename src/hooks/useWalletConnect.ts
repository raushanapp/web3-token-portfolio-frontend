// import { useAccount, useDisconnect, useEnsName } from 'wagmi';
// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { setWalletConnection, disconnectWallet } from '../store/slices/walletSlice';
// import type { AppDispatch } from '../store';

// export const useWalletConnect = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { address, isConnected, chainId, connector,chain } = useAccount();
//   const { disconnect } = useDisconnect();
//   const { data: ensName } = useEnsName({ address });

//   useEffect(() => {
//     if (isConnected && address) {
//       dispatch(setWalletConnection({
//         isConnected: true,
//         address,
//         chainId: chainId || null,
//         balance: null, // You can fetch balance separately if needed
//         ensName: ensName || null,
//           connector: connector?.name || null,
//       }));
//     } else {
//       dispatch(disconnectWallet());
//     }
//   }, [isConnected, address, chainId, ensName, connector, dispatch,chain]);

//   const handleDisconnect = () => {
//     disconnect();
//     dispatch(disconnectWallet());
//   };

//   return {
//     address,
//     isConnected,
//     chainId,
//     ensName,
//     connector: connector?.name,
//       disconnect: handleDisconnect,
//     chain
//   };
// };


import { useAccount, useDisconnect, useEnsName, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setWalletConnection, disconnectWallet } from '../store/slices/walletSlice';
import type { AppDispatch } from '../store';

export const useWalletConnect = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { address, isConnected, chainId, connector, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get native token balance
  const { data: balance } = useBalance({
    address,
    enabled: isConnected && !!address,
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  });

  // Update Redux state when wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      console.log(`🔗 Wallet connected: ${address} on ${chain?.name || 'unknown chain'}`);
      
      dispatch(setWalletConnection({
        isConnected: true,
        address,
        chainId: chainId || null,
        balance: balance?.formatted || null,
        ensName: ensName || null,
        connector: connector?.name || null,
      }));
    } else {
      dispatch(disconnectWallet());
    }
  }, [isConnected, address, chainId, ensName, connector, dispatch, chain, balance]);

  // Enhanced disconnect function with confirmation
  const handleDisconnect = async (skipConfirmation = false) => {
    if (!skipConfirmation) {
      const confirmed = window.confirm('Are you sure you want to disconnect your wallet?');
      if (!confirmed) return;
    }

    setIsDisconnecting(true);
    try {
      await disconnect();
      dispatch(disconnectWallet());
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Get chain info with fallbacks
  const getChainInfo = () => {
    if (!chain) return null;
    
    return {
      id: chain.id,
      name: chain.name,
      unsupported: chain.unsupported,
      iconUrl: chain.iconUrl,
      blockExplorers: chain.blockExplorers,
      nativeCurrency: chain.nativeCurrency,
    };
  };

  // Format address for display
  const formatAddress = (addr: string, length = 4) => {
    return `${addr.slice(0, 6)}...${addr.slice(-length)}`;
  };

  return {
    // Basic connection info
    address,
    isConnected,
    chainId,
    ensName,
    chain: getChainInfo(),
    connector: connector?.name,
    balance: balance?.formatted,
    balanceSymbol: balance?.symbol,
    
    // Status flags
    isDisconnecting,
    
    // Helper functions
    disconnect: handleDisconnect,
    formatAddress,
    
    // Display helpers
    displayName: ensName || (address ? formatAddress(address) : ''),
    displayBalance: balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '',
  };
};

