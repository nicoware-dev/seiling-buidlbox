import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Code,
  CopyButton,
  FileButton,
  Group,
  JsonInput,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCode, IconCopy, IconEdit, IconEye, IconUpload, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ContractForm } from '../components/ContractForm';
import { networkConfigs } from '../config/wagmi';
import { seiScanService } from '../services/seiScan';
import { formatErrorForNotification } from '../utils/errorHandling';

export function ContractInteraction() {
  const [contractAddress, setContractAddress] = useState('');
  const [abiJson, setAbiJson] = useState('[]');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionArgs, setFunctionArgs] = useState<Record<string, any>>({});
  const [readResult, setReadResult] = useState<any>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [loadingABI, setLoadingABI] = useState(false);

  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const network = useMemo(
    () => (chainId === 1328 ? 'testnet' : 'mainnet'),
    [chainId]
  );

  const abi = useMemo(() => {
    try {
      return JSON.parse(abiJson);
    } catch {
      return [];
    }
  }, [abiJson]);

  const readFunctions = useMemo(
    () =>
      abi.filter(
        (func: any) =>
          func.type === 'function' &&
          (func.stateMutability === 'view' || func.stateMutability === 'pure')
      ),
    [abi]
  );

  const writeFunctions = useMemo(
    () =>
      abi.filter(
        (func: any) =>
          func.type === 'function' &&
          func.stateMutability !== 'view' &&
          func.stateMutability !== 'pure'
      ),
    [abi]
  );

  const selectedFunc = useMemo(
    () => abi.find((func: any) => func.name === selectedFunction),
    [abi, selectedFunction]
  );

  // Wagmi hooks for contract interaction
  const { data: readData, isLoading: isReading, error: readError } = useReadContract({
    address: contractAddress as `0x${string}` | undefined,
    abi,
    functionName: selectedFunction as any,
    args: selectedFunc?.inputs?.map((input: any) => functionArgs[input.name]) as any[],
    query: {
      enabled: false, // Manual trigger
    },
  });

  const {
    writeContract,
    data: writeHash,
    isPending: isWriting,
    isSuccess: isWriteSuccess,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction receipt to get confirmation
  const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  // Auto-track successful transactions
  useEffect(() => {
    if (writeHash && contractAddress && selectedFunction && typeof window !== 'undefined') {
      const addTx = (window as any).__seilingBuilderAddTransaction;
      if (addTx) {
        addTx({
          hash: writeHash,
          status: isReceiptSuccess ? 'success' : 'pending',
          timestamp: Date.now(),
          contractAddress: contractAddress,
          functionName: selectedFunction,
        });
      }
    }
  }, [writeHash, contractAddress, selectedFunction, isReceiptSuccess]);

  // Handle ABI import from file
  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setAbiJson(JSON.stringify(parsed, null, 2));
      notifications.show({
        title: 'ABI Imported',
        message: 'Contract ABI has been imported successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Import Failed',
        message: 'Failed to parse ABI file. Please ensure it is valid JSON.',
        color: 'red',
      });
    }
  };

  // Handle ABI import from SeiScan
  const handleImportFromSeiScan = async () => {
    if (!contractAddress) {
      notifications.show({
        title: 'Address Required',
        message: 'Please enter a contract address first',
        color: 'yellow',
      });
      return;
    }

    setLoadingABI(true);
    try {
      const abi = await seiScanService.getContractABI(contractAddress, network);
      if (abi) {
        setAbiJson(JSON.stringify(abi, null, 2));
        notifications.show({
          title: 'ABI Imported',
          message: 'Contract ABI fetched from SeiScan',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'ABI Not Found',
          message: 'Contract not verified on SeiScan or ABI not available',
          color: 'yellow',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Failed to fetch ABI from SeiScan',
        color: 'red',
      });
    } finally {
      setLoadingABI(false);
    }
  };

  // Estimate gas for write functions
  const estimateGas = async () => {
    if (!selectedFunc || !contractAddress || !accountAddress) return;

    try {
      const args = selectedFunc.inputs?.map((input: any) => functionArgs[input.name]) || [];
      // This is a simplified gas estimation - in production, use useEstimateGas hook properly
      setGasEstimate('Estimating...');
      // Note: Enhanced gas estimation can use wagmi's useEstimateGas hook for more accurate values
      setGasEstimate('~21000 (default)');
    } catch (error) {
      setGasEstimate(null);
    }
  };

  // Handle read function call
  const handleRead = async () => {
    setCallError(null);
    setReadResult(null);

    if (!selectedFunc || !contractAddress) {
      setCallError('Please select a function and enter contract address');
      return;
    }

    try {
      const args = selectedFunc.inputs?.map((input: any) => {
        const value = functionArgs[input.name];
        // Convert types appropriately
        if (input.type.includes('uint') && value) {
          return BigInt(value);
        }
        if (input.type === 'bool') {
          return Boolean(value);
        }
        return value;
      });

      // Use wagmi's readContract - this is a simplified version
      // In practice, you'd use the useReadContract hook with manual trigger
      const { createPublicClient, http } = await import('viem');
      const client = createPublicClient({
        chain: networkConfigs[network].wagmiChain,
        transport: http(),
      });

      const result = await client.readContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: selectedFunction as any,
        args: args as any[],
      });

      setReadResult(result);
      notifications.show({
        title: 'Read Success',
        message: 'Function call completed successfully',
        color: 'green',
      });
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      setCallError(errorMsg);
      const friendlyError = formatErrorForNotification(error);
      notifications.show({
        title: friendlyError.title,
        message: friendlyError.message,
        color: 'red',
      });
    }
  };

  // Handle write function call
  const handleWrite = async () => {
    setCallError(null);

    if (!selectedFunc || !contractAddress || !accountAddress) {
      setCallError('Please connect wallet, select function, and enter contract address');
      return;
    }

    try {
      const args = selectedFunc.inputs?.map((input: any) => {
        const value = functionArgs[input.name];
        if (input.type.includes('uint') && value) {
          return BigInt(value);
        }
        if (input.type === 'bool') {
          return Boolean(value);
        }
        return value;
      });

      writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: selectedFunction as any,
        args: args as any[],
      });
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      setCallError(errorMsg);
      const friendlyError = formatErrorForNotification(error);
      notifications.show({
        title: friendlyError.title,
        message: friendlyError.message,
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setSelectedFunction('');
    setFunctionArgs({});
    setReadResult(null);
    setCallError(null);
    setGasEstimate(null);
  };

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Text fw={500} size="lg">
          Contract Interaction
        </Text>

        {/* Contract Address Input */}
        <TextInput
          label="Contract Address"
          placeholder="0x..."
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          rightSection={
            contractAddress && (
              <Group gap="xs">
                <Tooltip label="Import ABI from SeiScan">
                  <Button
                    size="xs"
                    variant="light"
                    loading={loadingABI}
                    onClick={handleImportFromSeiScan}
                  >
                    Import ABI
                  </Button>
                </Tooltip>
                <Tooltip label="View on SeiScan">
                  <ActionIcon
                    variant="light"
                    onClick={() => {
                      const url = seiScanService.getContractUrl(contractAddress, network);
                      window.open(url, '_blank');
                    }}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )
          }
        />

        {/* ABI Input */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Contract ABI (JSON)
            </Text>
            <Group gap="xs">
              <FileButton onChange={handleFileUpload} accept="application/json">
                {(props) => (
                  <Button
                    {...props}
                    size="xs"
                    variant="light"
                    leftSection={<IconUpload size={14} />}
                  >
                    Upload File
                  </Button>
                )}
              </FileButton>
            </Group>
          </Group>
          <JsonInput
            value={abiJson}
            onChange={setAbiJson}
            minRows={4}
            maxRows={8}
            validationError="Invalid JSON"
            placeholder="Paste contract ABI here..."
          />
        </div>

        {/* Function Selection Tabs */}
        <Tabs defaultValue="read">
          <Tabs.List>
            <Tabs.Tab value="read" leftSection={<IconEye size={16} />}>
              Read ({readFunctions.length})
            </Tabs.Tab>
            <Tabs.Tab value="write" leftSection={<IconEdit size={16} />}>
              Write ({writeFunctions.length})
            </Tabs.Tab>
            <Tabs.Tab value="abi" leftSection={<IconCode size={16} />}>
              ABI
            </Tabs.Tab>
          </Tabs.List>

          {/* Read Tab */}
          <Tabs.Panel value="read" pt="md">
            <Stack gap="md">
              <Select
                label="Function"
                placeholder="Select a read function"
                data={readFunctions.map((func: any) => ({
                  value: func.name,
                  label: `${func.name}(${
                    func.inputs?.map((i: any) => `${i.type} ${i.name || ''}`).join(', ') || ''
                  })`,
                }))}
                value={selectedFunction}
                onChange={(value) => {
                  setSelectedFunction(value || '');
                  setFunctionArgs({});
                  setReadResult(null);
                  setCallError(null);
                }}
              />

              {selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (
                <ContractForm
                  inputs={selectedFunc.inputs}
                  values={functionArgs}
                  onChange={setFunctionArgs}
                />
              )}

              <Group>
                <Button
                  leftSection={<IconEye size={16} />}
                  onClick={handleRead}
                  disabled={!selectedFunction || !contractAddress}
                  loading={isReading}
                >
                  Read
                </Button>
                <Button variant="light" onClick={resetForm}>
                  Clear
                </Button>
              </Group>

              {callError && (
                <Alert color="red" title="Error">
                  {callError}
                </Alert>
              )}

              {readResult !== null && (
                <Alert color="green" title="Result">
                  <Code block>{JSON.stringify(readResult, null, 2)}</Code>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Write Tab */}
          <Tabs.Panel value="write" pt="md">
            <Stack gap="md">
              {!accountAddress && (
                <Alert color="yellow" title="Wallet Not Connected">
                  Please connect your wallet to write to contracts
                </Alert>
              )}

              <Select
                label="Function"
                placeholder="Select a write function"
                data={writeFunctions.map((func: any) => ({
                  value: func.name,
                  label: `${func.name}(${
                    func.inputs?.map((i: any) => `${i.type} ${i.name || ''}`).join(', ') || ''
                  })`,
                }))}
                value={selectedFunction}
                onChange={(value) => {
                  setSelectedFunction(value || '');
                  setFunctionArgs({});
                  setGasEstimate(null);
                  setCallError(null);
                }}
              />

              {selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (
                <ContractForm
                  inputs={selectedFunc.inputs}
                  values={functionArgs}
                  onChange={setFunctionArgs}
                />
              )}

              {gasEstimate && (
                <Text size="sm" c="dimmed">
                  Estimated Gas: {gasEstimate}
                </Text>
              )}

              <Group>
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={handleWrite}
                  disabled={!selectedFunction || !contractAddress || !accountAddress || isWaitingForReceipt}
                  loading={isWriting || isWaitingForReceipt}
                  color="orange"
                >
                  {isWaitingForReceipt ? 'Waiting for Confirmation...' : 'Execute'}
                </Button>
                <Button variant="light" onClick={() => estimateGas()}>
                  Estimate Gas
                </Button>
                <Button variant="light" onClick={resetForm}>
                  Clear
                </Button>
              </Group>

              {writeError && (
                <Alert color="red" title={formatErrorForNotification(writeError).title}>
                  {formatErrorForNotification(writeError).message}
                </Alert>
              )}

              {isWriteSuccess && writeHash && (
                <Alert color="green" title={isReceiptSuccess ? "Transaction Confirmed" : "Transaction Submitted"}>
                  <Stack gap="xs">
                    <Text size="sm">
                      {isWaitingForReceipt 
                        ? "Waiting for confirmation..." 
                        : isReceiptSuccess 
                        ? "Transaction confirmed on blockchain"
                        : "Transaction submitted successfully"}
                    </Text>
                    <Text size="xs" ff="monospace" c="dimmed">
                      {writeHash}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        const url = seiScanService.getTransactionUrl(writeHash, network);
                        window.open(url, '_blank');
                      }}
                    >
                      View on SeiScan
                    </Button>
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>

          {/* ABI Tab */}
          <Tabs.Panel value="abi" pt="md">
            <JsonInput value={abiJson} onChange={setAbiJson} minRows={12} readOnly />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Card>
  );
}
