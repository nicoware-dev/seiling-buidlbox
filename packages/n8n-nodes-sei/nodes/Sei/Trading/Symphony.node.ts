import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { swap } from '@sei-agent-kit-custom/tools/symphony';
import { Address } from 'viem';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { resolveTokenAddress } from '../utils/tokenMaps';

export class Symphony implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Symphony',
    name: 'symphony',
    icon: 'file:Symphony.svg',
    group: ['transform'],
    version: 1,
    description: 'Swap tokens using Symphony DEX aggregator on Sei',
    defaults: { name: 'Symphony' },
    inputs: ['main'] as any,
    outputs: ['main'] as any,
    credentials: [
      {
        name: 'seiApi',
        required: true,
      },
    ],
    properties: [
      Property.Blockchain,
      { ...Property.CustomRPC, required: false },
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [
          {
            name: 'Swap',
            value: 'swap',
            description: 'Swap tokens via Symphony aggregator',
          },
        ],
        default: 'swap',
        description: 'The action to perform',
      },
      {
        displayName: 'Token In',
        name: 'tokenIn',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address (0x...) or symbol to swap from. Use "0x0" for native SEI.',
        displayOptions: {
          show: {
            action: ['swap'],
          },
        },
      },
      {
        displayName: 'Token Out',
        name: 'tokenOut',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address (0x...) or symbol to swap to',
        displayOptions: {
          show: {
            action: ['swap'],
          },
        },
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount of token in to swap (human-readable, e.g., "1.5")',
        displayOptions: {
          show: {
            action: ['swap'],
          },
        },
      },
      {
        displayName: 'Slippage Tolerance (%)',
        name: 'slippage',
        type: 'number',
        default: 0.5,
        description: 'Maximum acceptable slippage percentage (optional, defaults to 0.5%)',
        displayOptions: {
          show: {
            action: ['swap'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // 1. Get parameters
        const chain = this.getNodeParameter('chain', i) as string;
        const customRpc = this.getNodeParameter('rpc', i, '') as string;
        const action = this.getNodeParameter('action', i) as string;
        
        // 2. Get credentials and create protocol client
        const credentials = await this.getCredentials('seiApi');
        const agent = await createProtocolClient(chain, customRpc, credentials);
        
        // 3. Execute based on action
        let result: any;
        let transactionHash: string | undefined;

        switch (action) {
          case 'swap': {
            const tokenInInput = this.getNodeParameter('tokenIn', i) as string;
            const tokenOutInput = this.getNodeParameter('tokenOut', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;

            // Resolve token addresses
            // Handle native SEI (0x0)
            let tokenIn: Address;
            if (tokenInInput === '0x0' || tokenInInput.toLowerCase() === 'sei') {
              tokenIn = '0x0' as Address;
            } else {
              tokenIn = resolveTokenAddress(tokenInInput) as Address;
            }

            const tokenOut = resolveTokenAddress(tokenOutInput) as Address;

            // Call swap function
            const swapResult = await swap(agent, amount, tokenIn, tokenOut);
            
            // Check if result is an error JSON string
            if (typeof swapResult === 'string' && swapResult.startsWith('{')) {
              try {
                const parsed = JSON.parse(swapResult);
                if (parsed.status === 'error') {
                  throw new Error(parsed.message || 'Swap failed');
                }
              } catch {
                // Not JSON, treat as transaction hash
                transactionHash = swapResult;
              }
            } else {
              transactionHash = swapResult;
            }

            result = {
              tokenIn,
              tokenOut,
              amount,
              transactionHash,
            };
            break;
          }

          default:
            throw new NodeOperationError(this.getNode(), `Unknown action: ${action}`);
        }

        // 4. Format output
        returnData.push({
          json: {
            success: true,
            action,
            result,
            transactionHash,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: formatProtocolError('Symphony', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

