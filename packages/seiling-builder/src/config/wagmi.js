import { defineChain, http } from 'viem';
import { createConfig } from 'wagmi';
// Sei EVM Testnet (Atlantic-2)
export const seiEvmTestnet = defineChain({
    id: 1328,
    name: 'Sei EVM Testnet',
    nativeCurrency: {
        name: 'SEI',
        symbol: 'SEI',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://evm-rpc-testnet.sei-apis.com'],
        },
        public: {
            http: ['https://evm-rpc-testnet.sei-apis.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'SeiScan Testnet',
            url: 'https://testnet.seiscan.app',
        },
    },
    testnet: true,
});
// Sei EVM Mainnet (Pacific-1)
export const seiEvmMainnet = defineChain({
    id: 1329,
    name: 'Sei EVM Mainnet',
    nativeCurrency: {
        name: 'SEI',
        symbol: 'SEI',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://evm-rpc.sei-apis.com'],
        },
        public: {
            http: ['https://evm-rpc.sei-apis.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'SeiScan',
            url: 'https://seiscan.app',
        },
    },
    testnet: false,
});
export const config = createConfig({
    chains: [seiEvmTestnet, seiEvmMainnet],
    transports: {
        [seiEvmTestnet.id]: http(seiEvmTestnet.rpcUrls.default.http[0]),
        [seiEvmMainnet.id]: http(seiEvmMainnet.rpcUrls.default.http[0]),
    },
});
// Network configurations for Seiling Buidlbox v2
export const networkConfigs = {
    testnet: {
        id: 'testnet',
        name: 'Sei EVM Testnet',
        description: 'Sei test network (Atlantic-2)',
        chainId: 1328,
        rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
        blockExplorer: 'https://testnet.seiscan.app',
        wagmiChain: seiEvmTestnet,
        color: 'yellow',
    },
    mainnet: {
        id: 'mainnet',
        name: 'Sei EVM Mainnet',
        description: 'Sei production network (Pacific-1)',
        chainId: 1329,
        rpcUrl: 'https://evm-rpc.sei-apis.com',
        blockExplorer: 'https://seiscan.app',
        wagmiChain: seiEvmMainnet,
        color: 'blue',
    },
};
