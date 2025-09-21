import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
export const wagmiConfig = getDefaultConfig({
  appName: 'Token Portfolio',
  projectId:import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID , // Get from WalletConnect
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: false,
});
