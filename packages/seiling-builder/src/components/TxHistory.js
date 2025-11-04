import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActionIcon, Badge, Button, Card, Group, Stack, Table, Text, TextInput, Tooltip, } from '@mantine/core';
import { IconExternalLink, IconSearch, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { seiScanService } from '../services/seiScan';
const STORAGE_KEY = 'seiling-builder-tx-history';
export function TxHistory() {
    const [transactions, setTransactions] = useState([]);
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
        }
        catch (error) {
            console.error('Failed to load transaction history:', error);
        }
    }, []);
    // Save transactions to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        }
        catch (error) {
            console.error('Failed to save transaction history:', error);
        }
    }, [transactions]);
    const addTransaction = (tx) => {
        setTransactions((prev) => [tx, ...prev].slice(0, 50)); // Keep last 50
    };
    const removeTransaction = (hash) => {
        setTransactions((prev) => prev.filter((tx) => tx.hash !== hash));
    };
    const clearHistory = () => {
        setTransactions([]);
    };
    const filteredTransactions = transactions.filter((tx) => {
        if (!filter)
            return true;
        const searchLower = filter.toLowerCase();
        return (tx.hash.toLowerCase().includes(searchLower) ||
            tx.contractAddress?.toLowerCase().includes(searchLower) ||
            tx.functionName?.toLowerCase().includes(searchLower));
    });
    const getStatusColor = (status) => {
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
        window.__seilingBuilderAddTransaction = addTransaction;
        return () => {
            delete window.__seilingBuilderAddTransaction;
        };
    }, []);
    if (transactions.length === 0) {
        return (_jsx(Card, { withBorder: true, padding: "lg", radius: "md", children: _jsxs(Stack, { gap: "md", children: [_jsx(Group, { justify: "space-between", children: _jsx(Text, { fw: 500, size: "lg", children: "Transaction History" }) }), _jsx(Text, { size: "sm", c: "dimmed", ta: "center", py: "md", children: "No transactions yet. Transaction history will appear here after you interact with contracts." })] }) }));
    }
    return (_jsx(Card, { withBorder: true, padding: "lg", radius: "md", children: _jsxs(Stack, { gap: "md", children: [_jsxs(Group, { justify: "space-between", children: [_jsxs(Text, { fw: 500, size: "lg", children: ["Transaction History (", transactions.length, ")"] }), _jsxs(Group, { gap: "xs", children: [_jsx(Button, { size: "xs", variant: "light", onClick: exportHistory, children: "Export" }), _jsx(Button, { size: "xs", variant: "light", color: "red", onClick: clearHistory, children: "Clear" })] })] }), _jsx(TextInput, { placeholder: "Filter by hash, address, or function...", leftSection: _jsx(IconSearch, { size: 16 }), value: filter, onChange: (e) => setFilter(e.target.value) }), _jsx(Table.ScrollContainer, { minWidth: 800, children: _jsxs(Table, { children: [_jsx(Table.Thead, { children: _jsxs(Table.Tr, { children: [_jsx(Table.Th, { children: "Hash" }), _jsx(Table.Th, { children: "Status" }), _jsx(Table.Th, { children: "Contract" }), _jsx(Table.Th, { children: "Function" }), _jsx(Table.Th, { children: "Gas Used" }), _jsx(Table.Th, { children: "Time" }), _jsx(Table.Th, { children: "Actions" })] }) }), _jsx(Table.Tbody, { children: filteredTransactions.map((tx) => (_jsxs(Table.Tr, { children: [_jsx(Table.Td, { children: _jsxs(Text, { size: "xs", ff: "monospace", children: [tx.hash.slice(0, 10), "...", tx.hash.slice(-8)] }) }), _jsx(Table.Td, { children: _jsx(Badge, { color: getStatusColor(tx.status), size: "sm", variant: "light", children: tx.status }) }), _jsx(Table.Td, { children: tx.contractAddress ? (_jsxs(Text, { size: "xs", ff: "monospace", children: [tx.contractAddress.slice(0, 8), "...", tx.contractAddress.slice(-6)] })) : (_jsx(Text, { size: "xs", c: "dimmed", children: "-" })) }), _jsx(Table.Td, { children: _jsx(Text, { size: "xs", children: tx.functionName || '-' }) }), _jsx(Table.Td, { children: _jsx(Text, { size: "xs", children: tx.gasUsed || '-' }) }), _jsx(Table.Td, { children: _jsx(Text, { size: "xs", children: new Date(tx.timestamp).toLocaleString() }) }), _jsx(Table.Td, { children: _jsxs(Group, { gap: "xs", children: [_jsx(Tooltip, { label: "View on SeiScan", children: _jsx(ActionIcon, { variant: "light", size: "sm", onClick: () => {
                                                                const url = seiScanService.getTransactionUrl(tx.hash, network);
                                                                window.open(url, '_blank');
                                                            }, children: _jsx(IconExternalLink, { size: 14 }) }) }), _jsx(Tooltip, { label: "Remove", children: _jsx(ActionIcon, { variant: "light", color: "red", size: "sm", onClick: () => removeTransaction(tx.hash), children: _jsx(IconTrash, { size: 14 }) }) })] }) })] }, tx.hash))) })] }) }), filteredTransactions.length === 0 && filter && (_jsx(Text, { size: "sm", c: "dimmed", ta: "center", py: "md", children: "No transactions match your filter" }))] }) }));
}
