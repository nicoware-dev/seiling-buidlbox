import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import {
  supplyYei,
  borrowYei,
  repayYei,
  withdrawYei,
  wrapSei,
  unwrapSei,
  getYeiHealthFactor,
} from '@sei-agent-kit-custom/tools/yei';
import type {
  SupplyYeiParams,
  BorrowYeiParams,
  RepayYeiParams,
  WithdrawYeiParams,
  WrapSeiParams,
  UnwrapSeiParams,
} from '@sei-agent-kit-custom/tools/yei';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';

export class Yei implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Yei Finance',
    name: 'yei',
    icon: 'file:Yei.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with Yei Finance lending protocol on Sei',
    defaults: { name: 'Yei Finance' },
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
            name: 'Supply',
            value: 'supply',
            description: 'Supply assets to Yei pools',
          },
          {
            name: 'Borrow',
            value: 'borrow',
            description: 'Borrow assets from pools',
          },
          {
            name: 'Repay',
            value: 'repay',
            description: 'Repay borrowed assets',
          },
          {
            name: 'Withdraw',
            value: 'withdraw',
            description: 'Withdraw supplied assets',
          },
          {
            name: 'Wrap SEI',
            value: 'wrap',
            description: 'Wrap SEI to wSEI',
          },
          {
            name: 'Unwrap SEI',
            value: 'unwrap',
            description: 'Unwrap wSEI to SEI',
          },
          {
            name: 'Get Health Factor',
            value: 'getHealthFactor',
            description: 'Query user health factor and positions',
          },
        ],
        default: 'supply',
        description: 'The action to perform',
      },
      {
        displayName: 'Asset',
        name: 'asset',
        type: 'string',
        default: '',
        required: true,
        description: 'Token symbol (e.g., USDC, USDT, WSEI)',
        displayOptions: {
          show: {
            action: ['supply', 'borrow', 'repay', 'withdraw'],
          },
        },
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount (human-readable, e.g., "1.5"). Use "max" for repay/withdraw to use maximum available.',
        displayOptions: {
          show: {
            action: ['supply', 'borrow', 'repay', 'withdraw', 'wrap', 'unwrap'],
          },
        },
      },
      {
        displayName: 'Interest Rate Mode',
        name: 'interestRateMode',
        type: 'options',
        options: [
          {
            name: 'Stable',
            value: 1,
            description: 'Stable interest rate',
          },
          {
            name: 'Variable',
            value: 2,
            description: 'Variable interest rate',
          },
        ],
        default: 2,
        description: 'Interest rate mode for borrow action',
        displayOptions: {
          show: {
            action: ['borrow', 'repay'],
          },
        },
      },
      {
        displayName: 'On Behalf Of',
        name: 'onBehalfOf',
        type: 'string',
        default: '',
        description: 'Address to supply on behalf of (optional, defaults to connected wallet)',
        displayOptions: {
          show: {
            action: ['supply'],
          },
        },
      },
      {
        displayName: 'User Address',
        name: 'userAddress',
        type: 'string',
        default: '',
        description: 'User address to query health factor for (optional, defaults to connected wallet)',
        displayOptions: {
          show: {
            action: ['getHealthFactor'],
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
          case 'supply': {
            const asset = this.getNodeParameter('asset', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            const onBehalfOf = this.getNodeParameter('onBehalfOf', i, '') as string;
            
            const params: SupplyYeiParams = { asset, amount };
            transactionHash = await supplyYei(agent, params);
            
            result = {
              asset,
              amount,
              onBehalfOf: onBehalfOf || agent.wallet_address,
              transactionHash,
            };
            break;
          }

          case 'borrow': {
            const asset = this.getNodeParameter('asset', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            const interestRateMode = this.getNodeParameter('interestRateMode', i) as number;
            
            const params: BorrowYeiParams = { asset, amount, interestRateMode };
            transactionHash = await borrowYei(agent, params);
            
            result = {
              asset,
              amount,
              interestRateMode,
              transactionHash,
            };
            break;
          }

          case 'repay': {
            const asset = this.getNodeParameter('asset', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            const interestRateMode = this.getNodeParameter('interestRateMode', i, 2) as number;
            
            const params: RepayYeiParams = { asset, amount, interestRateMode };
            transactionHash = await repayYei(agent, params);
            
            result = {
              asset,
              amount,
              transactionHash,
            };
            break;
          }

          case 'withdraw': {
            const asset = this.getNodeParameter('asset', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            const params: WithdrawYeiParams = { asset, amount };
            transactionHash = await withdrawYei(agent, params);
            
            result = {
              asset,
              amount,
              transactionHash,
            };
            break;
          }

          case 'wrap': {
            const amount = this.getNodeParameter('amount', i) as string;
            
            const params: WrapSeiParams = { amount };
            transactionHash = await wrapSei(agent, params);
            
            result = {
              action: 'wrap',
              amount,
              transactionHash,
            };
            break;
          }

          case 'unwrap': {
            const amount = this.getNodeParameter('amount', i) as string;
            
            const params: UnwrapSeiParams = { amount };
            transactionHash = await unwrapSei(agent, params);
            
            result = {
              action: 'unwrap',
              amount,
              transactionHash,
            };
            break;
          }

          case 'getHealthFactor': {
            const userAddress = this.getNodeParameter('userAddress', i, '') as string;
            const addressToQuery = userAddress || agent.wallet_address;
            
            const healthData = await getYeiHealthFactor(agent, addressToQuery);
            
            result = {
              userAddress: addressToQuery,
              totalCollateralBase: healthData.totalCollateralBase.toString(),
              totalDebtBase: healthData.totalDebtBase.toString(),
              availableBorrowsBase: healthData.availableBorrowsBase.toString(),
              currentLiquidationThreshold: healthData.currentLiquidationThreshold.toString(),
              ltv: healthData.ltv.toString(),
              healthFactor: healthData.healthFactor.toString(),
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
            error: formatProtocolError('Yei Finance', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

