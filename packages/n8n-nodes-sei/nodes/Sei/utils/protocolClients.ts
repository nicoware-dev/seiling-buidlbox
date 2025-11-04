import { SeiAgentKit } from '@sei-agent-kit-custom';
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  Address,
  PrivateKeyAccount,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SeiBlockchains } from '../commons';

/**
 * Creates a custom Sei chain configuration for viem
 */
function createCustomSeiChain(rpcUrl: string, chainId: number) {
  return defineChain({
    id: chainId,
    name: 'Sei Custom',
    nativeCurrency: {
      decimals: 18,
      name: 'Sei',
      symbol: 'SEI',
    },
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
    blockExplorers: {
      default: {
        name: 'Sei Explorer',
        url: 'https://seitrace.com',
      },
    },
  });
}

/**
 * Creates a SeiAgentKit instance configured for the specified chain and RPC
 * @param chain - Chain identifier from commons (sei-mainnet, sei-testnet, or empty for custom)
 * @param customRpc - Custom RPC URL (required if chain is empty/custom)
 * @param credentials - Credentials containing privateKey
 * @returns Initialized SeiAgentKit instance
 */
export async function createProtocolClient(
  chain: string,
  customRpc: string,
  credentials: { privateKey: string }
): Promise<SeiAgentKit> {
  if (!credentials?.privateKey) {
    throw new Error('Private key is required in credentials');
  }

  // Determine RPC URL and chain ID
  let rpcUrl: string;
  let chainId: number;

  if (!chain || chain === '' || chain === 'custom') {
    if (!customRpc) {
      throw new Error('Custom RPC URL is required when using custom network');
    }
    rpcUrl = customRpc;
    // Default to testnet chain ID if custom RPC
    chainId = 1328;
  } else {
    const networkConfig = SeiBlockchains.find((n) => n.value === chain);
    if (!networkConfig) {
      throw new Error(`Unknown network: ${chain}`);
    }
    rpcUrl = networkConfig.rpcUrl;
    chainId = networkConfig.chainId as number;
  }

  // Create account from private key
  const account = privateKeyToAccount(credentials.privateKey as Address);

  // Create custom chain configuration
  const seiChain = createCustomSeiChain(rpcUrl, chainId);

  // For n8n, we don't need a model provider, so pass empty object
  // However, SeiAgentKit constructor requires provider, so we'll create a wrapper
  // that initializes the clients directly

  // Create a minimal SeiAgentKit-like instance
  // Since we can't modify SeiAgentKit constructor, we'll need to use it as-is
  // but SeiAgentKit hardcodes the sei chain. We'll need to handle custom RPC differently
  
  // Actually, looking at SeiAgentKit, it hardcodes sei chain. We need to:
  // 1. Use SeiAgentKit for standard chains
  // 2. For custom RPC, we might need to extend or work around it
  
  // For now, create SeiAgentKit instance - it will use default sei chain
  // The tools might need to work with the default chain configuration
  // Custom RPC will need special handling per protocol
  const agent = new SeiAgentKit(credentials.privateKey, {});

  // Override the publicClient and walletClient if we have custom RPC
  if (customRpc || (chain && chain !== 'sei-mainnet' && chain !== 'sei-testnet')) {
    const customChain = createCustomSeiChain(rpcUrl, chainId);
    
    // Create custom clients
    const publicClient = createPublicClient({
      chain: customChain,
      transport: http(rpcUrl),
    });

    const walletClient = createWalletClient({
      account: account as PrivateKeyAccount,
      chain: customChain,
      transport: http(rpcUrl),
    });

    // Override the clients (this is a workaround since SeiAgentKit doesn't support custom RPC)
    (agent as any).publicClient = publicClient;
    (agent as any).walletClient = walletClient;
  }

  return agent;
}

