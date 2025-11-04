import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { getTokenAddressFromTicker } from '@sei-agent-kit-custom/tools/dexscreener';
import { Address } from 'viem';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError, resolveTokenAddress } from '../utils/tokenMaps';

export class DexScreener implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DexScreener',
    name: 'dexscreener',
    icon: 'file:DexScreener.svg',
    group: ['input'],
    version: 1,
    description: 'Get token information from DexScreener on Sei',
    defaults: { name: 'DexScreener' },
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
            name: 'Get Token',
            value: 'getToken',
            description: 'Get token address by symbol/ticker',
          },
        ],
        default: 'getToken',
        description: 'The action to perform',
      },
      {
        displayName: 'Token Symbol',
        name: 'tokenSymbol',
        type: 'string',
        default: '',
        required: true,
        description: 'Token symbol or ticker (e.g., "USDC", "SEI")',
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

        switch (action) {
          case 'getToken': {
            const tokenSymbol = this.getNodeParameter('tokenSymbol', i) as string;
            
            const tokenAddress = await getTokenAddressFromTicker(agent, tokenSymbol);
            
            result = {
              symbol: tokenSymbol,
              address: tokenAddress,
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
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: formatProtocolError('DexScreener', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

