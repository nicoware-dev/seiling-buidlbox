import { createWalletClient, http, type Address, type Chain } from 'viem';
import { getPublicClient, getWalletClient } from './clients.js';
import * as chains from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getPrivateKeyAsHex } from '../config.js';

const DEBRIDGE_API_URL = 'https://api.dln.trade/v1.0/dln';
const DEBRIDGE_STATS_API_URL = 'https://stats-api.dln.trade/api';

/**
 * Represents the estimation part of a deBridge order response.
 */
export interface DebridgeEstimation {
  srcChainTokenIn: {
    address: Address;
    amount: string;
    decimals: number;
  };
  dstChainTokenOut: {
    address:Address;
    amount: string;
    decimals: number;
  };
  estimatedGas: string;
}

/**
 * Represents the transaction part of a deBridge order response.
 */
export interface DebridgeTransaction {
  to: Address;
  data: `0x${string}`;
  value: string;
  chainId?: number;
}

/**
 * Represents the full response from the deBridge create-tx endpoint.
 */
export interface DebridgeOrderResponse {
  estimation: DebridgeEstimation;
  tx?: DebridgeTransaction;
}

/**
 * Represents the status of a deBridge order.
 */
export interface DebridgeOrderStatus {
    status: 'Fulfilled' | 'SentUnlock' | 'ClaimedUnlock' | 'Created' | 'OrderCancelled' | 'SentOrderCancel' | 'ClaimedOrderCancel';
}

/**
 * Represents the response for order IDs from a transaction hash.
 */
export interface DebridgeOrderIdsResponse {
    orderIds: string[];
}

/**
 * Parameters for filtering orders by wallet address.
 */
export interface DebridgeOrderFilter {
    address: string;
    orderStates?: string[];
    giveChainIds?: number[];
    takeChainIds?: number[];
    skip?: number;
    take?: number;
}

/**
 * Represents the response for a cancellation transaction.
 */
export interface DebridgeCancelResponse {
    tx: DebridgeTransaction;
}

// Create a map of chainId -> chainObject for efficient lookups.
const chainMap = new Map<number, Chain>();
// Iterate over all exports from viem/chains and populate the map.
for (const chain of Object.values(chains)) {
  // This check filters out the 'default' export and other non-chain objects.
  if (typeof chain === 'object' && chain !== null && 'id' in chain) {
    chainMap.set(chain.id, chain as Chain);
  }
}

/**
 * Gets a chain object directly by its ID.
 * @param chainId The ID of the chain.
 * @returns The chain object from viem/chains.
 */
export function getChainById(chainId: number): Chain | undefined {
  return chainMap.get(chainId);
}

/**
 * Converts a chain name to its corresponding chain ID.
 *
 * @param chainName The name of the chain (e.g., 'ethereum', 'avalanche').
 * @returns The ID of the chain as a number.
 * @throws Error if the chain name is not found.
 */
export function getChainIdFromName(chainName: string) {
  const chain = chains[chainName as keyof typeof chains];
  if (!chain) {
    throw new Error(`Chain ${chainName} not found`);
  }
  return (chain as { id: number }).id;
}

/**
 * Fetches a quote from the deBridge API for a cross-chain order.
 * IMPORTANT: This tool is for development and display purposes only.
 * Do not use it in production transaction flows.
 *
 * @param srcChain The name of the source chain.
 * @param srcChainTokenIn The address of the token to send from the source chain.
 * @param srcChainTokenInAmount The amount of the source token to send (in wei).
 * @param dstChain The name of the destination chain.
 * @param dstChainTokenOut The address of the token to receive on the destination chain.
 * @returns A promise that resolves to the deBridge order response.
 */
