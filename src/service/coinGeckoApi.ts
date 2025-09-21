import type { CoinGeckoMarketData } from "../types/api";
import type { PortfolioAllocation, PortfolioToken } from "../types/portfolio.types";
import type {
  Token,
  TokenSearchResult,
  TrendingToken,
//   WatchlistToken,
} from "../types/token.types";

const COINGECKO_API_BASE =
  import.meta.env.VITE_BASE_URL || "https://api.coingecko.com/api/v3";
const API_KEY = import.meta.env.VITE_API_KEY;

class CoinGeckoApiService {
    private requestWindow = 60000; 
    private maxRequestsPerWindow = 25; 
    private requestTimestamps: number[] = [];

    private portfolioColors = [
        "#F7931A", // Bitcoin Orange
        "#627EEA", // Ethereum Blue
        "#9945FF", // Solana Purple
        "#00D4AA", // Teal (USDC/stablecoins)
        "#FF6B6B", // Coral Red
        "#4ECDC4", // Turquoise
        "#45B7D1", // Sky Blue
        "#96CEB4", // Mint Green
        "#FFEAA7", // Warm Yellow
        "#DDA0DD", // Plum
        "#98D8C8", // Mint
        "#F7DC6F", // Light Gold
        "#BB8FCE", // Light Purple
        "#85C1E9", // Light Blue
        "#F8C471", // Peach
    ];

    private checkRateLimit(): void {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.requestWindow
        );

        if (this.requestTimestamps.length >= this.maxRequestsPerWindow) {
        const oldestRequest = this.requestTimestamps[0];
        const waitTime = this.requestWindow - (now - oldestRequest);
        throw new Error(
            `⏰ Rate limit exceeded. Please wait ${Math.ceil(
            waitTime / 1000
            )} seconds`
        );
        }

