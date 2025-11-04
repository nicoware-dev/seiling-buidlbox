import { getSeiTraceApiKey } from '../config.js';

// SeiTrace API Configuration
const SEITRACE_BASE_URL = 'https://seitrace.com/insights';

// --- Internal Helper Functions ---

/**
 * Maps user-friendly network names to the chain_id required by the SeiTrace API.
 * @param network The network name (e.g., 'sei', 'sei-testnet').
 * @returns The corresponding chain_id.
 */
function networkToChainId(network: string): 'pacific-1' | 'atlantic-2' | 'arctic-1' {
    switch (network) {
        case 'sei':
        case '1329':
        case 'pacific-1':
            return 'pacific-1';
        case 'sei-testnet':
        case '1328':
        case 'atlantic-2':
            return 'atlantic-2';
        case 'sei-devnet':
        case '713715':
        case 'arctic-1':
            return 'arctic-1';
        default:
            throw new Error(`Unsupported network for SeiTrace API: ${network}`);
    }
}

/**
 * Makes a request to the SeiTrace API.
 * @param endpoint The API endpoint to call.
 * @param params The query parameters for the request.
 * @returns The JSON response from the API.
 */
async function makeSeiTraceRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  const apiKey = getSeiTraceApiKey() || process.env.SEITRACE_API_KEY || '';
  if (!apiKey) {
    console.warn('SeiTrace API key not provided. Some endpoints may not work.');
  }

  const fullUrl = `${SEITRACE_BASE_URL}${endpoint}`;
  const url = new URL(fullUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v.toString()));
      } else {
        url.searchParams.append(key, value.toString());
      }
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'Sei-MCP-Server/1.0'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`SeiTrace API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const result = await response.json();
  return result as T;
}

// --- Types and Interfaces ---

export interface AddressDetail {
    address: string;
    chain_id: string;
    balance?: string;
    balance_usd?: string;
    transactions_count?: number;
    first_transaction_at?: string;
    last_transaction_at?: string;
    token_balances?: Array<{
      token_address: string;
      token_name: string;
      token_symbol: string;
      balance: string;
      balance_usd?: string;
    }>;
    nft_count?: number;
  }
  
  export interface SmartContractDetail {
      address: string;
      chain_id: string;
      creator_address?: string;
      creation_tx_hash?: string;
      creation_timestamp?: string;
      is_verified?: boolean;
      source_code?: string;
      abi?: any[];
      name?: string;
      compiler_version?: string;
  }
  
  export interface Transaction {
    hash: string;
    block_number: number;
    timestamp: string;
    from_address: string;
    to_address: string;
    value: string;
    gas_used: string;
    gas_price: string;
    status: 'SUCCESS' | 'ERROR';
    transaction_type?: string;
    method?: string;
  }
  
  export interface TokenTransfer {
    hash: string;
    block_number: number;
    timestamp: string;
    from_address: string;
    to_address: string;
    token_address: string;
    token_name?: string;
    token_symbol?: string;
    token_decimals?: number;
    value: string;
    value_formatted?: string;
    transfer_type: 'IN' | 'OUT' | 'SELF';
  }
  
  export interface Erc20TokenTransfer {
    hash: string;
    block_number: number;
    timestamp: string;
    from_address: string;
    to_address: string;
    token_address: string;
    token_name?: string;
    token_symbol?: string;
    token_decimals?: number;
    value: string;
    value_formatted?: string;
    transaction_fee?: string;
    gas_used?: string;
    gas_price?: string;
  }
  
  export interface Erc721TokenTransfer {
      hash: string;
      block_number: number;
      timestamp: string;
      from_address: string;
      to_address: string;
      token_address: string;
      token_id: string;
  }
  
  export interface Erc1155TokenTransfer {
      hash: string;
      block_number: number;
      timestamp: string;
      from_address: string;
      to_address: string;
      token_address: string;
      token_id: string;
      value: string;
  }
  
  export interface NativeTransfer {
      hash: string;
      block_number: number;
      timestamp: string;
      from_address: string;
      to_address: string;
      denom: string;
      amount: string;
  }
  
  export interface Erc20TokenHolder {
    holder_address: string;
    balance: string;
    balance_formatted?: string;
    balance_usd?: string;
    percentage?: number;
  }
  
  export interface Erc721TokenHolder {
      holder_address: string;
      balance: string;
  }
  
  export interface Erc1155TokenHolder {
      holder_address: string;
      balance: string;
  }
  
  export interface NativeTokenHolder {
      holder_address: string;
      amount: string;
  }
  
  export interface PaginatedAddressTransactions {
    transactions: Transaction[];
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }
  
  export interface PaginatedAddressTokenTransfers {
    token_transfers: TokenTransfer[];
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }
  
  export interface PaginatedErc20TokenTransfer {
    erc20_token_transfers: Erc20TokenTransfer[];
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }
  
  export interface PaginatedErc721TokenTransfer {
      erc721_token_transfers: Erc721TokenTransfer[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedErc1155TokenTransfer {
      erc1155_token_transfers: Erc1155TokenTransfer[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedNativeTransfer {
      native_transfers: NativeTransfer[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedErc20TokenHolder {
    erc20_token_holders: Erc20TokenHolder[];
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }
  
  export interface PaginatedErc721TokenHolder {
      erc721_token_holders: Erc721TokenHolder[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedErc1155TokenHolder {
      erc1155_token_holders: Erc1155TokenHolder[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedNativeTokenHolder {
      native_token_holders: NativeTokenHolder[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface Erc20TokenInfo {
    contract_address: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    total_supply?: string;
    chain_id: string;
  }
  
  export interface Erc721TokenInfo {
      contract_address: string;
      name?: string;
      symbol?: string;
      chain_id: string;
  }
  
  export interface Erc1155TokenInfo {
      contract_address: string;
      name?: string;
      symbol?: string;
      chain_id: string;
  }
  
  export interface NativeTokenInfo {
      denom: string;
      name?: string;
      symbol?: string;
      decimals?: number;
      total_supply?: string;
      chain_id: string;
  }
  
  export interface Erc721TokenInstance {
      token_id: string;
      owner_address: string;
      metadata_uri?: string;
      metadata?: Record<string, any>;
  }
  
  export interface Erc1155TokenInstance {
      token_id: string;
      metadata_uri?: string;
      metadata?: Record<string, any>;
  }
  
  export interface PaginatedErc721Token {
      tokens: Erc721TokenInstance[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedErc1155Token {
      tokens: Erc1155TokenInstance[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface Erc20Balance {
    token_address: string;
    token_name?: string;
    token_symbol?: string;
    token_decimals?: number;
    balance: string;
    balance_formatted?: string;
    balance_usd?: string;
  }
  
  export interface Erc721Balance {
      token_address: string;
      token_name?: string;
      token_symbol?: string;
      balance: string;
  }
  
  export interface Erc1155Balance {
      token_address: string;
      token_name?: string;
      token_symbol?: string;
      balance: string;
  }
  
  export interface NativeBalance {
      denom: string;
      amount: string;
  }
  
  export interface PaginatedErc20Balance {
    erc20_balances: Erc20Balance[];
    total_count: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }
  
  export interface PaginatedErc721Balance {
      erc721_balances: Erc721Balance[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedErc1155Balance {
      erc1155_balances: Erc1155Balance[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }
  
  export interface PaginatedNativeBalance {
      native_balances: NativeBalance[];
      total_count: number;
      limit: number;
      offset: number;
      has_more: boolean;
  }

// --- Exported Service Functions ---

export const getAddressDetails = (network: string, address: string) => 
    makeSeiTraceRequest<AddressDetail>('/api/v2/addresses', { chain_id: networkToChainId(network), address });

export const getSmartContractDetails = (network: string, address: string) =>
    makeSeiTraceRequest<SmartContractDetail>('/api/v2/smart-contract', { chain_id: networkToChainId(network), address });

export const getAddressTransactions = (network: string, address: string, status: 'ALL' | 'SUCCESS' | 'ERROR', options?: { limit?: number; offset?: number; from_date?: string; to_date?: string }) =>
    makeSeiTraceRequest<PaginatedAddressTransactions>('/api/v2/addresses/transactions', { chain_id: networkToChainId(network), address, status, ...options });

export const getAddressTokenTransfers = (network: string, address: string, options?: { limit?: number; offset?: number; from_date?: string; to_date?: string }) =>
    makeSeiTraceRequest<PaginatedAddressTokenTransfers>('/api/v2/addresses/token-transfers', { chain_id: networkToChainId(network), address, ...options });

export const getErc20TokenInfo = (network: string, contract_address: string) =>
    makeSeiTraceRequest<Erc20TokenInfo>('/api/v2/token/erc20', { chain_id: networkToChainId(network), contract_address });

export const getErc721TokenInfo = (network: string, contract_address: string) =>
    makeSeiTraceRequest<Erc721TokenInfo>('/api/v2/token/erc721', { chain_id: networkToChainId(network), contract_address });

export const getErc1155TokenInfo = (network: string, contract_address: string) =>
    makeSeiTraceRequest<Erc1155TokenInfo>('/api/v2/token/erc1155', { chain_id: networkToChainId(network), contract_address });

export const getNativeTokenInfo = (network: string, token_denom: string) =>
    makeSeiTraceRequest<NativeTokenInfo>('/api/v2/token/native', { chain_id: networkToChainId(network), token_denom });

export const getErc721Instances = (network: string, contract_address: string, options?: { limit?: number; offset?: number; token_id?: string }) =>
    makeSeiTraceRequest<PaginatedErc721Token>('/api/v2/token/erc721/instances', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc1155Instances = (network: string, contract_address: string, options?: { limit?: number; offset?: number; token_id?: string }) =>
    makeSeiTraceRequest<PaginatedErc1155Token>('/api/v2/token/erc1155/instances', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc20Balances = (network: string, address: string, options?: { limit?: number; offset?: number; token_contract_list?: string[] }) =>
    makeSeiTraceRequest<PaginatedErc20Balance>('/api/v2/token/erc20/balances', { chain_id: networkToChainId(network), address, ...options });

export const getErc721Balances = (network: string, address: string, options?: { limit?: number; offset?: number; token_contract_list?: string[] }) =>
    makeSeiTraceRequest<PaginatedErc721Balance>('/api/v2/token/erc721/balances', { chain_id: networkToChainId(network), address, ...options });

export const getErc1155Balances = (network: string, address: string, options?: { limit?: number; offset?: number; token_contract_list?: string[] }) =>
    makeSeiTraceRequest<PaginatedErc1155Balance>('/api/v2/token/erc1155/balances', { chain_id: networkToChainId(network), address, ...options });

export const getNativeBalances = (network: string, address: string, options?: { limit?: number; offset?: number; token_denom_list?: string[] }) =>
    makeSeiTraceRequest<PaginatedNativeBalance>('/api/v2/token/native/balances', { chain_id: networkToChainId(network), address, ...options });

export const getErc20TokenTransfers = (network: string, contract_address: string, options?: { wallet_address?: string; limit?: number; offset?: number; from_date?: string; to_date?: string }) =>
    makeSeiTraceRequest<PaginatedErc20TokenTransfer>('/api/v2/token/erc20/transfers', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc721TokenTransfers = (network: string, contract_address: string, options?: { wallet_address?: string; limit?: number; offset?: number; from_date?: string; to_date?: string; token_id?: string }) =>
    makeSeiTraceRequest<PaginatedErc721TokenTransfer>('/api/v2/token/erc721/transfers', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc1155TokenTransfers = (network: string, contract_address: string, options?: { wallet_address?: string; limit?: number; offset?: number; from_date?: string; to_date?: string; token_id?: string }) =>
    makeSeiTraceRequest<PaginatedErc1155TokenTransfer>('/api/v2/token/erc1155/transfers', { chain_id: networkToChainId(network), contract_address, ...options });

export const getNativeTokenTransfers = (network: string, token_denom: string, options?: { wallet_address?: string; limit?: number; offset?: number; from_date?: string; to_date?: string }) =>
    makeSeiTraceRequest<PaginatedNativeTransfer>('/api/v2/token/native/transfers', { chain_id: networkToChainId(network), token_denom, ...options });

export const getErc20TokenHolders = (network: string, contract_address: string, options?: { limit?: number; offset?: number }) =>
    makeSeiTraceRequest<PaginatedErc20TokenHolder>('/api/v2/token/erc20/holders', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc721TokenHolders = (network: string, contract_address: string, options?: { wallet_address?: string; limit?: number; offset?: number }) =>
    makeSeiTraceRequest<PaginatedErc721TokenHolder>('/api/v2/token/erc721/holders', { chain_id: networkToChainId(network), contract_address, ...options });

export const getErc1155TokenHolders = (network: string, contract_address: string, options?: { wallet_address?: string; limit?: number; offset?: number }) =>
    makeSeiTraceRequest<PaginatedErc1155TokenHolder>('/api/v2/token/erc1155/holders', { chain_id: networkToChainId(network), contract_address, ...options });

export const getNativeTokenHolders = (network: string, token_denom: string, options?: { limit?: number; offset?: number }) =>
    makeSeiTraceRequest<PaginatedNativeTokenHolder>('/api/v2/token/native/holders', { chain_id: networkToChainId(network), token_denom, ...options });
