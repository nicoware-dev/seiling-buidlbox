import { createWalletClient, http, type Address, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as chains from 'viem/chains';
import { parseUnits, formatUnits } from 'viem';
import { createConfig, getQuote, executeRoute, getRoutes, getChains, getToken, type Token, type QuoteRequest, type Route, LiFiStep, EVM, ChainType } from '@lifi/sdk';
import type { WalletClient } from 'viem';

// DeBridge API constants
const DEBRIDGE_API_URL = 'https://api.dln.trade/v1.0/dln';
const DEBRIDGE_STATS_API_URL = 'https://stats-api.dln.trade/api';

// Chain mapping for DeBridge
const chainMap = new Map<number, Chain>();
for (const chain of Object.values(chains)) {
  if (typeof chain === 'object' && chain !== null && 'id' in chain) {
    chainMap.set(chain.id, chain as Chain);
  }
}

export function getChainById(chainId: number): Chain | undefined {
  return chainMap.get(chainId);
}

export function getChainIdFromName(chainName: string): number {
  const chain = chains[chainName as keyof typeof chains];
  if (!chain) {
    throw new Error(`Chain ${chainName} not found`);
  }
  return (chain as { id: number }).id;
}

// DeBridge interfaces
export interface DebridgeEstimation {
  srcChainTokenIn: {
    address: Address;
    amount: string;
    decimals: number;
  };
  dstChainTokenOut: {
    address: Address;
    amount: string;
    decimals: number;
  };
  estimatedGas: string;
}

export interface DebridgeTransaction {
  to: Address;
  data: `0x${string}`;
  value: string;
  chainId?: number;
}

export interface DebridgeOrderResponse {
  estimation: DebridgeEstimation;
  tx?: DebridgeTransaction;
}

/**
 * Create and execute a deBridge cross-chain order
 */
export async function createDebridgeOrder(
  agent: any, // SeiAgentKit instance
  srcChainId: number,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: number,
  dstChainTokenOut: string,
): Promise<string> {
  try {
    const userAddress = agent.wallet_address;

    // Create transaction request
    const params = new URLSearchParams({
      srcChainId: srcChainId.toString(),
      srcChainTokenIn,
      srcChainTokenInAmount,
      dstChainId: dstChainId.toString(),
      dstChainTokenOut,
      dstChainTokenOutAmount: 'auto',
      dstChainTokenOutRecipient: userAddress,
      srcChainOrderAuthorityAddress: userAddress,
      dstChainOrderAuthorityAddress: userAddress,
    });

    const response = await fetch(`${DEBRIDGE_API_URL}/order/create-tx?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create deBridge transaction: ${response.status} ${errorText}`);
    }

    const orderResponse: DebridgeOrderResponse = await response.json();

    if (!orderResponse.tx) {
      throw new Error('Failed to retrieve the full transaction object from deBridge API.');
    }

    const chain = getChainById(srcChainId);
    if (!chain) {
      throw new Error(`Unsupported source chain ID: ${srcChainId}`);
    }

    const rpcUrl = chain.rpcUrls.default?.http[0];
    if (!rpcUrl) {
      throw new Error(`No default HTTP RPC URL found for chain ID: ${srcChainId}`);
    }

    const walletClient = createWalletClient({
      account: agent.walletClient.account,
      chain,
      transport: http(rpcUrl),
    });

    const hash = await walletClient.sendTransaction({
      to: orderResponse.tx.to,
      data: orderResponse.tx.data,
      value: BigInt(orderResponse.tx.value),
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute deBridge order: ${error.message}`);
    }
    throw new Error(`Failed to execute deBridge order: ${String(error)}`);
  }
}

/**
 * Get a deBridge quote
 */
export async function getDebridgeQuote(
  srcChainId: number,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: number,
  dstChainTokenOut: string,
): Promise<DebridgeOrderResponse> {
  try {
    const params = new URLSearchParams({
      srcChainId: srcChainId.toString(),
      srcChainTokenIn,
      srcChainTokenInAmount,
      dstChainId: dstChainId.toString(),
      dstChainTokenOut,
      dstChainTokenOutAmount: 'auto',
    });

    const response = await fetch(`${DEBRIDGE_API_URL}/order/create-tx?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create deBridge transaction: ${response.status} ${errorText}`);
    }

    const data: DebridgeOrderResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get deBridge quote: ${error.message}`);
    }
    throw new Error(`Failed to get deBridge quote: ${String(error)}`);
  }
}