export async function getDebridgeQuote(
  srcChain: string,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChain: string,
  dstChainTokenOut: string,
): Promise<DebridgeOrderResponse> {
  try {
    const params = new URLSearchParams({
      srcChainId: getChainIdFromName(srcChain).toString(),
      srcChainTokenIn,
      srcChainTokenInAmount,
      dstChainId: getChainIdFromName(dstChain).toString(),
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

/**
 * Creates a deBridge order transaction or estimation.
 * This function is dual-purpose:
 * - If wallet details (recipient and authority addresses) are provided, it returns a full transaction object.
 * - If wallet details are omitted, it returns only an estimation.
 *
 * @param srcChainId The ID of the source chain.
 * @param srcChainTokenIn The address of the input token on the source chain.
 * @param srcChainTokenInAmount The amount of the input token.
 * @param dstChainId The ID of the destination chain.
 * @param dstChainTokenOut The address of the output token on the destination chain.
 * @param dstChainTokenOutRecipient The recipient's address on the destination chain (optional, for full tx).
 * @param srcChainOrderAuthorityAddress The user's address on the source chain (optional, for full tx).
 * @param dstChainOrderAuthorityAddress The user's address on the destination chain (optional, for full tx).
 * @returns A promise that resolves to the deBridge order response.
 */
export async function createDebridgeTx(
  srcChainId: number,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: number,   
  dstChainTokenOut: string,
  dstChainTokenOutRecipient?: string,
  srcChainOrderAuthorityAddress?: string,
  dstChainOrderAuthorityAddress?: string
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

    if (dstChainTokenOutRecipient) {
      params.append('dstChainTokenOutRecipient', dstChainTokenOutRecipient);
    }
    if (srcChainOrderAuthorityAddress) {
      params.append('srcChainOrderAuthorityAddress', srcChainOrderAuthorityAddress);
    }
    if (dstChainOrderAuthorityAddress) {
      params.append('dstChainOrderAuthorityAddress', dstChainOrderAuthorityAddress);
    }

    const response = await fetch(`${DEBRIDGE_API_URL}/order/create-tx?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create deBridge transaction: ${response.status} ${errorText}`);
    }

    const data: DebridgeOrderResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create deBridge transaction: ${error.message}`);
    }
    throw new Error(`Failed to create deBridge transaction: ${String(error)}`);
  }
}

/**
 * Create and execute a deBridge cross-chain order.
 * This function fetches the transaction data from the deBridge API and sends it to the blockchain.
 *
 * @param srcChainId The ID of the source chain.
 * @param srcChainTokenIn The address of the input token on the source chain.
 * @param srcChainTokenInAmount The amount of the input token.
 * @param dstChainId The ID of the destination chain.
 * @param dstChainTokenOut The address of the output token on the destination chain.
 * @param userAddress The user's wallet address for sending and receiving.
 * @param network The network to perform the transaction on. Defaults to DEFAULT_NETWORK.
 * @returns A promise that resolves to the transaction hash.
 */
export async function createDebridgeOrder(
  srcChainId: number,
  srcChainTokenIn: string,
  srcChainTokenInAmount: string,
  dstChainId: number,
  dstChainTokenOut: string,
): Promise<`0x${string}`> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);
    const userAddress = account.address;

    const orderResponse = await createDebridgeTx(
      srcChainId,
      srcChainTokenIn,
      srcChainTokenInAmount,
      dstChainId,
      dstChainTokenOut,
      userAddress,
      userAddress,
      userAddress
    );

    if (!orderResponse.tx) {
      throw new Error('Failed to retrieve the full transaction object from deBridge API.');
    }

    console.log('Executing deBridge transaction...');

    const chain = getChainById(srcChainId);
    if (!chain) {
      throw new Error(`Unsupported source chain ID: ${srcChainId}`);
    }
    
    const rpcUrl = chain.rpcUrls.default?.http[0];
    if (!rpcUrl) {
      throw new Error(`No default HTTP RPC URL found for chain ID: ${srcChainId}`);
    }

    const walletClient = createWalletClient({
      account,
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
 * Retrieves a list of deBridge orders for a given wallet address with optional filters.
 * @param filter The filter criteria for querying orders.
 * @returns A promise that resolves to a list of orders.
 */
export async function getDebridgeOrdersByWallet(filter: DebridgeOrderFilter): Promise<any> {
    try {
        const response = await fetch(`${DEBRIDGE_STATS_API_URL}/Orders/filteredList`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...filter,
                maker: filter.address,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get deBridge orders: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get deBridge orders by wallet: ${error.message}`);
        }
        throw new Error(`Failed to get deBridge orders by wallet: ${String(error)}`);
    }
}