        this.requestTimestamps.push(now);
    }

    private async makeRequest<T>(
        endpoint: string,
        params?: Record<string, string>
    ): Promise<T> {
        // Check rate limit before making request
        this.checkRateLimit();
        const url = new URL(`${COINGECKO_API_BASE}${endpoint}`);
        // Add parameters to URL
        if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
            url.searchParams.append(key, value);
            }
        });
        }

        // Prepare headers with Demo API authentication
        const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
        };

        // Use Demo API authentication header
        if (API_KEY) {
        headers["x-cg-demo-api-key"] = API_KEY;
        }

        try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers,
            mode: "cors",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API Error Response:", errorText);

            switch (response.status) {
            case 401:
                throw new Error("🔐 Unauthorized: Invalid or missing API key");
            case 429:
                throw new Error(
                "⏰ Rate limit exceeded - Demo API allows 30 calls/minute"
                );
            case 403:
                throw new Error("🚫 Forbidden: API access denied");
            case 404:
                throw new Error("🔍 Endpoint not found");
            case 500:
                throw new Error(
                "🔧 CoinGecko server error - please try again later"
                );
            default:
                throw new Error(
                `🚨 API Error ${response.status}: ${response.statusText}`
                );
            }
        }

        const data = await response.json();
        return data;
        } catch (error) {
        console.error("💥 Request Failed:", error);
        throw error;
        }
    }

    // 1. API Health Check - /ping
    
    async ping(): Promise<{ gecko_says: string }> {
        return this.makeRequest<{ gecko_says: string }>("/ping");
    }

  // 2. Coins Market Data - /coins/markets (Main endpoint for portfolio)
    async getCoinsMarkets(
        params: {
        vs_currency?: string;
        ids?: string;
        order?: string;
        per_page?: number;
        page?: number;
        sparkline?: boolean;
        price_change_percentage?: string;
        } = {}
    ): Promise<CoinGeckoMarketData[]> {
        const defaultParams = {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        page: "1",
        sparkline: true,
        price_change_percentage: "24h",
        };

        const queryParams: Record<string, string> = {};
        const mergedParams = { ...defaultParams, ...params };

        Object.entries(mergedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams[key] = String(value);
        }
        });

        // Remove empty ids parameter
        if (queryParams.ids === "" || queryParams.ids === undefined) {
        delete queryParams.ids;
        }

        return this.makeRequest<CoinGeckoMarketData[]>(
        "/coins/markets",
        queryParams
        );
    }

    // 3. Simple Price for real-time updates - /simple/price
    
    async getSimplePrice(
        ids: string[],
        options: {
        vs_currencies?: string[];
        include_market_cap?: boolean;
        include_24hr_vol?: boolean;
        include_24hr_change?: boolean;
        include_last_updated_at?: boolean;
        } = {}
    ): Promise<Record<string, unknown>> {
        if (!ids.length) {
        throw new Error("❌ Token IDs array cannot be empty");
        }

        const params = {
        ids: ids.join(","),
        vs_currencies: (options.vs_currencies || ["usd"]).join(","),
        include_market_cap: String(options.include_market_cap || false),
        include_24hr_vol: String(options.include_24hr_vol || false),
        include_24hr_change: String(options.include_24hr_change || true),
        include_last_updated_at: String(options.include_last_updated_at || true),
        };

        return this.makeRequest<Record<string, unknown>>("/simple/price", params);
    }

  // 4. Search Coins - /search (For Add Token Modal)
    async searchCoins(query: string): Promise<{
        coins: TokenSearchResult[];
        exchanges: unknown[];
        icos: unknown[];
        categories: unknown[];
        nfts: unknown[];
    }> {
        if (!query || query.trim().length < 2) {
        throw new Error("❌ Search query must be at least 2 characters");
        }

        const params = { query: query.trim() };

        return this.makeRequest<{
        coins: TokenSearchResult[];
        exchanges: unknown[];
        icos: unknown[];
        categories: unknown[];
        nfts: unknown[];
        }>("/search", params);
    }

  // 5. Trending Search - /search/trending (For Add Token Modal trending section)
    async getTrendingCoins(): Promise<{
        coins: TrendingToken[];
        nfts: unknown[];
        categories: unknown[];
    }> {
        return this.makeRequest<{
        coins: TrendingToken[];
        nfts: unknown[];
        categories: unknown[];
        }>("/search/trending");
    }

  // 6. Supported Coins List - /coins/list (For token ID mapping)
    // async getCoinsList(include_platform: boolean = false): Promise<
    //     Array<{
    //     id: string;
    //     symbol: string;
    //     name: string;
    //     platforms?: Record<string, string>;
    //     }>
    // > {
    //     const params = include_platform ? { include_platform: "true" } : {};

    //     return this.makeRequest<
    //     Array<{
    //         id: string;
    //         symbol: string;
    //         name: string;
    //         platforms?: Record<string, string>;
    //     }>
    //     >("/coins/list", params as unknown);
    // }

  // 7. Individual Coin Data - /coins/{id} (For detailed token info)
    async getCoinData(
        id: string,
        options: {
        localization?: boolean;
        tickers?: boolean;
        market_data?: boolean;
        community_data?: boolean;
        developer_data?: boolean;
        sparkline?: boolean;
        } = {}
    ): Promise<unknown> {
        const params: Record<string, string> = {
        localization: String(options.localization || false),
        tickers: String(options.tickers || false),
        market_data: String(options.market_data !== false), // Default true
        community_data: String(options.community_data || false),
        developer_data: String(options.developer_data || false),
        sparkline: String(options.sparkline || false),
        };

        return this.makeRequest<unknown>(`/coins/${id}`, params);
    }

  // 8. Batch fetch watchlist tokens with current prices
    // async getWatchlistTokens(tokenIds: string[]): Promise<WatchlistToken[]> {
    //     if (!tokenIds.length) {
    //     return [];
    //     }

    //     try {
    //     const marketData = await this.getCoinsMarkets({
    //         ids: tokenIds.join(","),
    //         vs_currency: "usd",
    //         order: "market_cap_desc",
    //         per_page: tokenIds.length,
    //         page: 1,
    //         sparkline: true,
    //         price_change_percentage: "24h",
    //     });

    //     // Transform to WatchlistToken format
    //     return marketData.map((data) =>
    //         this.transformMarketDataToWatchlistToken(data)
    //     );
    //     } catch (error) {
    //     console.error("Failed to fetch watchlist tokens:", error);
    //     throw error;
    //     }
    // }

  // 9. Utility method to transform market data to Token interface
    transformMarketDataToToken(data: CoinGeckoMarketData): Token {
        return {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        image: data.image,
        current_price: data.current_price,
        market_cap: data.market_cap,
        market_cap_rank: data.market_cap_rank,
        price_change_percentage_24h: data.price_change_percentage_24h,
        sparkline_in_7d: data.sparkline_in_7d,
        last_updated: data.last_updated,
        };
    }

  // 10. Transform market data to WatchlistToken format
    // transformMarketDataToWatchlistToken(
    //     data: CoinGeckoMarketData,
    //     holdings: number = 0
    // ): WatchlistToken {
    //     const token = this.transformMarketDataToToken(data);
    //     return {
    //     ...token,
    //     holdings,
    //     value: token.current_price * holdings,
    //     };
    // }

  // 11. Get current rate limit status
    getRateLimitStatus() {
        const now = Date.now();
        const recentRequests = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.requestWindow
        ).length;

        return {
        requests: recentRequests,
        limit: this.maxRequestsPerWindow,
        remaining: this.maxRequestsPerWindow - recentRequests,
        windowMs: this.requestWindow,
        resetTime:
            recentRequests > 0
            ? new Date(this.requestTimestamps[0] + this.requestWindow)
            : null,
        };
    }
    // 12
    transformMarketDataToPortfolioToken(
        data: CoinGeckoMarketData, 
        holdings: number, 
        colorIndex?: number
    ): PortfolioToken {
        const token = this.transformMarketDataToToken(data);
        return {
            ...token,
            holdings,
            value: token.current_price * holdings,
            color: colorIndex !== undefined ? this.portfolioColors[colorIndex % this.portfolioColors.length] : undefined,
            dateAdded: new Date().toISOString(),
        };
    }
    
    // 12. Get portfolio tokens with allocation data (ADD THIS)
    async getPortfolioTokens(portfolioData: Array<{ id: string; holdings: number }>): Promise<PortfolioToken[]> {
        if (!portfolioData.length) {
            return [];
        }
        try {
            const tokenIds = portfolioData.map(item => item.id);
            
            const marketData = await this.getCoinsMarkets({
                ids: tokenIds.join(','),
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: tokenIds.length,
                page: 1,
                sparkline: true,
                price_change_percentage: '24h',
            });

            // Transform with holdings and colors
            return portfolioData.map((portfolioItem, index) => {
            const marketToken = marketData.find(token => token.id === portfolioItem.id);
            
            if (marketToken) {
                return this.transformMarketDataToPortfolioToken(marketToken, portfolioItem.holdings, index);
            }
            // Fallback if market data not found
            return {
                id: portfolioItem.id,
                name: portfolioItem.id,
                symbol: portfolioItem.id,
                image: '',
                current_price: 0,
                market_cap: 0,
                market_cap_rank: 999,
                price_change_percentage_24h: 0,
                sparkline_in_7d: { price: [] },
                last_updated: new Date().toISOString(),
                holdings: portfolioItem.holdings,
                value: 0,
                color: this.portfolioColors[index % this.portfolioColors.length],
                dateAdded: new Date().toISOString(),
            } as PortfolioToken;
            }).sort((a, b) => b.value - a.value); // Sort by value descending
        } catch (error) {
            console.error('Failed to fetch portfolio tokens:', error);
            throw error;
        }
    }
    
    
    // 13. Calculate portfolio allocation for donut chart (ADD THIS)  
    calculatePortfolioAllocation(portfolioTokens: PortfolioToken[]): PortfolioAllocation[] {
        if (!portfolioTokens.length) {
            return [];
        }
        const totalValue = portfolioTokens.reduce((sum, token) => sum + token.value, 0);
        if (totalValue === 0) {
            return [];
        }
        return portfolioTokens
            .filter(token => token.value > 0)
            .map(token => ({
            id: token.id,
            name: token.name,
            symbol: token.symbol.toUpperCase(),
            value: token.value,
            percentage: (token.value / totalValue) * 100,
            holdings: token.holdings,
            current_price: token.current_price,
            color: token.color || '#666666', // Fallback color
        })).sort((a, b) => b.percentage - a.percentage); // Sort by percentage
    }

    // 14. Get complete portfolio data for charts (ADD THIS)
    async getPortfolioChartData(portfolioData: Array<{ id: string; holdings: number }>) {

        try {
            // Get portfolio tokens with market data
            const portfolioTokens = await this.getPortfolioTokens(portfolioData);
            
            // Calculate allocation for charts
            const allocation = this.calculatePortfolioAllocation(portfolioTokens);
            
            // Calculate summary metrics
            const totalValue = portfolioTokens.reduce((sum, token) => sum + token.value, 0);
            const totalChange24h = portfolioTokens.reduce((sum, token) => {
            const change = (token.price_change_percentage_24h || 0) / 100 * token.value;
            return sum + change;
            }, 0);
            const totalChangePercent24h = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

            return {
            tokens: portfolioTokens,
            allocation,
            summary: {
                totalValue,
                totalChange24h,
                totalChangePercent24h,
                tokenCount: portfolioTokens.length,
                lastUpdated: new Date().toISOString(),
            }
            };
        } catch (error) {
            console.error('Failed to get portfolio chart data:', error);
            throw error;
        }
    }
    
}

export const coinGeckoApi = new CoinGeckoApiService();
