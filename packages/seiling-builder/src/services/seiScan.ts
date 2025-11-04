import { networkConfigs } from '../config/wagmi';
import type { NetworkType } from '../config/wagmi';

// SeiScan API client
class SeiScanService {
  private getBaseUrl(network: NetworkType = 'mainnet'): string {
    const config = networkConfigs[network];
    return config.blockExplorer || 'https://seiscan.app';
  }

  private async fetchAPI(endpoint: string, network: NetworkType = 'mainnet'): Promise<any> {
    const baseUrl = this.getBaseUrl(network);
    // SeiScan API endpoint (adjust based on actual API structure)
    const url = `${baseUrl}/api${endpoint}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`SeiScan API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('SeiScan API fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch contract ABI from SeiScan (if verified)
   */
  async getContractABI(
    address: string,
    network: NetworkType = 'mainnet'
  ): Promise<any[] | null> {
    try {
      // Note: SeiScan API structure may need adjustment based on actual API documentation
      // Adjust endpoint based on actual SeiScan API documentation
      const data = await this.fetchAPI(`/contracts/${address}/abi`, network);
      return data?.result || data?.abi || null;
    } catch (error) {
      console.warn('Failed to fetch ABI from SeiScan:', error);
      return null;
    }
  }

  /**
   * Get transaction receipt/details
   */
  async getTransactionReceipt(
    txHash: string,
    network: NetworkType = 'mainnet'
  ): Promise<any | null> {
    try {
      const data = await this.fetchAPI(`/transactions/${txHash}`, network);
      return data?.result || data || null;
    } catch (error) {
      console.warn('Failed to fetch transaction from SeiScan:', error);
      return null;
    }
  }

  /**
   * Get verified contract source code
   */
  async getContractSource(
    address: string,
    network: NetworkType = 'mainnet'
  ): Promise<string | null> {
    try {
      const data = await this.fetchAPI(`/contracts/${address}/source`, network);
      return data?.result?.sourceCode || data?.sourceCode || null;
    } catch (error) {
      console.warn('Failed to fetch source code from SeiScan:', error);
      return null;
    }
  }

  /**
   * Get token info (ERC20/ERC721)
   */
  async getTokenInfo(
    address: string,
    network: NetworkType = 'mainnet'
  ): Promise<{
    name?: string;
    symbol?: string;
    decimals?: number;
    totalSupply?: string;
    type?: 'ERC20' | 'ERC721' | 'ERC1155';
  } | null> {
    try {
      const data = await this.fetchAPI(`/tokens/${address}`, network);
      return data?.result || data || null;
    } catch (error) {
      console.warn('Failed to fetch token info from SeiScan:', error);
      return null;
    }
  }

  /**
   * Get explorer URL for address
   */
  getAddressUrl(address: string, network: NetworkType = 'mainnet'): string {
    const baseUrl = this.getBaseUrl(network);
    return `${baseUrl}/address/${address}`;
  }

  /**
   * Get explorer URL for transaction
   */
  getTransactionUrl(txHash: string, network: NetworkType = 'mainnet'): string {
    const baseUrl = this.getBaseUrl(network);
    return `${baseUrl}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for contract
   */
  getContractUrl(address: string, network: NetworkType = 'mainnet'): string {
    const baseUrl = this.getBaseUrl(network);
    return `${baseUrl}/address/${address}`;
  }
}

export const seiScanService = new SeiScanService();

// Convenience functions
export const getContractABI = (address: string, network?: NetworkType) =>
  seiScanService.getContractABI(address, network);
export const getTransactionReceipt = (txHash: string, network?: NetworkType) =>
  seiScanService.getTransactionReceipt(txHash, network);
export const getContractSource = (address: string, network?: NetworkType) =>
  seiScanService.getContractSource(address, network);
export const getTokenInfo = (address: string, network?: NetworkType) =>
  seiScanService.getTokenInfo(address, network);

