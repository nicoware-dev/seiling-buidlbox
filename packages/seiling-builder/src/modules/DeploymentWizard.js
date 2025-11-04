import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Alert, Button, Card, FileButton, Group, JsonInput, Modal, Select, Stack, Stepper, Text, Textarea, TextInput, CopyButton, Tooltip, ActionIcon, } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconRocket, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { ContractForm } from '../components/ContractForm';
import { networkConfigs } from '../config/wagmi';
// Lazy import compileContract to avoid loading solc until needed
import { seiScanService } from '../services/seiScan';
import { formatErrorForNotification } from '../utils/errorHandling';
export function DeploymentWizard({ opened, onClose, onDeploymentSuccess }) {
    const [activeStep, setActiveStep] = useState(0);
    const [mode, setMode] = useState('source');
    const [sourceCode, setSourceCode] = useState('');
    const [contractName, setContractName] = useState('');
    const [bytecode, setBytecode] = useState('');
    const [abi, setAbi] = useState([]);
    const [constructorArgs, setConstructorArgs] = useState({});
    const [compilationResult, setCompilationResult] = useState(null);
    const [deploymentAddress, setDeploymentAddress] = useState('');
    const { address: accountAddress } = useAccount();
    const chainId = useChainId();
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployError, setDeployError] = useState(null);
    const nextStep = () => setActiveStep((current) => Math.min(current + 1, 4));
    const prevStep = () => setActiveStep((current) => Math.max(current - 1, 0));
    const handleSourceFileUpload = async (file) => {
        if (!file)
            return;
        try {
            const text = await file.text();
            setSourceCode(text);
            notifications.show({
                title: 'File Uploaded',
                message: 'Solidity source code loaded',
                color: 'green',
            });
        }
        catch (error) {
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
            }
            catch (compileError) {
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
                const constructor = result.abi.find((item) => item.type === 'constructor');
                if (constructor?.inputs && constructor.inputs.length > 0) {
                    const defaultArgs = {};
                    constructor.inputs.forEach((input) => {
                        defaultArgs[input.name] = '';
                    });
                    setConstructorArgs(defaultArgs);
                }
                notifications.show({
                    title: 'Compilation Successful',
                    message: `Contract compiled: ${result.contractName}`,
                    color: 'green',
                });
                nextStep();
            }
            else {
                notifications.show({
                    title: 'Compilation Failed',
                    message: result.errors?.join(', ') || 'Compilation error',
                    color: 'red',
                });
            }
        }
        catch (error) {
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
            const constructor = abi.find((item) => item.type === 'constructor');
            const args = constructor?.inputs
                ? constructor.inputs.map((input) => {
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
                    transport: custom(window.ethereum),
                });
                const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const hash = await walletClient.deployContract({
                    account: account,
                    abi,
                    bytecode: `0x${bytecode}`,
                    args: args,
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
                if (typeof window !== 'undefined' && window.__seilingBuilderAddTransaction) {
                    window.__seilingBuilderAddTransaction({
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
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                setDeployError(err);
                const friendlyError = formatErrorForNotification(error);
                notifications.show({
                    title: friendlyError.title,
                    message: friendlyError.message,
                    color: 'red',
                });
            }
            finally {
                setIsDeploying(false);
            }
        }
        catch (error) {
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
    return (_jsxs(Modal, { opened: opened, onClose: handleClose, title: "Deploy Smart Contract", size: "lg", centered: true, children: [_jsxs(Stepper, { active: activeStep, children: [_jsx(Stepper.Step, { label: "Source", description: "Upload or paste contract", children: _jsxs(Stack, { gap: "md", children: [_jsx(Select, { label: "Deployment Mode", data: [
                                        { value: 'source', label: 'Solidity Source Code' },
                                        { value: 'bytecode', label: 'Bytecode + ABI' },
                                    ], value: mode, onChange: (value) => setMode(value || 'source') }), mode === 'source' ? (_jsxs(_Fragment, { children: [_jsx(TextInput, { label: "Contract Name (optional)", placeholder: "MyContract", value: contractName, onChange: (e) => setContractName(e.target.value) }), _jsxs("div", { children: [_jsxs(Group, { justify: "space-between", mb: "xs", children: [_jsx(Text, { size: "sm", fw: 500, children: "Solidity Source Code" }), _jsx(FileButton, { onChange: handleSourceFileUpload, accept: ".sol,text/plain", children: (props) => (_jsx(Button, { ...props, size: "xs", variant: "light", leftSection: _jsx(IconUpload, { size: 14 }), children: "Upload File" })) })] }), _jsx(Textarea, { value: sourceCode, onChange: (e) => setSourceCode(e.target.value), minRows: 8, placeholder: "pragma solidity ^0.8.0;\n\ncontract MyContract {\n  // ...\n}" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Textarea, { label: "Bytecode", placeholder: "0x...", value: bytecode, onChange: (e) => setBytecode(e.target.value), minRows: 4 }), _jsx(JsonInput, { label: "Contract ABI", value: JSON.stringify(abi, null, 2), onChange: (value) => {
                                                try {
                                                    setAbi(JSON.parse(value));
                                                }
                                                catch {
                                                    // Invalid JSON, ignore
                                                }
                                            }, minRows: 6, validationError: "Invalid JSON" })] }))] }) }), _jsx(Stepper.Step, { label: "Compile", description: "Compile contract", children: mode === 'source' ? (_jsxs(Stack, { gap: "md", children: [_jsx(Button, { onClick: handleCompile, loading: false, leftSection: _jsx(IconRocket, { size: 16 }), fullWidth: true, children: "Compile Contract" }), compilationResult && (_jsx(Alert, { color: compilationResult.success ? 'green' : 'red', title: compilationResult.success ? 'Success' : 'Error', children: compilationResult.success ? (_jsxs(Stack, { gap: "xs", children: [_jsxs(Text, { size: "sm", children: ["Contract: ", compilationResult.contractName] }), _jsxs(Text, { size: "sm", children: ["ABI: ", compilationResult.abi.length, " items"] }), _jsxs(Text, { size: "sm", children: ["Bytecode: ", compilationResult.bytecode.slice(0, 20), "..."] })] })) : (_jsx(Text, { size: "sm", children: compilationResult.errors?.join('\n') || 'Compilation failed' })) }))] })) : (_jsx(Stack, { gap: "md", children: _jsx(Alert, { color: "blue", children: "Using provided bytecode and ABI. Skipping compilation." }) })) }), _jsx(Stepper.Step, { label: "Configure", description: "Constructor parameters", children: _jsxs(Stack, { gap: "md", children: [!accountAddress && (_jsx(Alert, { color: "yellow", title: "Wallet Not Connected", children: "Please connect your wallet to deploy" })), abi.find((item) => item.type === 'constructor')?.inputs?.length > 0 ? (_jsx(ContractForm, { inputs: abi.find((item) => item.type === 'constructor').inputs, values: constructorArgs, onChange: setConstructorArgs })) : (_jsx(Text, { size: "sm", c: "dimmed", children: "This contract has no constructor parameters" }))] }) }), _jsx(Stepper.Step, { label: "Deploy", description: "Deploy contract", children: _jsxs(Stack, { gap: "md", children: [_jsxs(Alert, { icon: _jsx(IconRocket, { size: 16 }), color: "blue", children: ["Ready to deploy contract to ", networkConfigs[chainId === 1328 ? 'testnet' : 'mainnet'].name] }), _jsx(Card, { withBorder: true, padding: "md", children: _jsxs(Stack, { gap: "xs", children: [_jsxs(Group, { justify: "space-between", children: [_jsx(Text, { size: "sm", children: "Contract:" }), _jsx(Text, { size: "sm", fw: 500, children: compilationResult?.contractName || 'Custom Contract' })] }), _jsxs(Group, { justify: "space-between", children: [_jsx(Text, { size: "sm", children: "Network:" }), _jsx(Text, { size: "sm", fw: 500, children: networkConfigs[chainId === 1328 ? 'testnet' : 'mainnet'].name })] })] }) }), _jsx(Button, { fullWidth: true, onClick: handleDeploy, loading: isDeploying, leftSection: _jsx(IconRocket, { size: 16 }), disabled: !accountAddress, children: "Deploy Contract" }), deployError && (_jsx(Alert, { color: "red", title: formatErrorForNotification(deployError).title, children: formatErrorForNotification(deployError).message }))] }) }), _jsx(Stepper.Completed, { children: _jsxs(Stack, { gap: "md", align: "center", children: [_jsx(IconCheck, { size: 48, color: "green" }), _jsx(Text, { fw: 500, size: "lg", children: "Contract Deployed Successfully!" }), deploymentAddress && (_jsx(_Fragment, { children: _jsx(Card, { withBorder: true, padding: "md", w: "100%", children: _jsxs(Stack, { gap: "xs", children: [_jsxs(Group, { justify: "space-between", children: [_jsx(Text, { size: "sm", fw: 500, children: "Contract Address:" }), _jsxs(Group, { gap: "xs", children: [_jsxs(Text, { size: "sm", ff: "monospace", c: "blue", children: [deploymentAddress.slice(0, 10), "...", deploymentAddress.slice(-8)] }), _jsx(CopyButton, { value: deploymentAddress, children: ({ copied, copy }) => (_jsx(Tooltip, { label: copied ? 'Copied!' : 'Copy address', children: _jsx(ActionIcon, { color: copied ? 'teal' : 'gray', onClick: copy, variant: "subtle", children: copied ? _jsx(IconCheck, { size: 14 }) : _jsx(IconCopy, { size: 14 }) }) })) })] })] }), _jsx(Group, { gap: "xs", children: _jsx(Button, { size: "xs", variant: "light", onClick: () => {
                                                            const url = seiScanService.getContractUrl(deploymentAddress, chainId === 1328 ? 'testnet' : 'mainnet');
                                                            window.open(url, '_blank');
                                                        }, children: "View Contract on SeiScan" }) })] }) }) })), _jsx(Button, { onClick: handleClose, children: "Close" })] }) })] }), activeStep < 4 && (_jsxs(Group, { justify: "space-between", mt: "xl", children: [_jsx(Button, { variant: "default", onClick: prevStep, disabled: activeStep === 0, children: "Back" }), _jsx(Button, { onClick: nextStep, disabled: (activeStep === 0 && !canProceedStep1) ||
                            (activeStep === 1 && !canProceedStep2) ||
                            activeStep === 2, children: activeStep === 2 ? 'Deploy' : 'Next' })] }))] }));
}
