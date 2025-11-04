import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import {
  mintTakara,
  borrowTakara,
  repayTakara,
  redeemTakara,
  getRedeemableAmount,
  getBorrowBalance,
} from '@sei-agent-kit-custom/tools/takara';
import type { MintTakaraParams } from '@sei-agent-kit-custom/tools/takara';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { Address } from 'viem';

export class Takara implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Takara Protocol',
    name: 'takara',
    icon: 'file:Takara.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with Takara Protocol lending on Sei',
    defaults: { name: 'Takara Protocol' },
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
            name: 'Mint',
            value: 'mint',
            description: 'Mint tTokens by supplying underlying',
          },
          {
            name: 'Borrow',
            value: 'borrow',
            description: 'Borrow underlying using tTokens as collateral',
          },
          {
            name: 'Repay',
            value: 'repay',
            description: 'Repay borrowed tokens',
          },
          {
            name: 'Redeem',
            value: 'redeem',
            description: 'Redeem tTokens to withdraw underlying',
          },
          {
            name: 'Query',
            value: 'query',
            description: 'Query protocol state (rates, liquidity, etc.)',
          },
        ],
        default: 'mint',
        description: 'The action to perform',
      },
      {
        displayName: 'Ticker',
        name: 'ticker',
        type: 'string',
        default: '',
        required: true,
        description: 'Token ticker (e.g., SEI, USDC, USDT)',
        displayOptions: {
          show: {
            action: ['mint', 'borrow', 'repay', 'redeem', 'query'],
          },
        },
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount (human-readable, e.g., "1.5")',
        displayOptions: {
          show: {
            action: ['mint', 'borrow', 'repay', 'redeem'],
          },
        },
      },
      {
        displayName: 'Query Type',
        name: 'queryType',
        type: 'options',
        options: [
          {
            name: 'Redeemable Amount',
            value: 'redeemable',
            description: 'Get redeemable amount for ticker',
          },
          {
            name: 'Borrow Balance',
            value: 'borrowBalance',
            description: 'Get borrow balance for ticker',
          },
        ],
        default: 'redeemable',
        description: 'Type of query to perform',
        displayOptions: {
          show: {
            action: ['query'],
          },
        },
      },
      {
        displayName: 'User Address',
        name: 'userAddress',
        type: 'string',
        default: '',
        description: 'User address to query (optional, defaults to connected wallet)',
        displayOptions: {
          show: {
            action: ['query'],
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
          case 'mint': {
            const ticker = this.getNodeParameter('ticker', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            const params: MintTakaraParams = { ticker, mintAmount: amount };
            transactionHash = await mintTakara(agent, params) as any;
            
            result = {
              ticker,
              amount,
              transactionHash,
            };
            break;
          }

          case 'borrow': {
            const ticker = this.getNodeParameter('ticker', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            transactionHash = await borrowTakara(agent, { ticker, borrowAmount: amount });
            
            result = {
              ticker,
              amount,
              transactionHash,
            };
            break;
          }

          case 'repay': {
            const ticker = this.getNodeParameter('ticker', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            transactionHash = await repayTakara(agent, { ticker, repayAmount: amount });
            
            result = {
              ticker,
              amount,
              transactionHash,
            };
            break;
          }

          case 'redeem': {
            const ticker = this.getNodeParameter('ticker', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            transactionHash = await redeemTakara(agent, { ticker, redeemAmount: amount });
            
            result = {
              ticker,
              amount,
              transactionHash,
            };
            break;
          }

          case 'query': {
            const ticker = this.getNodeParameter('ticker', i) as string;
            const queryType = this.getNodeParameter('queryType', i) as string;
            const userAddress = this.getNodeParameter('userAddress', i, '') as string;
            
            if (queryType === 'redeemable') {
              const queryResult = await getRedeemableAmount(
                agent,
                ticker,
                userAddress ? (userAddress as Address) : undefined
              );
              result = {
                ticker,
                queryType: 'redeemable',
                ...queryResult,
              };
            } else if (queryType === 'borrowBalance') {
              const queryResult = await getBorrowBalance(
                agent,
                ticker,
                userAddress ? (userAddress as Address) : undefined
              );
              result = {
                ticker,
                queryType: 'borrowBalance',
                ...queryResult,
              };
            }
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
            error: formatProtocolError('Takara Protocol', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

