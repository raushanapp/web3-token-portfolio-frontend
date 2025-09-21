import '@rainbow-me/rainbowkit/styles.css'; 
import './pollyfills.ts'; 

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './config/wagmi';
import { Provider } from 'react-redux';
import { store, persistor } from './store/index.ts'; // Import persistor
import { PersistGate } from 'redux-persist/integration/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <App />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
