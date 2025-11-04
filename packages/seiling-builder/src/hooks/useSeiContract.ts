import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';
import { networkConfigs } from '../config/wagmi';
import { seiScanService } from '../services/seiScan';
import type { NetworkType } from '../config/wagmi';

/**
 * Fetch contract ABI from SeiScan or use provided ABI
 */
export function useContractABI(
  address: string | undefined,
  providedABI?: any[]
): {
  abi: any[] | null;
  isLoading: boolean;
  error: Error | null;
} {
  const chainId = useChainId();
  const network: NetworkType = chainId === 1328 ? 'testnet' : 'mainnet';

  const { data, isLoading, error } = useQuery({
    queryKey: ['contract-abi', address, network],
    queryFn: () => seiScanService.getContractABI(address!, network),
    enabled: !!address && !providedABI,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    abi: providedABI || data || null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Enhanced contract interaction hook
 * Note: This is a simplified wrapper. For actual contract calls, use useReadContract and useWriteContract directly in components.
 */
export function useSeiContract(address: string | undefined, abi: any[]) {
  const chainId = useChainId();
  const network: NetworkType = chainId === 1328 ? 'testnet' : 'mainnet';

  return {
    address,
    abi,
    network,
    chainId,
  };
}

/**
 * Get transaction history for an address
 */
export function useTransactionHistory(address?: string, limit: number = 50) {
  const chainId = useChainId();
  const network: NetworkType = chainId === 1328 ? 'testnet' : 'mainnet';

  return useQuery({
    queryKey: ['transaction-history', address, network, limit],
    queryFn: async () => {
      if (!address) return [];

      // Fetch transactions from SeiScan or RPC
      // This is a placeholder - would need actual implementation
      try {
        // Try SeiScan API first
        // If not available, fallback to RPC
        return [];
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
      }
    },
    enabled: !!address,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

/**
 * Get contract information including token info if applicable
 */
export function useContractInfo(address: string | undefined) {
  const chainId = useChainId();
  const network: NetworkType = chainId === 1328 ? 'testnet' : 'mainnet';

  const { abi } = useContractABI(address);
  const { data: tokenInfo } = useQuery({
    queryKey: ['token-info', address, network],
    queryFn: () => seiScanService.getTokenInfo(address!, network),
    enabled: !!address,
  });

  const { data: sourceCode } = useQuery({
    queryKey: ['contract-source', address, network],
    queryFn: () => seiScanService.getContractSource(address!, network),
    enabled: !!address,
  });

  return {
    abi,
    tokenInfo,
    sourceCode,
    network,
  };
}

