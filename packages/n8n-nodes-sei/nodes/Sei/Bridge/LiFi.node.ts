import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { createLifiOrder, getLifiQuote, getLifiChains, getLifiToken } from '../utils/bridgeServices';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';

export class LiFi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'LiFi',
    name: 'lifi',
    icon: 'file:LiFi.svg',
    group: ['transform'],
    version: 1,
    description: 'Cross-chain swaps via Li.Fi protocol',
    defaults: { name: 'LiFi' },
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
            name: 'Transfer',
            value: 'transfer',
            description: 'Create and execute a cross-chain swap via LiFi',
          },
          {
            name: 'Get Quote',
            value: 'getQuote',
            description: 'Get a quote for a cross-chain swap',
          },
          {
            name: 'Get Chains',
            value: 'getChains',
            description: 'Get all supported chains',
          },
          {
            name: 'Get Token',
            value: 'getToken',
            description: 'Get token details for a specific chain',
          },
        ],
        default: 'transfer',
        description: 'The action to perform',
      },
      {
        displayName: 'From Chain ID',
        name: 'fromChainId',
        type: 'number',
        default: 0,
        required: true,
        description: 'Source chain ID (e.g., 1 for Ethereum, 1329 for Sei)',
        displayOptions: {
          show: {
            action: ['transfer', 'getQuote'],
          },
        },
      },
      {
        displayName: 'From Token Address',
        name: 'fromTokenAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address on source chain (0x...)',
        displayOptions: {
          show: {
            action: ['transfer', 'getQuote'],
          },
        },
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount to transfer (human-readable, e.g., "1.5")',
        displayOptions: {
          show: {
            action: ['transfer', 'getQuote'],
          },
        },
      },
      {
        displayName: 'To Chain ID',
        name: 'toChainId',
        type: 'number',
        default: 0,
        required: true,
        description: 'Destination chain ID (e.g., 1 for Ethereum, 1329 for Sei)',
        displayOptions: {
          show: {
            action: ['transfer', 'getQuote'],
          },
        },
      },
      {
        displayName: 'To Token Address',
        name: 'toTokenAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address on destination chain (0x...)',
        displayOptions: {
          show: {
            action: ['transfer', 'getQuote'],
          },
        },
      },
      {
        displayName: 'Chain ID',
        name: 'chainId',
        type: 'number',
        default: 0,
        required: true,
        description: 'Chain ID where the token exists',
        displayOptions: {
          show: {
            action: ['getToken'],
          },
        },
      },
      {
        displayName: 'Token Address',
        name: 'tokenAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Token contract address (0x...)',
        displayOptions: {
          show: {
            action: ['getToken'],
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
        const chain = this.getNodeParameter('chain', i) as string;
        const customRpc = this.getNodeParameter('rpc', i, '') as string;
        const action = this.getNodeParameter('action', i) as string;
        
        const credentials = await this.getCredentials('seiApi');
        const agent = await createProtocolClient(chain, customRpc, credentials);
        
        let result: any;
        let transactionHash: string | undefined;

        switch (action) {
          case 'transfer': {
            const fromChainId = this.getNodeParameter('fromChainId', i) as number;
            const fromTokenAddress = this.getNodeParameter('fromTokenAddress', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            const toChainId = this.getNodeParameter('toChainId', i) as number;
            const toTokenAddress = this.getNodeParameter('toTokenAddress', i) as string;

            const executedRoute = await createLifiOrder(
              agent,
              fromChainId,
              toChainId,
              fromTokenAddress,
              toTokenAddress,
              amount
            );

            result = {
              fromChainId,
              fromTokenAddress,
              amount,
              toChainId,
              toTokenAddress,
              route: executedRoute,
            };
            break;
          }

          case 'getQuote': {
            const fromChainId = this.getNodeParameter('fromChainId', i) as number;
            const fromTokenAddress = this.getNodeParameter('fromTokenAddress', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            const toChainId = this.getNodeParameter('toChainId', i) as number;
            const toTokenAddress = this.getNodeParameter('toTokenAddress', i) as string;

            const quote = await getLifiQuote(
              agent,
              fromChainId,
              toChainId,
              fromTokenAddress,
              toTokenAddress,
              amount
            );

            result = {
              fromChainId,
              fromTokenAddress,
              amount,
              toChainId,
              toTokenAddress,
              quote,
            };
            break;
          }

          case 'getChains': {
            const chains = await getLifiChains();
            result = {
              chains,
            };
            break;
          }

          case 'getToken': {
            const chainId = this.getNodeParameter('chainId', i) as number;
            const tokenAddress = this.getNodeParameter('tokenAddress', i) as string;

            const token = await getLifiToken(chainId, tokenAddress);
            result = {
              chainId,
              tokenAddress,
              token,
            };
            break;
          }

          default:
            throw new NodeOperationError(this.getNode(), `Unknown action: ${action}`);
        }

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
            error: formatProtocolError('LiFi', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

