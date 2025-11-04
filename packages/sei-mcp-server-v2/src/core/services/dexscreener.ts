// DexScreener API Configuration
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com';

// Types
export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{
      url: string;
    }>;
    socials?: Array<{
      platform: string;
      handle: string;
    }>;
  };
  boosts?: {
    active: number;
  };
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

interface SearchResult {
  schemaVersion: string;
  pairs: DexPair[];
}

interface TokenProfileResponse {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header: string;
  description: string;
  links: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header: string;
  description: string;
  links: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

/**
 * Search for tokens/token pairs/token addresses on DexScreener
 */
export async function searchPairs(query: string): Promise<SearchResult> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/latest/dex/search/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to search pairs: ${error.message}`);
    }
    throw new Error(`Failed to search pairs: ${String(error)}`);
  }
}

/**
 * Get token pairs by token addresses
 */
export async function getTokenPairs(tokenAddresses: string[]): Promise<SearchResult> {
  try {
    const addressList = tokenAddresses.join(',');
    const url = `${DEXSCREENER_BASE_URL}/latest/dex/tokens/${addressList}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token pairs: ${error.message}`);
    }
    throw new Error(`Failed to get token pairs: ${String(error)}`);
  }
}

/**
 * Get pair information by pair address
 */
export async function getPairsByAddress(chainId: string, pairAddress: string): Promise<SearchResult> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/latest/dex/pairs/${chainId}/${pairAddress}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get pairs by addresses: ${error.message}`);
    }
    throw new Error(`Failed to get pairs by addresses: ${String(error)}`);
  }
}

/**
 * Get token profile information
 */
export async function getTokenProfile(chainId: string, tokenAddress: string): Promise<TokenProfileResponse> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/token-pairs/v1/${chainId}/${tokenAddress}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token profile: ${error.message}`);
    }
    throw new Error(`Failed to get token profile: ${String(error)}`);
  }
}

/**
 * Get latest token profiles
 */
export async function getLatestTokenProfiles(): Promise<TokenProfile[]> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/token-profiles/latest/v1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get latest token profiles: ${error.message}`);
    }
    throw new Error(`Failed to get latest token profiles: ${String(error)}`);
  }
}

/**
 * Get top boosted tokens
 */
export async function getTopBoostedTokens(): Promise<any> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/token-boosts/top/v1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get top boosted tokens: ${error.message}`);
    }
    throw new Error(`Failed to get top boosted tokens: ${String(error)}`);
  }
}

/**
 * Get orders by chain (alternative to trending - gets pairs ordered by volume/activity)
 */
export async function getOrdersByChain(chainId: string, tokenAddress: string): Promise<SearchResult> {
  try {
    const url = `${DEXSCREENER_BASE_URL}/orders/v1/${chainId}/${tokenAddress}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DexScreener-Client/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get orders by chain: ${error.message}`);
    }
    throw new Error(`Failed to get orders by chain: ${String(error)}`);
  }
}

// Note: DexScreener doesn't provide direct trending or latest pairs endpoints
// These functionalities would need to be implemented by:
// 1. Using the search endpoint with specific queries
// 2. Using the getLatestTokenProfiles() to get recently updated tokens
// 3. Using third-party APIs or scraping (not recommended)

/**
 * Alternative function to get trending-like data by searching popular tokens
 */
export async function getTrendingLikeData(searchTerms: string[] = ['ETH', 'BTC', 'USDC']): Promise<SearchResult[]> {
  try {
    const results: SearchResult[] = [];
    
    for (const term of searchTerms) {
      const result = await searchPairs(term);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get trending-like data: ${error.message}`);
    }
    throw new Error(`Failed to get trending-like data: ${String(error)}`);
  }
}