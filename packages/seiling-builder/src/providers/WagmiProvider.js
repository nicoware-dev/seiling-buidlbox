import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi';
// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: 1000,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});
export function WagmiProviderWrapper({ children }) {
    return (_jsx(WagmiProvider, { config: config, reconnectOnMount: true, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(ConnectKitProvider, { theme: "auto", mode: "light", options: {
                    initialChainId: config.chains[0].id,
                    disclaimer: 'By connecting your wallet, you agree to use Seiling Builder for interacting with Sei EVM contracts.',
                    hideBalance: false,
                    hideTooltips: false,
                    hideQuestionMarkCTA: false,
                    hideNoWalletCTA: false,
                }, children: children }) }) }));
}
