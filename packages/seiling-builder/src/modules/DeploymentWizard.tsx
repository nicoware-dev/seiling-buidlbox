import {
  Alert,
  Button,
  Card,
  FileButton,
  Group,
  JsonInput,
  Modal,
  Select,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  CopyButton,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconRocket, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ContractForm } from '../components/ContractForm';
import { networkConfigs } from '../config/wagmi';
// Lazy import compileContract to avoid loading solc until needed
import { seiScanService } from '../services/seiScan';
import { formatErrorForNotification } from '../utils/errorHandling';
import { contractTemplates } from '../data/contractTemplates';

interface DeploymentWizardProps {
  opened: boolean;
  onClose: () => void;
  onDeploymentSuccess?: (address: string, abi: any[]) => void;
}

type DeploymentMode = 'source' | 'bytecode';

export function DeploymentWizard({ opened, onClose, onDeploymentSuccess }: DeploymentWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [mode, setMode] = useState<DeploymentMode>('source');
  const [sourceCode, setSourceCode] = useState('');
  const [contractName, setContractName] = useState('');
  const [bytecode, setBytecode] = useState('');
  const [abi, setAbi] = useState<any[]>([]);
  const [constructorArgs, setConstructorArgs] = useState<Record<string, any>>({});
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [deploymentAddress, setDeploymentAddress] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<Error | null>(null);

  const nextStep = () => setActiveStep((current) => Math.min(current + 1, 4));
  const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));

  const handleSourceFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      setSourceCode(text);
      notifications.show({
        title: 'File Uploaded',
        message: 'Solidity source code loaded',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Upload Failed',
        message: 'Failed to read file',
        color: 'red',
      });
    }
  };

  const handleCompile = async () => {
    if (!sourceCode.trim()) {
      notifications.show({
        title: 'Source Required',
        message: 'Please enter Solidity source code',
        color: 'yellow',
      });
      return;
    }

    try {
      // Try to compile - may fail if solc is not available in browser
      let result;
      try {
        const { compileContract } = await import('../services/contractCompiler');
        result = await compileContract(sourceCode, contractName || undefined);
      } catch (compileError: any) {
        // If compilation fails (e.g., solc not available), show helpful error
        notifications.show({
          title: 'Compilation Not Available',
          message: compileError?.message || 'Solidity compilation is not available in browser. Please use bytecode + ABI mode instead.',
          color: 'yellow',
        });
        setCompilationResult({
          success: false,
          abi: [],
          bytecode: '',
          errors: [compileError?.message || 'Compilation not available'],
        });
        return;
      }
      setCompilationResult(result);

      if (result.success) {
        setAbi(result.abi);
        setBytecode(result.bytecode);
        // Extract constructor inputs
        const constructor = result.abi.find((item: any) => item.type === 'constructor');
        if (constructor?.inputs && constructor.inputs.length > 0) {
          const defaultArgs: Record<string, any> = {};
          constructor.inputs.forEach((input: any) => {
            defaultArgs[input.name] = '';
          });

          // Prefill defaults from selected template, if any
          if (selectedTemplate) {
            const tpl = contractTemplates.find((t) => t.id === selectedTemplate);
            if (tpl?.defaultArgs) {
              constructor.inputs.forEach((input: any) => {
                if (tpl.defaultArgs && input.name in tpl.defaultArgs) {
                  defaultArgs[input.name] = tpl.defaultArgs[input.name];
                }
              });
            }
          }
          setConstructorArgs(defaultArgs);
        }
        notifications.show({
          title: 'Compilation Successful',
          message: `Contract compiled: ${result.contractName}`,
          color: 'green',
        });
        nextStep();
      } else {
        notifications.show({
          title: 'Compilation Failed',
          message: result.errors?.join(', ') || 'Compilation error',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Compilation Error',
        message: error instanceof Error ? error.message : String(error),
        color: 'red',
      });
    }
  };

  const handleDeploy = async () => {
    if (!accountAddress) {
      notifications.show({
        title: 'Wallet Required',
        message: 'Please connect your wallet',
        color: 'yellow',
      });
      return;
    }

    if (!bytecode || !abi.length) {
      notifications.show({
        title: 'Invalid Contract',
        message: 'Missing bytecode or ABI',
        color: 'red',
      });
      return;
    }

    try {
      const constructor = abi.find((item: any) => item.type === 'constructor');
      const args = constructor?.inputs
        ? constructor.inputs.map((input: any) => {
            const value = constructorArgs[input.name];
            if (input.type.includes('uint')) {
              return BigInt(value || 0);
            }
            if (input.type === 'bool') {
              return Boolean(value);
            }
            return value;
          })
        : [];

      setIsDeploying(true);
      setDeployError(null);

      try {
        // Use viem's deployContract via wallet client
        const { createWalletClient, custom, http } = await import('viem');
        const { seiEvmTestnet, seiEvmMainnet } = await import('../config/wagmi');
        
        if (!('ethereum' in window)) {
          throw new Error('Wallet not available');
        }

        const chain = chainId === 1328 ? seiEvmTestnet : seiEvmMainnet;
        const walletClient = createWalletClient({
          chain,
          transport: custom((window as any).ethereum),
        });

        const [account] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });

        const hash = await walletClient.deployContract({
          account: account as `0x${string}`,
          abi,
          bytecode: `0x${bytecode}` as `0x${string}`,
          args: args as any[],
        });

        // Wait for transaction receipt to get contract address
        const { createPublicClient } = await import('viem');
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        notifications.show({
          title: 'Deployment Submitted',
          message: `Waiting for confirmation... Transaction: ${hash}`,
          color: 'blue',
        });

        // Wait for receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const contractAddress = receipt.contractAddress;

        if (!contractAddress) {
          throw new Error('Contract address not found in receipt');
        }

        // Track deployment transaction
        if (typeof window !== 'undefined' && (window as any).__seilingBuilderAddTransaction) {
          (window as any).__seilingBuilderAddTransaction({
            hash: hash,
            status: 'success',
            timestamp: Date.now(),
            contractAddress: contractAddress,
            functionName: 'deploy',
          });
        }

        notifications.show({
          title: 'Deployment Successful',
          message: `Contract deployed at: ${contractAddress}`,
          color: 'green',
        });
        setDeploymentAddress(contractAddress || hash);
        if (onDeploymentSuccess && contractAddress) {
          onDeploymentSuccess(contractAddress, abi);
        }
        nextStep(); // Move to success step
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setDeployError(err);
        const friendlyError = formatErrorForNotification(error);
        notifications.show({
          title: friendlyError.title,
          message: friendlyError.message,
          color: 'red',
        });
      } finally {
        setIsDeploying(false);
      }
    } catch (error) {
      const friendlyError = formatErrorForNotification(error);
      notifications.show({
        title: friendlyError.title,
        message: friendlyError.message,
        color: 'red',
      });
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setMode('source');
    setSourceCode('');
    setContractName('');
    setBytecode('');
    setAbi([]);
    setConstructorArgs({});
    setCompilationResult(null);
    setDeploymentAddress('');
    onClose();
  };

  const canProceedStep1 = mode === 'source' ? sourceCode.trim().length > 0 : bytecode.trim().length > 0 && abi.length > 0;
  const canProceedStep2 = compilationResult?.success || (mode === 'bytecode' && bytecode && abi.length > 0);
  const canProceedStep3 = true; // Constructor step always allowed

  return (
    <Modal opened={opened} onClose={handleClose} title="Deploy Smart Contract" size="lg" centered>
      <Stepper active={activeStep}>
        <Stepper.Step label="Source" description="Upload or paste contract">
          <Stack gap="md">
            <Select
              label="Template (optional)"
              placeholder="Select a template to prefill source"
              data={contractTemplates.map((t) => ({ value: t.id, label: t.name }))}
              value={selectedTemplate}
              onChange={(value) => {
                setSelectedTemplate(value);
                const template = contractTemplates.find((t) => t.id === value);
                if (template) {
                  setMode('source');
                  setSourceCode(template.sourceCode);
                  setContractName(template.contractName);
                  setCompilationResult(null);
                  setAbi([]);
                  setBytecode('');
                }
              }}
              searchable
              clearable
            />
            <Select
              label="Deployment Mode"
              data={[
                { value: 'source', label: 'Solidity Source Code' },
                { value: 'bytecode', label: 'Bytecode + ABI' },
              ]}
              value={mode}
              onChange={(value) => setMode((value as DeploymentMode) || 'source')}
            />

            {mode === 'source' ? (
              <>
                <TextInput
                  label="Contract Name (optional)"
                  placeholder="MyContract"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                />
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                      Solidity Source Code
                    </Text>
                    <FileButton onChange={handleSourceFileUpload} accept=".sol,text/plain">
                      {(props) => (
                        <Button {...props} size="xs" variant="light" leftSection={<IconUpload size={14} />}>
                          Upload File
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                  <Textarea
                    value={sourceCode}
                    onChange={(e) => setSourceCode(e.target.value)}
                    minRows={8}
                    placeholder="pragma solidity ^0.8.0;&#10;&#10;contract MyContract {&#10;  // ...&#10;}"
                  />
                </div>
              </>
            ) : (
              <>
                <Textarea
                  label="Bytecode"
                  placeholder="0x..."
                  value={bytecode}
                  onChange={(e) => setBytecode(e.target.value)}
                  minRows={4}
                />
                <JsonInput
                  label="Contract ABI"
                  value={JSON.stringify(abi, null, 2)}
                  onChange={(value) => {
                    try {
                      setAbi(JSON.parse(value));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  minRows={6}
                  validationError="Invalid JSON"
                />
              </>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Compile" description="Compile contract">
          {mode === 'source' ? (
            <Stack gap="md">
              <Button onClick={handleCompile} loading={false} leftSection={<IconRocket size={16} />} fullWidth>
                Compile Contract
              </Button>

              {compilationResult && (
                <Alert color={compilationResult.success ? 'green' : 'red'} title={compilationResult.success ? 'Success' : 'Error'}>
                  {compilationResult.success ? (
                    <Stack gap="xs">
                      <Text size="sm">Contract: {compilationResult.contractName}</Text>
                      <Text size="sm">ABI: {compilationResult.abi.length} items</Text>
                      <Text size="sm">Bytecode: {compilationResult.bytecode.slice(0, 20)}...</Text>
                    </Stack>
                  ) : (
                    <Text size="sm">{compilationResult.errors?.join('\n') || 'Compilation failed'}</Text>
                  )}
                </Alert>
              )}
            </Stack>
          ) : (
            <Stack gap="md">
              <Alert color="blue">
                Using provided bytecode and ABI. Skipping compilation.
              </Alert>
            </Stack>
          )}
        </Stepper.Step>

        <Stepper.Step label="Configure" description="Constructor parameters">
          <Stack gap="md">
            {!accountAddress && (
              <Alert color="yellow" title="Wallet Not Connected">
                Please connect your wallet to deploy
              </Alert>
            )}

            {abi.find((item: any) => item.type === 'constructor')?.inputs?.length > 0 ? (
              <ContractForm
                inputs={abi.find((item: any) => item.type === 'constructor').inputs}
                values={constructorArgs}
                onChange={setConstructorArgs}
              />
            ) : (
              <Text size="sm" c="dimmed">
                This contract has no constructor parameters
              </Text>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Deploy" description="Deploy contract">
          <Stack gap="md">
            <Alert icon={<IconRocket size={16} />} color="blue">
              Ready to deploy contract to {networkConfigs[chainId === 1328 ? 'testnet' : 'mainnet'].name}
            </Alert>

            <Card withBorder padding="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">Contract:</Text>
                  <Text size="sm" fw={500}>
                    {compilationResult?.contractName || 'Custom Contract'}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Network:</Text>
                  <Text size="sm" fw={500}>
                    {networkConfigs[chainId === 1328 ? 'testnet' : 'mainnet'].name}
                  </Text>
                </Group>
              </Stack>
            </Card>

            <Button
              fullWidth
              onClick={handleDeploy}
              loading={isDeploying}
              leftSection={<IconRocket size={16} />}
              disabled={!accountAddress}
            >
              Deploy Contract
            </Button>

            {deployError && (
              <Alert color="red" title={formatErrorForNotification(deployError).title}>
                {formatErrorForNotification(deployError).message}
              </Alert>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack gap="md" align="center">
            <IconCheck size={48} color="green" />
            <Text fw={500} size="lg">
              Contract Deployed Successfully!
            </Text>
            {deploymentAddress && (
              <>
                <Card withBorder padding="md" w="100%">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>Contract Address:</Text>
                      <Group gap="xs">
                        <Text size="sm" ff="monospace" c="blue">
                          {deploymentAddress.slice(0, 10)}...{deploymentAddress.slice(-8)}
                        </Text>
                        <CopyButton value={deploymentAddress}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copied!' : 'Copy address'}>
                              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy} variant="subtle">
                                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Group>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => {
                          const url = seiScanService.getContractUrl(deploymentAddress, chainId === 1328 ? 'testnet' : 'mainnet');
                          window.open(url, '_blank');
                        }}
                      >
                        View Contract on SeiScan
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </>
            )}
            <Button onClick={handleClose}>Close</Button>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      {activeStep < 4 && (
        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={prevStep} disabled={activeStep === 0}>
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={
              (activeStep === 0 && !canProceedStep1) ||
              (activeStep === 1 && !canProceedStep2) ||
              activeStep === 2
            }
          >
            {activeStep === 2 ? 'Deploy' : 'Next'}
          </Button>
        </Group>
      )}
    </Modal>
  );
}

