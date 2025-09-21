import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WalletStates } from '../../types/wallet.types';

const initialState: WalletStates = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  ensName: null,
    connector: null,
  chain:null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
     setWalletConnection: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        address?: string | null;
        chainId?: number | null;
        balance?: string | null;
        ensName?: string | null;
          connector?: string | null;
        chain?:string| null
      }>
    ) => {
      const { isConnected, address, chainId, balance, ensName, connector,chain } = action.payload;
      state.isConnected = isConnected;
      state.address = address || null;
      state.chainId = chainId || null;
      state.balance = balance || null;
      state.ensName = ensName || null;
          state.connector = connector || null;
          state.chain=chain|| null
    },

    disconnectWallet: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.balance = null;
      state.ensName = null;
        state.connector = null;
        state.chain=null
    },
    
    clearWallet: () => {
      return initialState;
    },
  },
});

export const { setWalletConnection, clearWallet,disconnectWallet } = walletSlice.actions;
export default walletSlice.reducer;



