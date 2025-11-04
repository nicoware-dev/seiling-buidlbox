import { Badge, Button, Group, Loader, Menu, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconChevronDown, IconNetwork } from '@tabler/icons-react';
import { useChainId, useSwitchChain } from 'wagmi';
import { networkConfigs, type NetworkType } from '../config/wagmi';

export function NetworkDropdown() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const networks: Array<{
    id: NetworkType;
    name: string;
    description: string;
    chainId: 1328 | 1329;
    color: string;
  }> = [
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

  const handleNetworkChange = async (targetChainId: 1328 | 1329) => {
    if (targetChainId === chainId) {
      return;
    }

    try {
      switchChain({ chainId: targetChainId as 1328 | 1329 });
      notifications.show({
        title: 'Network Switched',
        message: `Successfully switched to ${networks.find((n) => n.chainId === targetChainId)?.name} network`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Network Switch Failed',
        message: error instanceof Error ? error.message : 'Failed to switch network',
        color: 'red',
      });
    }
  };

  return (
    <Menu shadow="md" width={260} position="bottom-end">
      <Menu.Target>
        <Button
          variant="light"
          leftSection={isPending ? <Loader size={12} /> : <IconNetwork size={14} />}
          rightSection={<IconChevronDown size={12} />}
          disabled={isPending}
          size="xs"
        >
          <Group gap={6}>
            <Badge size="xs" color={currentNetwork?.color} variant="dot" />
            {currentNetwork?.name || 'Unknown'}
          </Group>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Header */}
        <Menu.Label>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Current Network
            </Text>
            <Group gap={6}>
              <Badge size="xs" color={currentNetwork?.color} variant="dot" />
              <Text size="sm">{currentNetwork?.name || 'Unknown'}</Text>
            </Group>
          </Group>
        </Menu.Label>

        <Menu.Divider />

        {/* Network options */}
        {networks.map((network) => (
          <Menu.Item
            key={network.id}
            leftSection={<Badge size="xs" color={network.color} variant="dot" />}
            rightSection={
              chainId === network.chainId ? (
                <IconCheck size={16} color="var(--mantine-color-blue-6)" />
              ) : null
            }
            disabled={isPending}
            onClick={() => handleNetworkChange(network.chainId)}
            bg={chainId === network.chainId ? 'var(--mantine-color-blue-0)' : undefined}
          >
            <div>
              <Text size="sm" fw={chainId === network.chainId ? 500 : 400}>
                {network.name}
              </Text>
              <Text size="xs" c="dimmed">
                {network.description}
              </Text>
            </div>
          </Menu.Item>
        ))}

        <Menu.Divider />

        {/* Footer info */}
        <Menu.Label>
          <Text size="xs" c="dimmed">
            💡 Switch networks via your wallet
          </Text>
        </Menu.Label>
      </Menu.Dropdown>
    </Menu>
  );
}

