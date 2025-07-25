import { ethers } from 'ethers';

/**
 * Convert human-readable token amount to wei (smallest unit)
 * @param amount Human-readable amount (e.g., "1.5")
 * @param decimals Token decimals (e.g., 18 for most tokens)
 * @returns Amount in wei as string
 */
export function parseTokenAmount(amount: string | number, decimals: number = 18): string {
  try {
    const amountStr = amount.toString();
    return ethers.parseUnits(amountStr, decimals).toString();
  } catch (error) {
    throw new Error(`Invalid token amount: ${amount}. Please provide a valid number.`);
  }
}

/**
 * Convert wei amount to human-readable format
 * @param weiAmount Amount in wei
 * @param decimals Token decimals (e.g., 18 for most tokens)
 * @returns Human-readable amount
 */
export function formatTokenAmount(weiAmount: string | bigint, decimals: number = 18): string {
  try {
    return ethers.formatUnits(weiAmount, decimals);
  } catch (error) {
    throw new Error(`Invalid wei amount: ${weiAmount}`);
  }
}

/**
 * Validate if a string is a valid token amount
 * @param amount Amount to validate
 * @returns True if valid
 */
export function isValidTokenAmount(amount: string): boolean {
  try {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= 0 && isFinite(num);
  } catch {
    return false;
  }
}

/**
 * Common token decimals
 */
export const TOKEN_DECIMALS = {
  STANDARD: 18,
  USDC: 6,
  USDT: 6,
  WBTC: 8,
} as const;

/**
 * Format common token amounts for display
 */
export const COMMON_AMOUNTS = {
  '0.1': '0.1',
  '1': '1',
  '10': '10',
  '100': '100',
  '1000': '1000',
} as const; 