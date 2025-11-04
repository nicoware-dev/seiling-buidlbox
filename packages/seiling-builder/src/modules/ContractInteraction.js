import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActionIcon, Alert, Button, Card, Code, FileButton, Group, JsonInput, Select, Stack, Tabs, Text, TextInput, Tooltip, } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCode, IconEdit, IconEye, IconUpload } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ContractForm } from '../components/ContractForm';
import { networkConfigs } from '../config/wagmi';
import { seiScanService } from '../services/seiScan';
import { formatErrorForNotification } from '../utils/errorHandling';
export function ContractInteraction() {
    const [contractAddress, setContractAddress] = useState('');
    const [abiJson, setAbiJson] = useState('[]');
    const [selectedFunction, setSelectedFunction] = useState('');
    const [functionArgs, setFunctionArgs] = useState({});
    const [readResult, setReadResult] = useState(null);
    const [callError, setCallError] = useState(null);
    const [gasEstimate, setGasEstimate] = useState(null);
    const [loadingABI, setLoadingABI] = useState(false);
    const { address: accountAddress } = useAccount();
    const chainId = useChainId();
    const network = useMemo(() => (chainId === 1328 ? 'testnet' : 'mainnet'), [chainId]);
    const abi = useMemo(() => {
        try {
            return JSON.parse(abiJson);
        }
        catch {
            return [];
        }
    }, [abiJson]);
    const readFunctions = useMemo(() => abi.filter((func) => func.type === 'function' &&
        (func.stateMutability === 'view' || func.stateMutability === 'pure')), [abi]);
    const writeFunctions = useMemo(() => abi.filter((func) => func.type === 'function' &&
        func.stateMutability !== 'view' &&
        func.stateMutability !== 'pure'), [abi]);
    const selectedFunc = useMemo(() => abi.find((func) => func.name === selectedFunction), [abi, selectedFunction]);
    // Wagmi hooks for contract interaction
    const { data: readData, isLoading: isReading, error: readError } = useReadContract({
        address: contractAddress,
        abi,
        functionName: selectedFunction,
        args: selectedFunc?.inputs?.map((input) => functionArgs[input.name]),
        query: {
            enabled: false, // Manual trigger
        },
    });
    const { writeContract, data: writeHash, isPending: isWriting, isSuccess: isWriteSuccess, error: writeError, } = useWriteContract();
    // Wait for transaction receipt to get confirmation
    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash: writeHash,
    });
    // Auto-track successful transactions
    useEffect(() => {
        if (writeHash && contractAddress && selectedFunction && typeof window !== 'undefined') {
            const addTx = window.__seilingBuilderAddTransaction;
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
    const handleFileUpload = async (file) => {
        if (!file)
            return;
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            setAbiJson(JSON.stringify(parsed, null, 2));
            notifications.show({
                title: 'ABI Imported',
                message: 'Contract ABI has been imported successfully',
                color: 'green',
            });
        }
        catch (error) {
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
            }
            else {
                notifications.show({
                    title: 'ABI Not Found',
                    message: 'Contract not verified on SeiScan or ABI not available',
                    color: 'yellow',
                });
            }
        }
        catch (error) {
            notifications.show({
                title: 'Import Failed',
                message: error instanceof Error ? error.message : 'Failed to fetch ABI from SeiScan',
                color: 'red',
            });
        }
        finally {
            setLoadingABI(false);
        }
    };
    // Estimate gas for write functions
    const estimateGas = async () => {
        if (!selectedFunc || !contractAddress || !accountAddress)
            return;
        try {
            const args = selectedFunc.inputs?.map((input) => functionArgs[input.name]) || [];
            // This is a simplified gas estimation - in production, use useEstimateGas hook properly
            setGasEstimate('Estimating...');
            // Note: Enhanced gas estimation can use wagmi's useEstimateGas hook for more accurate values
            setGasEstimate('~21000 (default)');
        }
        catch (error) {
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
            const args = selectedFunc.inputs?.map((input) => {
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
                address: contractAddress,
                abi,
                functionName: selectedFunction,
                args: args,
            });
            setReadResult(result);
            notifications.show({
                title: 'Read Success',
                message: 'Function call completed successfully',
                color: 'green',
            });
        }
        catch (error) {
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
            const args = selectedFunc.inputs?.map((input) => {
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
                address: contractAddress,
                abi,
                functionName: selectedFunction,
                args: args,
            });
        }
        catch (error) {
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
    return (_jsx(Card, { withBorder: true, padding: "lg", radius: "md", children: _jsxs(Stack, { gap: "md", children: [_jsx(Text, { fw: 500, size: "lg", children: "Contract Interaction" }), _jsx(TextInput, { label: "Contract Address", placeholder: "0x...", value: contractAddress, onChange: (e) => setContractAddress(e.target.value), rightSection: contractAddress && (_jsxs(Group, { gap: "xs", children: [_jsx(Tooltip, { label: "Import ABI from SeiScan", children: _jsx(Button, { size: "xs", variant: "light", loading: loadingABI, onClick: handleImportFromSeiScan, children: "Import ABI" }) }), _jsx(Tooltip, { label: "View on SeiScan", children: _jsx(ActionIcon, { variant: "light", onClick: () => {
                                        const url = seiScanService.getContractUrl(contractAddress, network);
                                        window.open(url, '_blank');
                                    }, children: _jsx(IconEye, { size: 16 }) }) })] })) }), _jsxs("div", { children: [_jsxs(Group, { justify: "space-between", mb: "xs", children: [_jsx(Text, { size: "sm", fw: 500, children: "Contract ABI (JSON)" }), _jsx(Group, { gap: "xs", children: _jsx(FileButton, { onChange: handleFileUpload, accept: "application/json", children: (props) => (_jsx(Button, { ...props, size: "xs", variant: "light", leftSection: _jsx(IconUpload, { size: 14 }), children: "Upload File" })) }) })] }), _jsx(JsonInput, { value: abiJson, onChange: setAbiJson, minRows: 4, maxRows: 8, validationError: "Invalid JSON", placeholder: "Paste contract ABI here..." })] }), _jsxs(Tabs, { defaultValue: "read", children: [_jsxs(Tabs.List, { children: [_jsxs(Tabs.Tab, { value: "read", leftSection: _jsx(IconEye, { size: 16 }), children: ["Read (", readFunctions.length, ")"] }), _jsxs(Tabs.Tab, { value: "write", leftSection: _jsx(IconEdit, { size: 16 }), children: ["Write (", writeFunctions.length, ")"] }), _jsx(Tabs.Tab, { value: "abi", leftSection: _jsx(IconCode, { size: 16 }), children: "ABI" })] }), _jsx(Tabs.Panel, { value: "read", pt: "md", children: _jsxs(Stack, { gap: "md", children: [_jsx(Select, { label: "Function", placeholder: "Select a read function", data: readFunctions.map((func) => ({
                                            value: func.name,
                                            label: `${func.name}(${func.inputs?.map((i) => `${i.type} ${i.name || ''}`).join(', ') || ''})`,
                                        })), value: selectedFunction, onChange: (value) => {
                                            setSelectedFunction(value || '');
                                            setFunctionArgs({});
                                            setReadResult(null);
                                            setCallError(null);
                                        } }), selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (_jsx(ContractForm, { inputs: selectedFunc.inputs, values: functionArgs, onChange: setFunctionArgs })), _jsxs(Group, { children: [_jsx(Button, { leftSection: _jsx(IconEye, { size: 16 }), onClick: handleRead, disabled: !selectedFunction || !contractAddress, loading: isReading, children: "Read" }), _jsx(Button, { variant: "light", onClick: resetForm, children: "Clear" })] }), callError && (_jsx(Alert, { color: "red", title: "Error", children: callError })), readResult !== null && (_jsx(Alert, { color: "green", title: "Result", children: _jsx(Code, { block: true, children: JSON.stringify(readResult, null, 2) }) }))] }) }), _jsx(Tabs.Panel, { value: "write", pt: "md", children: _jsxs(Stack, { gap: "md", children: [!accountAddress && (_jsx(Alert, { color: "yellow", title: "Wallet Not Connected", children: "Please connect your wallet to write to contracts" })), _jsx(Select, { label: "Function", placeholder: "Select a write function", data: writeFunctions.map((func) => ({
                                            value: func.name,
                                            label: `${func.name}(${func.inputs?.map((i) => `${i.type} ${i.name || ''}`).join(', ') || ''})`,
                                        })), value: selectedFunction, onChange: (value) => {
                                            setSelectedFunction(value || '');
                                            setFunctionArgs({});
                                            setGasEstimate(null);
                                            setCallError(null);
                                        } }), selectedFunc?.inputs && selectedFunc.inputs.length > 0 && (_jsx(ContractForm, { inputs: selectedFunc.inputs, values: functionArgs, onChange: setFunctionArgs })), gasEstimate && (_jsxs(Text, { size: "sm", c: "dimmed", children: ["Estimated Gas: ", gasEstimate] })), _jsxs(Group, { children: [_jsx(Button, { leftSection: _jsx(IconEdit, { size: 16 }), onClick: handleWrite, disabled: !selectedFunction || !contractAddress || !accountAddress || isWaitingForReceipt, loading: isWriting || isWaitingForReceipt, color: "orange", children: isWaitingForReceipt ? 'Waiting for Confirmation...' : 'Execute' }), _jsx(Button, { variant: "light", onClick: () => estimateGas(), children: "Estimate Gas" }), _jsx(Button, { variant: "light", onClick: resetForm, children: "Clear" })] }), writeError && (_jsx(Alert, { color: "red", title: formatErrorForNotification(writeError).title, children: formatErrorForNotification(writeError).message })), isWriteSuccess && writeHash && (_jsx(Alert, { color: "green", title: isReceiptSuccess ? "Transaction Confirmed" : "Transaction Submitted", children: _jsxs(Stack, { gap: "xs", children: [_jsx(Text, { size: "sm", children: isWaitingForReceipt
                                                        ? "Waiting for confirmation..."
                                                        : isReceiptSuccess
                                                            ? "Transaction confirmed on blockchain"
                                                            : "Transaction submitted successfully" }), _jsx(Text, { size: "xs", ff: "monospace", c: "dimmed", children: writeHash }), _jsx(Button, { size: "xs", variant: "light", onClick: () => {
                                                        const url = seiScanService.getTransactionUrl(writeHash, network);
                                                        window.open(url, '_blank');
                                                    }, children: "View on SeiScan" })] }) }))] }) }), _jsx(Tabs.Panel, { value: "abi", pt: "md", children: _jsx(JsonInput, { value: abiJson, onChange: setAbiJson, minRows: 12, readOnly: true }) })] })] }) }));
}
