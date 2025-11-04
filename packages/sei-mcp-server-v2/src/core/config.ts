import dotenv from 'dotenv';
import { z } from 'zod';
import { type Hex } from 'viem';

// Load environment variables from .env file
dotenv.config();

// Define environment variable schema
const envSchema = z.object({
  PRIVATE_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  SEITRACE_API_KEY: z.string().optional(),
  OPENSEA_API_KEY: z.string().optional(),
  HIVE_INTELLIGENCE_API_KEY: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

// Format private key with 0x prefix if it exists
const formatPrivateKey = (key?: string): string | undefined => {
  if (!key) return undefined;

  // Ensure the private key has 0x prefix
  return key.startsWith('0x') ? key : `0x${key}`;
};

// Runtime configuration that can be updated
let runtimeConfig = {
  privateKey: env.success ? formatPrivateKey(env.data.PRIVATE_KEY) : undefined,
};

// Export validated environment variables with formatted private key
export const config = {
  get privateKey() {
    return runtimeConfig.privateKey;
  },
  set privateKey(key: string | undefined) {
    runtimeConfig.privateKey = formatPrivateKey(key);
  }
};

/**
 * Get the private key from environment variable as a Hex type for viem.
 * Returns undefined if the PRIVATE_KEY environment variable is not set.
 * @returns Private key from environment variable as Hex or undefined
 */
export function getPrivateKeyAsHex(): Hex | undefined {
  const key = config.privateKey as Hex | undefined;
  return key;
}

/**
 * Update the private key at runtime (useful for URL-based MCP connections)
 * @param privateKey - The new private key to set
 */
export function updatePrivateKey(privateKey: string): void {
  console.error(`🔑 Received private key for update: "${privateKey}"`);
  console.error(`🔑 Private key length: ${privateKey.length}`);
  console.error(`🔑 Private key starts with 0x: ${privateKey.startsWith('0x')}`);
  
  config.privateKey = privateKey;
  
  console.error(`🔑 After formatting: "${config.privateKey}"`);
  console.error(`🔑 After formatting length: ${config.privateKey?.length}`);
  console.error('Private key updated successfully');
}

/**
 * Get CoinGecko API key from environment (if provided).
 * If absent, returns undefined and the free API will be used.
 */
export function getCoinGeckoApiKey(): string | undefined {
  // Prefer validated env if available, else read directly
  if (env.success && env.data.COINGECKO_API_KEY) {
    return env.data.COINGECKO_API_KEY;
  }
  return process.env.COINGECKO_API_KEY;
}

/**
 * Get SeiTrace API key from environment (if provided).
 */
export function getSeiTraceApiKey(): string | undefined {
  if (env.success && env.data.SEITRACE_API_KEY) {
    return env.data.SEITRACE_API_KEY;
  }
  return process.env.SEITRACE_API_KEY;
}

/**
 * Get OpenSea API key from environment (if provided).
 */
export function getOpenSeaApiKey(): string | undefined {
  if (env.success && env.data.OPENSEA_API_KEY) {
    return env.data.OPENSEA_API_KEY;
  }
  return process.env.OPENSEA_API_KEY;
}

/**
 * Get Hive Intelligence API key from environment (if provided).
 */
export function getHiveIntelligenceApiKey(): string | undefined {
  if (env.success && env.data.HIVE_INTELLIGENCE_API_KEY) {
    return env.data.HIVE_INTELLIGENCE_API_KEY;
  }
  return process.env.HIVE_INTELLIGENCE_API_KEY;
}
