import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { createDebridgeOrder, getDebridgeQuote, getChainIdFromName } from '../utils/bridgeServices';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { parseUnits } from 'viem';

export class DeBridge implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DeBridge',
    name: 'debridge',
    icon: 'file:DeBridge.svg',
    group: ['transform'],
    version: 1,
    description: 'Cross-chain transfers via DeBridge Liquidity Network',
    defaults: { name: 'DeBridge' },
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
            description: 'Create and execute a cross-chain transfer via DeBridge',
          },
          {
            name: 'Get Quote',
            value: 'getQuote',
            description: 'Get a quote for a cross-chain transfer (estimation only)',
          },
        ],
        default: 'transfer',
        description: 'The action to perform',
      },
      {
        displayName: 'Source Chain',
        name: 'srcChain',
        type: 'string',
        default: '',
        required: true,
        description: 'Source chain name (e.g., "ethereum", "sei", "bsc") or chain ID',
      },
      {
        displayName: 'Source Token Address',
        name: 'srcChainTokenIn',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address on source chain (0x...)',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount to transfer (human-readable, e.g., "1.5")',
      },
      {
        displayName: 'Destination Chain',
        name: 'dstChain',
        type: 'string',
        default: '',
        required: true,
        description: 'Destination chain name (e.g., "ethereum", "sei", "bsc") or chain ID',
      },
      {
        displayName: 'Destination Token Address',
        name: 'dstChainTokenOut',
        type: 'string',
        default: '',
        required: true,
        description: 'Token address on destination chain (0x...)',
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
        
        const srcChainInput = this.getNodeParameter('srcChain', i) as string;
        const srcChainTokenIn = this.getNodeParameter('srcChainTokenIn', i) as string;
        const amount = this.getNodeParameter('amount', i) as string;
        const dstChainInput = this.getNodeParameter('dstChain', i) as string;
        const dstChainTokenOut = this.getNodeParameter('dstChainTokenOut', i) as string;

        // Parse chain IDs (support both names and IDs)
        let srcChainId: number;
        let dstChainId: number;
        
        try {
          srcChainId = /^\d+$/.test(srcChainInput) ? parseInt(srcChainInput, 10) : getChainIdFromName(srcChainInput);
        } catch {
          throw new NodeOperationError(this.getNode(), `Invalid source chain: ${srcChainInput}`);
        }
        
        try {
          dstChainId = /^\d+$/.test(dstChainInput) ? parseInt(dstChainInput, 10) : getChainIdFromName(dstChainInput);
        } catch {
          throw new NodeOperationError(this.getNode(), `Invalid destination chain: ${dstChainInput}`);
        }

        // Convert amount to wei (assuming 18 decimals for most tokens)
        // In production, you might want to get token decimals dynamically
        const srcChainTokenInAmount = parseUnits(amount, 18).toString();

        let result: any;
        let transactionHash: string | undefined;

        switch (action) {
          case 'transfer': {
            transactionHash = await createDebridgeOrder(
              agent,
              srcChainId,
              srcChainTokenIn,
              srcChainTokenInAmount,
              dstChainId,
              dstChainTokenOut
            );

            result = {
              srcChainId,
              srcChainTokenIn,
              amount,
              dstChainId,
              dstChainTokenOut,
              transactionHash,
            };
            break;
          }

          case 'getQuote': {
            const quote = await getDebridgeQuote(
              srcChainId,
              srcChainTokenIn,
              srcChainTokenInAmount,
              dstChainId,
              dstChainTokenOut
            );

            result = {
              srcChainId,
              srcChainTokenIn,
              amount,
              dstChainId,
              dstChainTokenOut,
              estimation: quote.estimation,
              transaction: quote.tx,
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
            error: formatProtocolError('DeBridge', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

