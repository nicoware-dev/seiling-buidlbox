import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppShell, Button, Container, Group, Stack, Tabs, Title } from '@mantine/core';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { IconCode, IconHistory, IconRocket } from '@tabler/icons-react';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConnectButton } from './components/ConnectButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkDropdown } from './components/NetworkDropdown';
import { TxHistory } from './components/TxHistory';
import { ContractInteraction } from './modules/ContractInteraction';
import { DeploymentWizard } from './modules/DeploymentWizard';
import { WagmiProviderWrapper } from './providers/WagmiProvider';
// Import Mantine styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
// ConnectKit styles are included automatically in ConnectKit v1
function App() {
    const [deploymentWizardOpened, setDeploymentWizardOpened] = useState(false);
    return (_jsxs(AppShell, { header: { height: 60 }, padding: "md", children: [_jsx(AppShell.Header, { p: "md", children: _jsxs(Group, { justify: "space-between", h: "100%", children: [_jsx(Group, { gap: "md", children: _jsx(Title, { order: 3, children: "Seiling Builder" }) }), _jsxs(Group, { gap: "sm", children: [_jsx(NetworkDropdown, {}), _jsx(ConnectButton, {})] })] }) }), _jsx(AppShell.Main, { children: _jsx(Container, { size: "xl", py: "xl", children: _jsxs(Tabs, { defaultValue: "interact", children: [_jsxs(Tabs.List, { children: [_jsx(Tabs.Tab, { value: "interact", leftSection: _jsx(IconCode, { size: 16 }), children: "Contract Interaction" }), _jsx(Tabs.Tab, { value: "deploy", leftSection: _jsx(IconRocket, { size: 16 }), children: "Deploy Contract" }), _jsx(Tabs.Tab, { value: "history", leftSection: _jsx(IconHistory, { size: 16 }), children: "Transaction History" })] }), _jsx(Tabs.Panel, { value: "interact", pt: "md", children: _jsx(ContractInteraction, {}) }), _jsx(Tabs.Panel, { value: "deploy", pt: "md", children: _jsxs(Stack, { gap: "md", children: [_jsx(Button, { size: "lg", onClick: () => setDeploymentWizardOpened(true), leftSection: _jsx(IconRocket, { size: 16 }), children: "Deploy New Contract" }), _jsx(DeploymentWizard, { opened: deploymentWizardOpened, onClose: () => setDeploymentWizardOpened(false) })] }) }), _jsx(Tabs.Panel, { value: "history", pt: "md", children: _jsx(TxHistory, {}) })] }) }) })] }));
}
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}
const root = createRoot(rootElement);
root.render(_jsx(React.StrictMode, { children: _jsx(ErrorBoundary, { children: _jsx(WagmiProviderWrapper, { children: _jsx(MantineProvider, { theme: {
                    primaryColor: 'blue',
                }, children: _jsxs(ModalsProvider, { children: [_jsx(Notifications, {}), _jsx(App, {})] }) }) }) }) }));
