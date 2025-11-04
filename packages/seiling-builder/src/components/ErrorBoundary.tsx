import { Alert, Button, Stack, Text } from '@mantine/core';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <Alert color="red" title="Application Error">
            <Stack gap="md">
              <Text size="sm">
                Something went wrong. Please check the browser console for details.
              </Text>
              {this.state.error && (
                <Text size="xs" c="dimmed" ff="monospace">
                  {this.state.error.message}
                </Text>
              )}
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </Stack>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

