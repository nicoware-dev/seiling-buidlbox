import { networkConfigs } from '../config/wagmi';
// SeiScan API client
class SeiScanService {
    getBaseUrl(network = 'mainnet') {
        const config = networkConfigs[network];
        return config.blockExplorer || 'https://seiscan.app';
    }
    async fetchAPI(endpoint, network = 'mainnet') {
        const baseUrl = this.getBaseUrl(network);
        // SeiScan API endpoint (adjust based on actual API structure)
        const url = `${baseUrl}/api${endpoint}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`SeiScan API error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('SeiScan API fetch error:', error);
            throw error;
        }
    }
    /**
     * Fetch contract ABI from SeiScan (if verified)
     */
    async getContractABI(address, network = 'mainnet') {
        try {
            // Note: SeiScan API structure may need adjustment based on actual API documentation
            // Adjust endpoint based on actual SeiScan API documentation
            const data = await this.fetchAPI(`/contracts/${address}/abi`, network);
            return data?.result || data?.abi || null;
        }
        catch (error) {
            console.warn('Failed to fetch ABI from SeiScan:', error);
            return null;
        }
    }
    /**
     * Get transaction receipt/details
     */
    async getTransactionReceipt(txHash, network = 'mainnet') {
        try {
            const data = await this.fetchAPI(`/transactions/${txHash}`, network);
            return data?.result || data || null;
        }
        catch (error) {
            console.warn('Failed to fetch transaction from SeiScan:', error);
            return null;
        }
    }
    /**
     * Get verified contract source code
     */
    async getContractSource(address, network = 'mainnet') {
        try {
            const data = await this.fetchAPI(`/contracts/${address}/source`, network);
            return data?.result?.sourceCode || data?.sourceCode || null;
        }
        catch (error) {
            console.warn('Failed to fetch source code from SeiScan:', error);
            return null;
        }
    }
    /**
     * Get token info (ERC20/ERC721)
     */
    async getTokenInfo(address, network = 'mainnet') {
        try {
            const data = await this.fetchAPI(`/tokens/${address}`, network);
            return data?.result || data || null;
        }
        catch (error) {
            console.warn('Failed to fetch token info from SeiScan:', error);
            return null;
        }
    }
    /**
     * Get explorer URL for address
     */
    getAddressUrl(address, network = 'mainnet') {
        const baseUrl = this.getBaseUrl(network);
        return `${baseUrl}/address/${address}`;
    }
    /**
     * Get explorer URL for transaction
     */
    getTransactionUrl(txHash, network = 'mainnet') {
        const baseUrl = this.getBaseUrl(network);
        return `${baseUrl}/tx/${txHash}`;
    }
    /**
     * Get explorer URL for contract
     */
    getContractUrl(address, network = 'mainnet') {
        const baseUrl = this.getBaseUrl(network);
        return `${baseUrl}/address/${address}`;
    }
}
export const seiScanService = new SeiScanService();
// Convenience functions
export const getContractABI = (address, network) => seiScanService.getContractABI(address, network);
export const getTransactionReceipt = (txHash, network) => seiScanService.getTransactionReceipt(txHash, network);
export const getContractSource = (address, network) => seiScanService.getContractSource(address, network);
export const getTokenInfo = (address, network) => seiScanService.getTokenInfo(address, network);
