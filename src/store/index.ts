import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import portfolioReucer from './slices/portfolioSlice';
import wallerReducer from "./slices/walletSlice";

// Persist configuration
const walletPersistConfig = {
  key: 'wallet',
  storage,
  whitelist: ['watchlist'], // Only persist portfolio and watchlist
  blacklist: ['loading', 'error', 'searchResults', 'trendingTokens', 'searchQuery', 'lastUpdated'],
};

const rootReducer = combineReducers({
  portfolio: portfolioReucer, // Not persisted
  wallet: persistReducer(walletPersistConfig, wallerReducer), // Only this slice is persisted
  // Add other slices here if needed
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
