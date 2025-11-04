import { createWalletClient, formatUnits, parseUnits, http, type Address, type Chain, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as chains from 'viem/chains';
import { createConfig, getQuote, executeRoute, type Route, type ExecutionStatus, type UpdateRouteHook, type QuoteRequest, type FullStatusData, LiFiStep, EVM, getRoutes, ChainType, getChains, getToken, type Token, getTokenAllowance } from '@lifi/sdk';
import { getPrivateKeyAsHex } from '../config.js';

// ----------- CONFIGURE THE SDK -----------

const supportedChains = Object.values(chains);

const privateKey = getPrivateKeyAsHex();
if (!privateKey) throw new Error('Private key not available.');

const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
const userAddress = account.address;

// Create a variable to hold the currently active wallet client
let activeWalletClient: WalletClient | undefined = createWalletClient({
    account,
    chain: chains.sei,
    transport: http(),
});

createConfig({
  integrator: 'sei-mcp-server',
  providers: [
    EVM({
      getWalletClient: async () => {
        if (!activeWalletClient) {
            throw new Error('Wallet client not initialized.');
        }
        return activeWalletClient;
      },
      switchChain: async (chainId) => {
        const requiredChain = supportedChains.find((c) => typeof c === 'object' && c !== null && 'id' in c && c.id === chainId);
        if (!requiredChain) {
          throw new Error(`Chain with ID ${chainId} is not supported.`);
        }
        // Create a new client for the requested chain and make it the active one
        activeWalletClient = createWalletClient({
          account,
          chain: requiredChain as Chain,
          transport: http(),
        });
        return activeWalletClient;
      },
    }),
  ],
});


// Create a map of chainId -> chainObject for efficient lookups.
const chainMap = new Map<number, Chain>();
for (const chain of Object.values(chains)) {
  if (typeof chain === 'object' && chain !== null && 'id' in chain) {
    chainMap.set(chain.id, chain as Chain);
  }
}

// ----------- Service Functions -----------

/**
 * Fetches all EVM chains supported by the LI.FI SDK.
 * This is a standalone function that can be called once at application startup.
 * @returns A promise that resolves to an array of chain objects.
 */
export async function getLifiChains() {
  try {
    console.log('Fetching supported EVM chains...');
    const chains = await getChains();
    console.log(`Successfully fetched ${chains.length} chains.`);
    return chains;
  } catch (error) {
    console.error('Failed to fetch LI.FI chains:', error);
    throw error;
  }
}

/**
 * Fetches a single, best quote from the LiFi API.
 * This includes the transaction data needed for execution.
 * @param fromChainId The ID of the source chain.
 * @param toChainId The ID of the destination chain.
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param fromAmount The amount of the input token.
 * @returns A promise that resolves to the quote object.
 */
export async function getLifiQuote(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
): Promise<LiFiStep> {
  try {
    const token = await getLifiToken(fromChainId, fromTokenAddress);
    const amountInWei = (parseUnits(fromAmount, token.decimals)).toString();
    const quoteRequest: QuoteRequest = {
      fromAddress: userAddress,
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
 * Fetches a single, best route from the LiFi API.
 * This includes the transaction data needed for execution.
 * @param fromChainId The ID of the source chain.
 * @param toChainId The ID of the destination chain.
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param fromAmount The amount of the input token.
 * @returns A promise that resolves to the route object.
 */
export async function getLifiRoute(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
): Promise<any> {
  try {
    const token = await getLifiToken(fromChainId, fromTokenAddress);
    const amountInWei = (parseUnits(fromAmount, token.decimals)).toString();
    const routeRequest = {
      fromAddress: userAddress,
      fromChainId: fromChainId,
      toChainId: toChainId,
      fromTokenAddress: fromTokenAddress,
      toTokenAddress: toTokenAddress,
      fromAmount: amountInWei,
    };
    const routeResult = await getRoutes(routeRequest);
    return routeResult;
  } catch (error) {
    console.error('Failed to get LiFi quote:', error);
    throw new Error('Failed to get LiFi quote.');
  }
}

/**
 * Create and execute a LiFi cross-chain swap.
 * This is a high-level function that handles getting a route and executing it.
 * @param fromChainId The ID of the source chain.
 * @param toChainId The ID of the destination chain.
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param fromAmount The amount of the input token.
 * @returns A promise that resolves to the executed route object.
 */
export async function createLifiOrder(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  fromAmount: string,
): Promise<Route> {
  const result = await getRoutes({
    fromChainId,
    toChainId,
    fromTokenAddress,
    toTokenAddress,
    fromAmount,
    });
  const route = result.routes[0];

  console.log(`Executing transaction for address ${account.address}...`);
  const executedRoute = await executeRoute(route);
  console.log('Transaction executed successfully.');
  return executedRoute;
}

/**
 * Fetches details for a specific token on a given chain.
 * @param chainId The ID of the chain where the token exists.
 * @param tokenAddress The contract address of the token.
 * @returns A promise that resolves to a Token object.
 */
export async function getLifiToken(
  chainId: number,
  tokenAddress: string,
): Promise<Token> {
  try {
    const token = await getToken(chainId, tokenAddress);
    return token;
  } catch (error) {
    console.error(`Failed to get token ${tokenAddress} on chain ${chainId}:`, error);
    throw error;
  }
}

/**
 * Checks the token allowance for a spender.
 * @param token The token to check.
 * @param ownerAddress The address of the token owner.
 * @param spenderAddress The address of the contract that can spend the token.
 * @returns A promise that resolves to the allowance amount as a string.
 */
async function getLifiTokenAllowance(
  token: Token,
  ownerAddress: string,
  spenderAddress: string,
): Promise<any> {
  try {
    const allowance = await getTokenAllowance(token, ownerAddress as `0x${string}`, spenderAddress as `0x${string}`);
    return allowance;
  } catch (error) {
    console.error(`Failed to get allowance for ${spenderAddress}:`, error);
    throw error;
  }
}