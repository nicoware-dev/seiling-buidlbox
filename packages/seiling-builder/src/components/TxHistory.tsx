import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconExternalLink, IconSearch, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { networkConfigs } from '../config/wagmi';
import { seiScanService } from '../services/seiScan';

export interface TransactionRecord {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  gasUsed?: string;
  timestamp: number;
  contractAddress?: string;
  functionName?: string;
}

const STORAGE_KEY = 'seiling-builder-tx-history';

export function TxHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filter, setFilter] = useState('');
  const chainId = useChainId();
  const network = chainId === 1328 ? 'testnet' : 'mainnet';

  // Load transactions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transaction history:', error);
    }
  }, [transactions]);

  const addTransaction = (tx: TransactionRecord) => {
    setTransactions((prev) => [tx, ...prev].slice(0, 50)); // Keep last 50
  };

  const removeTransaction = (hash: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.hash !== hash));
  };

  const clearHistory = () => {
    setTransactions([]);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(searchLower) ||
      tx.contractAddress?.toLowerCase().includes(searchLower) ||
      tx.functionName?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const exportHistory = () => {
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seiling-builder-tx-history-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Expose addTransaction for external use
  useEffect(() => {
    (window as any).__seilingBuilderAddTransaction = addTransaction;
    return () => {
      delete (window as any).__seilingBuilderAddTransaction;
    };
  }, []);

  if (transactions.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500} size="lg">
              Transaction History
            </Text>
          </Group>
          <Text size="sm" c="dimmed" ta="center" py="md">
            No transactions yet. Transaction history will appear here after you interact with contracts.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500} size="lg">
            Transaction History ({transactions.length})
          </Text>
          <Group gap="xs">
            <Button size="xs" variant="light" onClick={exportHistory}>
              Export
            </Button>
            <Button size="xs" variant="light" color="red" onClick={clearHistory}>
              Clear
            </Button>
          </Group>
        </Group>

        <TextInput
          placeholder="Filter by hash, address, or function..."
          leftSection={<IconSearch size={16} />}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Table.ScrollContainer minWidth={800}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Hash</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Contract</Table.Th>
                <Table.Th>Function</Table.Th>
                <Table.Th>Gas Used</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTransactions.map((tx) => (
                <Table.Tr key={tx.hash}>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(tx.status)} size="sm" variant="light">
                      {tx.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {tx.contractAddress ? (
                      <Text size="xs" ff="monospace">
                        {tx.contractAddress.slice(0, 8)}...{tx.contractAddress.slice(-6)}
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">
                        -
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{tx.functionName || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{tx.gasUsed || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      {new Date(tx.timestamp).toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="View on SeiScan">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => {
                            const url = seiScanService.getTransactionUrl(tx.hash, network);
                            window.open(url, '_blank');
                          }}
                        >
                          <IconExternalLink size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remove">
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => removeTransaction(tx.hash)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {filteredTransactions.length === 0 && filter && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No transactions match your filter
          </Text>
        )}
      </Stack>
    </Card>
  );
}

