import { Badge, Button, Group } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { ConnectKitButton } from 'connectkit';
import React from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';

interface ConnectButtonProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
}

export function ConnectButton({ size = 'sm', variant = 'filled' }: ConnectButtonProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  const handleDisconnect = React.useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, address: ckAddress }) => {
        const displayAddress = address || ckAddress;

        // Show loading state
        if (isConnecting) {
          return (
            <Button size={size} variant={variant} loading leftSection={<IconWallet size={16} />}>
              Connecting...
            </Button>
          );
        }

        // Show connected state
        if (isConnected && displayAddress) {
          return (
            <Group gap="xs">
              <Badge size="lg" color="green" variant="light">
                <Group gap={4}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                  {balance && (
                    <span style={{ marginLeft: 4 }}>
                      {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </span>
                  )}
                </Group>
              </Badge>
              <Button size={size} variant="subtle" color="red" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </Group>
          );
        }

        // Show connect button
        return (
          <Button
            size={size}
            variant={variant}
            leftSection={<IconWallet size={16} />}
            onClick={show}
          >
            Connect Wallet
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}

