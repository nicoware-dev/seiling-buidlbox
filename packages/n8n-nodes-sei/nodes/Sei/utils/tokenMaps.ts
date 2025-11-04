import { Address } from 'viem';

/**
 * Token information interface
 */
export interface TokenInfo {
  address: Address;
  symbol: string;
  decimals: number;
  name?: string;
}

/**
 * Gets Yei Finance token information by symbol
 * Imports from sei-agent-kit-custom
 */
export function getYeiTokenInfo(asset: string): TokenInfo | null {
  try {
    // Dynamic import to handle potential module resolution issues
    const { getTokenInfo } = require('@sei-agent-kit-custom/tools/yei/tokenMap');
    if (getTokenInfo) {
      const tokenInfo = getTokenInfo(asset);
      if (tokenInfo) {
        return {
          address: tokenInfo.address as Address,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          name: tokenInfo.name,
        };
      }
    }
    return null;
  } catch (error) {
    console.warn(`Failed to load Yei token map: ${error}`);
    return null;
  }
}

/**
 * Gets Takara Protocol tToken address by ticker
 * Imports from sei-agent-kit-custom
 */
export function getTakaraTTokenAddress(ticker: string): Address | null {
  try {
    const { getTakaraTTokenAddress } = require('@sei-agent-kit-custom/tools/takara/tokenMap');
    if (getTakaraTTokenAddress) {
      return getTakaraTTokenAddress(ticker);
    }
    return null;
  } catch (error) {
    console.warn(`Failed to load Takara token map: ${error}`);
    return null;
  }
}

/**
 * Resolves a token address from either an address or symbol
 * @param input - Token address (0x...) or symbol
 * @param tokenMap - Function to get token info by symbol (e.g., getYeiTokenInfo)
 * @returns Token address
 */
export function resolveTokenAddress(
  input: string,
  tokenMap?: (symbol: string) => TokenInfo | null
): Address {
  // If it's already an address (starts with 0x), return it
  if (input.startsWith('0x')) {
    return input as Address;
  }

  // Try to resolve from token map if provided
  if (tokenMap) {
    const tokenInfo = tokenMap(input);
    if (tokenInfo) {
      return tokenInfo.address;
    }
  }

  // If we can't resolve, throw error
  throw new Error(
    `Could not resolve token address for "${input}". Please provide a valid token address (0x...) or ensure the symbol exists in the token map.`
  );
}

/**
 * Common token addresses on Sei
 */
export const COMMON_TOKENS: Record<string, Address> = {
  SEI: '0x0000000000000000000000000000000000000000' as Address,
  WSEI: '0xe30fEdD158010b8B3Bcdb86d6a8a3b8B4e8e9C6D' as Address, // Update with actual address
  USDC: '0x0000000000000000000000000000000000000000' as Address, // Update with actual address
  USDT: '0x0000000000000000000000000000000000000000' as Address, // Update with actual address
};