/**
 * Retrieves the details of a deBridge order by its creation transaction hash.
 * @param txHash The transaction hash of the order creation.
 * @returns A promise that resolves to the order details.
 */
export async function getDebridgeOrderByTxHash(txHash: string): Promise<any> {
    try {
        const response = await fetch(`${DEBRIDGE_STATS_API_URL}/Orders/creationTxHash/${txHash}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get deBridge order: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get deBridge order by transaction hash: ${error.message}`);
        }
        throw new Error(`Failed to get deBridge order by transaction hash: ${String(error)}`);
    }
}

/**
 * Retrieves all order IDs created in a single transaction.
 * @param txHash The transaction hash.
 * @returns A promise that resolves to a response containing the order IDs.
 */
export async function getDebridgeOrderIdsByTxHash(txHash: string): Promise<DebridgeOrderIdsResponse> {
    try {
        const response = await fetch(`${DEBRIDGE_STATS_API_URL}/Transaction/${txHash}/orderIds`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get deBridge order IDs: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(`DeBridge API Error: ${data.error}`);
        }
        
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get deBridge order IDs by transaction hash: ${error.message}`);
        }
        throw new Error(`Failed to get deBridge order IDs by transaction hash: ${String(error)}`);
    }
}

/**
 * Retrieves the status of a specific deBridge order by its ID.
 * @param orderId The ID of the order.
 * @returns A promise that resolves to the order status.
 */
export async function getDebridgeOrderStatus(orderId: string): Promise<DebridgeOrderStatus> {
    try {
        const response = await fetch(`${DEBRIDGE_STATS_API_URL}/Orders/${orderId}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get deBridge order status: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(`DeBridge API Error: ${data.error}`);
        }
        
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to get deBridge order status by order ID: ${error.message}`);
        }
        throw new Error(`Failed to get deBridge order status by order ID: ${String(error)}`);
    }
}

/**
 * Initiates the cancellation of an unfulfilled deBridge order.
 * This fetches a cancellation transaction and executes it on the destination chain.
 * @param orderId The ID of the order to cancel.
 * @returns A promise that resolves to the cancellation transaction hash.
 */
export async function cancelDebridgeOrder(
    orderId: string,
): Promise<any> {
    try {
        const privateKey = getPrivateKeyAsHex();
        if (!privateKey) throw new Error('Private key not available.');

        const account = privateKeyToAccount(`0x${privateKey.replace(/^0x/, '')}`);

        const response = await fetch(`${DEBRIDGE_API_URL}/order/${orderId}/cancel-tx`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get deBridge cancellation transaction: ${response.status} ${errorText}`);
        }

        const tx = await response.json();
        console.log('Cancel response:', tx);

        if (!tx.data || Object.keys(tx.data).length === 0) {
            throw new Error('Cancellation transaction is not available or not ready.');
        }

        console.log(`Executing cancellation for order ${orderId} on chain ${tx.chainId}`);
        
        if (!tx.chainId) {
            throw new Error('Chain ID is undefined in the transaction response.');
        }
        const chain = getChainById(tx.txHash.chainId);
        if (!chain) {
        throw new Error(`Unsupported destination chain ID: ${tx.chainId}`);
        }
        
        const rpcUrl = chain.rpcUrls.default?.http[0];
        if (!rpcUrl) {
            throw new Error(`No default HTTP RPC URL found for chain ID: ${tx.chainId}`);
        }

        const walletClient = createWalletClient({
        account,
        chain,
        transport: http(rpcUrl),
        });

        if (tx.chainId && tx.chainId !== tx.chainId) {
            throw new Error(`Chain ID mismatch: API returned ${tx.chainId}, expected ${tx.chainId}`);
        }

        const hash = await walletClient.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
            account: walletClient.account!,
            chain: walletClient.chain,
        });

        return hash;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to cancel deBridge order: ${error.message}`);
        }
        throw new Error(`Failed to cancel deBridge order: ${String(error)}`);
    }
}