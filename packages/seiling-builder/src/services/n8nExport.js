/**
 * n8n Export Service
 * Generates n8n workflow JSON from Builder actions
 */
/**
 * Generate n8n HTTP Request node for contract interaction
 */
export function exportContractInteractionToN8n(interaction) {
    const method = interaction.isRead ? 'eth_call' : 'eth_sendTransaction';
    const networkConfig = {
        testnet: 'https://evm-rpc-testnet.sei-apis.com',
        mainnet: 'https://evm-rpc.sei-apis.com',
    };
    return {
        parameters: {
            url: networkConfig[interaction.network],
            sendBody: true,
            bodyParameters: {
                parameters: [
                    {
                        name: 'jsonrpc',
                        value: '2.0',
                    },
                    {
                        name: 'method',
                        value: method,
                    },
                    {
                        name: 'params',
                        value: JSON.stringify(interaction.isRead
                            ? [
                                {
                                    to: interaction.contractAddress,
                                    data: '0x...', // Would need to encode function call here
                                },
                                'latest',
                            ]
                            : [
                                {
                                    to: interaction.contractAddress,
                                    data: '0x...', // Would need to encode function call here
                                },
                            ]),
                    },
                    {
                        name: 'id',
                        value: '1',
                    },
                ],
            },
            options: {
                response: {
                    response: {
                        responseFormat: 'json',
                    },
                },
            },
        },
        name: `Contract ${interaction.functionName}`,
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 1,
        position: [250, 300],
    };
}
/**
 * Generate n8n workflow for deployment
 */
export function exportDeploymentToN8n(deployment) {
    const networkConfig = {
        testnet: 'https://evm-rpc-testnet.sei-apis.com',
        mainnet: 'https://evm-rpc.sei-apis.com',
    };
    return {
        name: `Deploy ${deployment.contractName}`,
        nodes: [
            {
                parameters: {
                    url: networkConfig[deployment.network],
                    sendBody: true,
                    bodyParameters: {
                        parameters: [
                            {
                                name: 'jsonrpc',
                                value: '2.0',
                            },
                            {
                                name: 'method',
                                value: 'eth_sendTransaction',
                            },
                            {
                                name: 'params',
                                value: JSON.stringify([
                                    {
                                        data: deployment.bytecode,
                                        // Additional deployment parameters
                                    },
                                ]),
                            },
                            {
                                name: 'id',
                                value: '1',
                            },
                        ],
                    },
                },
                name: 'Deploy Contract',
                type: 'n8n-nodes-base.httpRequest',
                typeVersion: 1,
                position: [250, 300],
            },
        ],
        connections: {},
    };
}
/**
 * Export complete workflow with multiple interactions
 */
export function exportWorkflowToN8n(interactions, deployments = []) {
    const nodes = [];
    let xPosition = 250;
    let yPosition = 300;
    // Add deployment nodes
    deployments.forEach((deployment) => {
        nodes.push({
            ...exportDeploymentToN8n(deployment).nodes[0],
            position: [xPosition, yPosition],
        });
        yPosition += 200;
    });
    // Add interaction nodes
    interactions.forEach((interaction) => {
        nodes.push({
            ...exportContractInteractionToN8n(interaction),
            position: [xPosition, yPosition],
        });
        yPosition += 200;
    });
    return {
        name: 'Seiling Builder Workflow',
        nodes,
        connections: {},
        settings: {
            executionOrder: 'v1',
        },
        staticData: null,
        tags: [],
        triggerCount: 0,
        updatedAt: new Date().toISOString(),
        versionId: '1',
    };
}
/**
 * Download workflow as JSON file
 */
export function downloadWorkflow(workflow, filename = 'n8n-workflow.json') {
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
