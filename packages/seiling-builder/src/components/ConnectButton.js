import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge, Button, Group } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { ConnectKitButton } from 'connectkit';
import React from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
export function ConnectButton({ size = 'sm', variant = 'filled' }) {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({
        address,
    });
    const handleDisconnect = React.useCallback(() => {
        disconnect();
    }, [disconnect]);
    return (_jsx(ConnectKitButton.Custom, { children: ({ isConnected, isConnecting, show, address: ckAddress }) => {
            const displayAddress = address || ckAddress;
            // Show loading state
            if (isConnecting) {
                return (_jsx(Button, { size: size, variant: variant, loading: true, leftSection: _jsx(IconWallet, { size: 16 }), children: "Connecting..." }));
            }
            // Show connected state
            if (isConnected && displayAddress) {
                return (_jsxs(Group, { gap: "xs", children: [_jsx(Badge, { size: "lg", color: "green", variant: "light", children: _jsxs(Group, { gap: 4, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' } }), displayAddress.slice(0, 6), "...", displayAddress.slice(-4), balance && (_jsxs("span", { style: { marginLeft: 4 }, children: [parseFloat(balance.formatted).toFixed(4), " ", balance.symbol] }))] }) }), _jsx(Button, { size: size, variant: "subtle", color: "red", onClick: handleDisconnect, children: "Disconnect" })] }));
            }
            // Show connect button
            return (_jsx(Button, { size: size, variant: variant, leftSection: _jsx(IconWallet, { size: 16 }), onClick: show, children: "Connect Wallet" }));
        } }));
}
