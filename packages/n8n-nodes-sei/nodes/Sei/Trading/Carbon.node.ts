import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import {
  createBuySellStrategy,
  createOverlappingStrategy,
  updateStrategy,
  deleteStrategy,
  getUserStrategies,
  carbonConfig,
  StrategyType,
} from '@sei-agent-kit-custom/tools/carbon';
import { Address } from 'viem';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { resolveTokenAddress } from '../utils/tokenMaps';

export class Carbon implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Carbon',
    name: 'carbon',
    icon: 'file:Carbon.svg',
    group: ['transform'],
    version: 1,
    description: 'Create and manage Carbon trading strategies on Sei',
    defaults: { name: 'Carbon' },
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
            name: 'Create Strategy',
            value: 'createStrategy',
            description: 'Create a new buy/sell or overlapping trading strategy',
          },
          {
            name: 'Update Strategy',
            value: 'updateStrategy',
            description: 'Update existing strategy parameters',
          },
          {
            name: 'Delete Strategy',
            value: 'deleteStrategy',
            description: 'Delete a strategy by ID',
          },
          {
            name: 'Get Strategies',
            value: 'getStrategies',
            description: 'List all user strategies with details',
          },
        ],
        default: 'createStrategy',
        description: 'The action to perform',
      },
      {
        displayName: 'Strategy Type',
        name: 'strategyType',
        type: 'options',
        options: [
          {
            name: 'Disposable',
            value: 'disposable',
            description: 'One-time strategy',
          },
          {
            name: 'Recurring',
            value: 'recurring',
            description: 'Recurring strategy',
          },
        ],
        default: 'disposable',
        description: 'Strategy type',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Base Token',
        name: 'baseToken',
        type: 'string',
        default: '',
        required: true,
        description: 'Base token address (0x...)',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Quote Token',
        name: 'quoteToken',
        type: 'string',
        default: '',
        required: true,
        description: 'Quote token address (0x...)',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Buy Range',
        name: 'buyRange',
        type: 'string',
        default: '',
        description: 'Buy price range (comma-separated: low,high or single value)',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Sell Range',
        name: 'sellRange',
        type: 'string',
        default: '',
        description: 'Sell price range (comma-separated: low,high or single value)',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Buy Budget',
        name: 'buyBudget',
        type: 'string',
        default: '0',
        description: 'Buy budget amount',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Sell Budget',
        name: 'sellBudget',
        type: 'string',
        default: '0',
        description: 'Sell budget amount',
        displayOptions: {
          show: {
            action: ['createStrategy'],
          },
        },
      },
      {
        displayName: 'Strategy ID',
        name: 'strategyId',
        type: 'string',
        default: '',
        required: true,
        description: 'Strategy ID to update or delete',
        displayOptions: {
          show: {
            action: ['updateStrategy', 'deleteStrategy'],
          },
        },
      },
      {
        displayName: 'User Address',
        name: 'userAddress',
        type: 'string',
        default: '',
        description: 'User address to query strategies for (optional, defaults to connected wallet)',
        displayOptions: {
          show: {
            action: ['getStrategies'],
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
          case 'createStrategy': {
            const strategyType = this.getNodeParameter('strategyType', i) as StrategyType;
            const baseTokenInput = this.getNodeParameter('baseToken', i) as string;
            const quoteTokenInput = this.getNodeParameter('quoteToken', i) as string;
            const buyRange = this.getNodeParameter('buyRange', i, '') as string;
            const sellRange = this.getNodeParameter('sellRange', i, '') as string;
            const buyBudget = this.getNodeParameter('buyBudget', i, '0') as string;
            const sellBudget = this.getNodeParameter('sellBudget', i, '0') as string;

            const baseToken = resolveTokenAddress(baseTokenInput) as Address;
            const quoteToken = resolveTokenAddress(quoteTokenInput) as Address;

            const buyRangeArray = buyRange ? buyRange.split(',').map(s => s.trim()) : undefined;
            const sellRangeArray = sellRange ? sellRange.split(',').map(s => s.trim()) : undefined;

            transactionHash = await createBuySellStrategy(
              agent,
              carbonConfig,
              strategyType,
              baseToken,
              quoteToken,
              buyRangeArray,
              sellRangeArray,
              buyBudget,
              sellBudget
            );

            result = {
              strategyType,
              baseToken,
              quoteToken,
              buyRange: buyRangeArray,
              sellRange: sellRangeArray,
              buyBudget,
              sellBudget,
              transactionHash,
            };
            break;
          }

          case 'updateStrategy': {
            const strategyId = this.getNodeParameter('strategyId', i) as string;
            // Note: Update strategy requires more complex parameters
            // This is a simplified implementation
            throw new NodeOperationError(
              this.getNode(),
              'Update strategy requires additional parameters. Please use the Carbon SDK directly for advanced updates.'
            );
          }

          case 'deleteStrategy': {
            const strategyId = this.getNodeParameter('strategyId', i) as string;
            
            transactionHash = await deleteStrategy(agent, carbonConfig, strategyId);
            
            result = {
              strategyId,
              transactionHash,
            };
            break;
          }

          case 'getStrategies': {
            const userAddress = this.getNodeParameter('userAddress', i, '') as string;
            const addressToQuery = userAddress || agent.wallet_address;
            
            const strategies = await getUserStrategies(carbonConfig, addressToQuery as Address);
            
            result = {
              userAddress: addressToQuery,
              strategies: strategies?.map(s => ({
                id: s.id,
                token0: s.token0,
                token1: s.token1,
                // Add more fields as needed
              })) || [],
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
            error: formatProtocolError('Carbon', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