// LiFi SDK setup
let lifiConfigInitialized = false;

/**
 * Initialize LiFi SDK with wallet client
 */
export function initializeLifi(agent: any) {
  if (lifiConfigInitialized) return;

  const supportedChains = Object.values(chains);
  let activeWalletClient: WalletClient | undefined = agent.walletClient;

  createConfig({
    integrator: 'n8n-nodes-sei',
    providers: [
      EVM({
        getWalletClient: async () => {
          if (!activeWalletClient) {
            throw new Error('Wallet client not initialized.');
          }
          return activeWalletClient;
        },
        switchChain: async (chainId) => {
          const requiredChain = supportedChains.find(
            (c) => typeof c === 'object' && c !== null && 'id' in c && c.id === chainId
          );
          if (!requiredChain) {
            throw new Error(`Chain with ID ${chainId} is not supported.`);
          }
          activeWalletClient = createWalletClient({
            account: agent.walletClient.account,
            chain: requiredChain as Chain,
            transport: http(),
          });
          return activeWalletClient;
        },
      }),
    ],
  });

  lifiConfigInitialized = true;
}

/**
 * Get LiFi quote
 */
export async function getLifiQuote(
  agent: any,
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
): Promise<LiFiStep> {
  try {
    initializeLifi(agent);

    const token = await getLifiToken(fromChainId, fromTokenAddress);
    const amountInWei = parseUnits(fromAmount, token.decimals).toString();

    const quoteRequest: QuoteRequest = {
      fromAddress: agent.wallet_address,
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      fromAmount: amountInWei,
    };

    const quoteResult = await getQuote(quoteRequest);
    return quoteResult as LiFiStep;
  } catch (error) {
    console.error('Failed to get LiFi quote:', error);
    throw new Error('Failed to get LiFi quote.');
  }
}

/**
 * Create and execute a LiFi cross-chain swap
 */
export async function createLifiOrder(
  agent: any,
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
): Promise<Route> {
  try {
    initializeLifi(agent);

    const token = await getLifiToken(fromChainId, fromTokenAddress);
    const amountInWei = parseUnits(fromAmount, token.decimals).toString();

    const result = await getRoutes({
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount: amountInWei,
    });

    const route = result.routes[0];
    if (!route) {
      throw new Error('No route found for the given parameters');
    }

    const executedRoute = await executeRoute(route);
    return executedRoute;
  } catch (error) {
    console.error('Failed to execute LiFi order:', error);
    throw error instanceof Error ? error : new Error('Failed to execute LiFi order.');
  }
}

/**
 * Get LiFi token details
 */
export async function getLifiToken(
  chainId: number,
  tokenAddress: string,
): Promise<Token> {
  try {
    // Initialize LiFi config if needed (using a dummy agent for token lookup)
    if (!lifiConfigInitialized) {
      // For token lookups, we don't need a wallet, so we can initialize with minimal setup
      createConfig({
        integrator: 'n8n-nodes-sei',
      });
      lifiConfigInitialized = true;
    }
    
    const token = await getToken(chainId, tokenAddress);
    return token;
  } catch (error) {
    console.error(`Failed to get token ${tokenAddress} on chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Get all supported chains from LiFi
 */
export async function getLifiChains() {
  try {
    // Initialize LiFi config if needed
    if (!lifiConfigInitialized) {
      createConfig({
        integrator: 'n8n-nodes-sei',
      });
      lifiConfigInitialized = true;
    }
    
    const chains = await getChains();
    return chains;
  } catch (error) {
    console.error('Failed to fetch LiFi chains:', error);
    throw error;
  }
}

