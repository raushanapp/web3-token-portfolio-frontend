const STORAGE_KEYS = {
  WATCHLIST: 'crypto-portfolio-watchlist',
  HOLDINGS: 'crypto-portfolio-holdings',
  LAST_UPDATE: 'crypto-portfolio-last-update',
} as const;

export interface StoredHoldings {
  [tokenId: string]: number;
}

class LocalStorageService {
  saveWatchlist(tokens: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save watchlist to localStorage:', error);
    }
  }

  getWatchlist(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load watchlist from localStorage:', error);
      return [];
    }
  }

  saveHoldings(holdings: StoredHoldings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
    } catch (error) {
      console.error('Failed to save holdings to localStorage:', error);
    }
  }

  getHoldings(): StoredHoldings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load holdings from localStorage:', error);
      return {};
    }
  }

  updateHolding(tokenId: string, amount: number): void {
    const holdings = this.getHoldings();
    if (amount > 0) {
      holdings[tokenId] = amount;
    } else {
      delete holdings[tokenId];
    }
    this.saveHoldings(holdings);
  }

  saveLastUpdate(timestamp: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, timestamp);
    } catch (error) {
      console.error('Failed to save last update timestamp:', error);
    }
  }

  getLastUpdate(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    } catch (error) {
      console.error('Failed to load last update timestamp:', error);
      return null;
    }
  }

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
export const localStorageService = new LocalStorageService();