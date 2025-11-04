import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge, Button, Group, Loader, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconChevronDown, IconNetwork } from '@tabler/icons-react';
import { useChainId, useSwitchChain } from 'wagmi';
import { networkConfigs } from '../config/wagmi';
export function NetworkDropdown() {
    const chainId = useChainId();
    const { switchChain, isPending } = useSwitchChain();
    const networks = [
        {
            id: 'testnet',
            name: 'Testnet',
            description: 'Sei EVM test network (Atlantic-2)',
            chainId: networkConfigs.testnet.chainId,
            color: 'yellow',
        },
        {
            id: 'mainnet',
            name: 'Mainnet',
            description: 'Sei EVM mainnet (Pacific-1)',
            chainId: networkConfigs.mainnet.chainId,
            color: 'blue',
        },
    ];
    const currentNetwork = networks.find((n) => n.chainId === chainId);
    const handleNetworkChange = async (targetChainId) => {
        if (targetChainId === chainId) {
            return;
        }
        try {
            switchChain({ chainId: targetChainId });
            notifications.show({
                title: 'Network Switched',
                message: `Successfully switched to ${networks.find((n) => n.chainId === targetChainId)?.name} network`,
                color: 'green',
            });
        }
        catch (error) {
            notifications.show({
                title: 'Network Switch Failed',
                message: error instanceof Error ? error.message : 'Failed to switch network',
                color: 'red',
            });
        }
    };
    return (_jsxs(Menu, { shadow: "md", width: 260, position: "bottom-end", children: [_jsx(Menu.Target, { children: _jsx(Button, { variant: "light", leftSection: isPending ? _jsx(Loader, { size: 12 }) : _jsx(IconNetwork, { size: 14 }), rightSection: _jsx(IconChevronDown, { size: 12 }), disabled: isPending, size: "xs", children: _jsxs(Group, { gap: 6, children: [_jsx(Badge, { size: "xs", color: currentNetwork?.color, variant: "dot" }), currentNetwork?.name || 'Unknown'] }) }) }), _jsxs(Menu.Dropdown, { children: [_jsx(Menu.Label, { children: _jsxs(Group, { justify: "space-between", children: [_jsx(Text, { size: "sm", fw: 500, children: "Current Network" }), _jsxs(Group, { gap: 6, children: [_jsx(Badge, { size: "xs", color: currentNetwork?.color, variant: "dot" }), _jsx(Text, { size: "sm", children: currentNetwork?.name || 'Unknown' })] })] }) }), _jsx(Menu.Divider, {}), networks.map((network) => (_jsx(Menu.Item, { leftSection: _jsx(Badge, { size: "xs", color: network.color, variant: "dot" }), rightSection: chainId === network.chainId ? (_jsx(IconCheck, { size: 16, color: "var(--mantine-color-blue-6)" })) : null, disabled: isPending, onClick: () => handleNetworkChange(network.chainId), bg: chainId === network.chainId ? 'var(--mantine-color-blue-0)' : undefined, children: _jsxs("div", { children: [_jsx(Text, { size: "sm", fw: chainId === network.chainId ? 500 : 400, children: network.name }), _jsx(Text, { size: "xs", c: "dimmed", children: network.description })] }) }, network.id))), _jsx(Menu.Divider, {}), _jsx(Menu.Label, { children: _jsx(Text, { size: "xs", c: "dimmed", children: "\uD83D\uDCA1 Switch networks via your wallet" }) })] })] }));
}
