import { getCoinGeckoApiKey } from '../config.js';

// CoinGecko API Configuration
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const COINGECKO_PRO_BASE_URL = 'https://pro-api.coingecko.com/api/v3';

// Types
interface CoinGeckoConfig {
  apiKey?: string;
  isPro?: boolean;
  baseUrl?: string;
}

// Helper function to determine API configuration
function getApiConfig(config: CoinGeckoConfig = {}): {
  baseUrl: string;
  apiKey?: string;
  isPro: boolean;
} {
  // If isPro is explicitly set, pro will be used
  if (config.isPro !== undefined) {
    return {
      baseUrl: config.isPro ? COINGECKO_PRO_BASE_URL : COINGECKO_BASE_URL,
      apiKey: config.isPro ? (config.apiKey || getCoinGeckoApiKey()) : undefined,
      isPro: config.isPro
    };
  }
  
  // Auto-detect: use Pro if API key exists (either in config or env)
  const hasApiKey = config.apiKey || getCoinGeckoApiKey();
  const shouldUsePro = !!hasApiKey;
  
  return {
    baseUrl: shouldUsePro ? COINGECKO_PRO_BASE_URL : COINGECKO_BASE_URL,
    apiKey: hasApiKey,
    isPro: shouldUsePro
  };
}

interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  last_updated: string;
}

interface HistoricalPrice {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Get current token price from CoinGecko
 */
export async function getTokenPriceCoinGecko(
  tokenId: string,
  vsCurrency: string = 'usd',
  config: CoinGeckoConfig = {}
): Promise<TokenPrice> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    const url = `${apiConfig.baseUrl}/coins/markets?ids=${tokenId}&vs_currency=${vsCurrency}&order=market_cap_desc&per_page=1&page=1&sparkline=false`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error(`Token not found: ${tokenId}`);
    }
    
    return data[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
    throw new Error(`Failed to get token price: ${String(error)}`);
  }
}

/**
 * Get historical price data for a token
 */
export async function getTokenHistoricalData(
  tokenId: string,
  vsCurrency: string = 'usd',
  days: number = 30,
  interval?: 'minutely' | 'hourly' | 'daily',
  config: CoinGeckoConfig = {}
): Promise<HistoricalPrice> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    let url = `${apiConfig.baseUrl}/coins/${tokenId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
    
    if (interval) {
      url += `&interval=${interval}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get historical data: ${error.message}`);
    }
    throw new Error(`Failed to get historical data: ${String(error)}`);
  }
}

/**
 * Search for tokens on CoinGecko
 */
export async function searchTokens(
  query: string,
  config: CoinGeckoConfig = {}
): Promise<Array<{
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}>> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    const url = `${apiConfig.baseUrl}/search?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search tokens: ${error.message}`);
    }
    throw new Error(`Failed to search tokens: ${String(error)}`);
  }
}

/**
 * Get trending tokens
 */
export async function getTrendingTokens(
  config: CoinGeckoConfig = {}
): Promise<Array<{
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}>> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    const url = `${apiConfig.baseUrl}/search/trending`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get trending tokens: ${error.message}`);
    }
    throw new Error(`Failed to get trending tokens: ${String(error)}`);
  }
}

/**
 * Get token details by contract address
 */
export async function getTokenByContract(
  platformId: string,
  contractAddress: string,
  config: CoinGeckoConfig = {}
): Promise<{
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: string;
  platforms: Record<string, string>;
  detail_platforms: Record<string, any>;
  block_time_in_minutes: number;
  hashing_algorithm: string;
  categories: string[];
  public_notice: string | null;
  additional_notices: string[];
  description: Record<string, string>;
  links: Record<string, any>;
  image: Record<string, string>;
  country_origin: string;
  genesis_date: string;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  market_data: any;
  community_data: any;
  developer_data: any;
  public_interest_stats: any;
  status_updates: any[];
  last_updated: string;
}> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    const url = `${apiConfig.baseUrl}/coins/${platformId}/contract/${contractAddress}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token by contract: ${error.message}`);
    }
    throw new Error(`Failed to get token by contract: ${String(error)}`);
  }
}

/**
 * Get multiple token prices
 */
export async function getMultipleTokenPrices(
  tokenIds: string[],
  vsCurrency: string = 'usd',
  includeMarketCap: boolean = false,
  include24hrChange: boolean = false,
  config: CoinGeckoConfig = {}
): Promise<Record<string, any>> {
  try {
    const apiConfig = getApiConfig(config);
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };
    
    if (apiConfig.apiKey) {
      headers['x-cg-pro-api-key'] = apiConfig.apiKey;
    }

    let url = `${apiConfig.baseUrl}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=${vsCurrency}`;
    
    if (includeMarketCap) {
      url += '&include_market_cap=true';
    }
    
    if (include24hrChange) {
      url += '&include_24hr_change=true';
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get multiple token prices: ${error.message}`);
    }
    throw new Error(`Failed to get multiple token prices: ${String(error)}`);
  }
}