import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Button, Stack, Text } from '@mantine/core';
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { style: { padding: '2rem', maxWidth: '800px', margin: '0 auto' }, children: _jsx(Alert, { color: "red", title: "Application Error", children: _jsxs(Stack, { gap: "md", children: [_jsx(Text, { size: "sm", children: "Something went wrong. Please check the browser console for details." }), this.state.error && (_jsx(Text, { size: "xs", c: "dimmed", ff: "monospace", children: this.state.error.message })), _jsx(Button, { onClick: () => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }, children: "Reload Page" })] }) }) }));
        }
        return this.props.children;
    }
}
