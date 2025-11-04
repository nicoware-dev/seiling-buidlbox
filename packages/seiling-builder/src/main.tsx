import { AppShell, Button, Container, Group, Image as MantineImage, Stack, Tabs, Title } from '@mantine/core';
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
import './branding.css';
// ConnectKit styles are included automatically in ConnectKit v1

function App() {
  const [deploymentWizardOpened, setDeploymentWizardOpened] = useState(false);

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header p="md" className="sbx-header">
        <Group justify="space-between" h="100%">
          <Group gap="sm">
            <img src="/icon.png" alt="Seiling Buidlbox" style={{ height: 28 }} />
            <Title order={3} className="sbx-title">Seiling Builder</Title>
          </Group>
          <Group gap="sm">
            <NetworkDropdown />
            <ConnectButton />
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Main>
      <Container size="xl" py="xl">
        <Tabs defaultValue="interact">
          <Tabs.List>
            <Tabs.Tab value="interact" leftSection={<IconCode size={16} />}>
              Contract Interaction
            </Tabs.Tab>
            <Tabs.Tab value="deploy" leftSection={<IconRocket size={16} />}>
              Deploy Contract
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
              Transaction History
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="interact" pt="md">
            <ContractInteraction />
          </Tabs.Panel>

          <Tabs.Panel value="deploy" pt="md">
            <Stack gap="md">
              <Button
                size="lg"
                onClick={() => setDeploymentWizardOpened(true)}
                leftSection={<IconRocket size={16} />}
              >
                Deploy New Contract
              </Button>
              <DeploymentWizard
                opened={deploymentWizardOpened}
                onClose={() => setDeploymentWizardOpened(false)}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            <TxHistory />
          </Tabs.Panel>
        </Tabs>
      </Container>
      </AppShell.Main>
    </AppShell>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProviderWrapper>
        <MantineProvider
          theme={{
            colors: {
              brand: [
                '#eff6ff',
                '#dbeafe',
                '#bfdbfe',
                '#93c5fd',
                '#60a5fa',
                '#3b82f6',
                '#2563eb',
                '#1d4ed8',
                '#1e40af',
                '#1e3a8a'
              ],
            },
            primaryColor: 'brand',
            defaultRadius: 'md',
          }}
        >
          <ModalsProvider>
            <Notifications />
            <App />
          </ModalsProvider>
        </MantineProvider>
      </WagmiProviderWrapper>
    </ErrorBoundary>
  </React.StrictMode>
);


