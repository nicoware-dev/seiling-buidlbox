import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import {
  citrexPlaceOrder,
  citrexPlaceOrders,
  citrexCancelOrder,
  citrexCancelOrders,
  citrexCancelAndReplaceOrder,
  citrexListOpenOrders,
  citrexListPositions,
  citrexGetAccountHealth,
  citrexDeposit,
  citrexWithdraw,
  citrexGetProducts,
  citrexGetOrderBook,
  citrexGetTickers,
  citrexGetKlines,
  citrexGetTradeHistory,
  citrexCalculateMarginRequirement,
} from '@sei-agent-kit-custom/tools/citrex';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';

export class Citrex implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Citrex',
    name: 'citrex',
    icon: 'file:Citrex.svg',
    group: ['transform'],
    version: 1,
    description: 'Trade derivatives on Citrex exchange on Sei',
    defaults: { name: 'Citrex' },
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
          // Trading actions
          { name: 'Place Order', value: 'placeOrder', description: 'Place a trading order' },
          { name: 'Place Orders (Batch)', value: 'placeOrders', description: 'Place multiple orders' },
          { name: 'Cancel Order', value: 'cancelOrder', description: 'Cancel specific order' },
          { name: 'Cancel Orders (Batch)', value: 'cancelOrders', description: 'Cancel multiple orders' },
          { name: 'Cancel and Replace Order', value: 'cancelAndReplaceOrder', description: 'Replace an existing order' },
          // Account actions
          { name: 'Deposit', value: 'deposit', description: 'Deposit funds' },
          { name: 'Withdraw', value: 'withdraw', description: 'Withdraw funds' },
          { name: 'Get Account Health', value: 'getAccountHealth', description: 'Get account health metrics' },
          // Query actions
          { name: 'List Open Orders', value: 'listOpenOrders', description: 'List all open orders' },
          { name: 'List Positions', value: 'listPositions', description: 'List all positions' },
          { name: 'Get Products', value: 'getProducts', description: 'Get list of trading products' },
          { name: 'Get Order Book', value: 'getOrderBook', description: 'Get order book data' },
          { name: 'Get Tickers', value: 'getTickers', description: 'Get price tickers' },
          { name: 'Get Klines', value: 'getKlines', description: 'Get OHLCV candle data' },
          { name: 'Get Trade History', value: 'getTradeHistory', description: 'Get trading history' },
          { name: 'Calculate Margin', value: 'calculateMargin', description: 'Calculate margin requirement' },
        ],
        default: 'placeOrder',
        description: 'The action to perform',
      },
      // Common properties will be added conditionally based on action
      {
        displayName: 'Product ID',
        name: 'productId',
        type: 'string',
        default: '',
        description: 'Trading product ID',
        displayOptions: {
          show: {
            action: ['placeOrder', 'getOrderBook', 'getKlines'],
          },
        },
      },
      {
        displayName: 'Order ID',
        name: 'orderId',
        type: 'string',
        default: '',
        description: 'Order ID',
        displayOptions: {
          show: {
            action: ['cancelOrder', 'cancelAndReplaceOrder'],
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

        // Note: Citrex functions have complex parameter structures
        // This is a simplified implementation - full parameters should be added per action
        switch (action) {
          case 'placeOrder':
            result = await citrexPlaceOrder(agent, {} as any);
            break;
          case 'placeOrders':
            result = await citrexPlaceOrders(agent, [] as any);
            break;
          case 'cancelOrder': {
            const orderId = this.getNodeParameter('orderId', i) as string;
            result = await citrexCancelOrder(agent, orderId);
            break;
          }
          case 'cancelOrders':
            result = await citrexCancelOrders(agent, [] as any);
            break;
          case 'cancelAndReplaceOrder': {
            const orderId = this.getNodeParameter('orderId', i) as string;
            result = await citrexCancelAndReplaceOrder(agent, {} as any);
            break;
          }
          case 'listOpenOrders':
            result = await citrexListOpenOrders(agent);
            break;
          case 'listPositions':
            result = await citrexListPositions(agent);
            break;
          case 'getAccountHealth':
            result = await citrexGetAccountHealth(agent);
            break;
          case 'deposit':
            result = await citrexDeposit(agent, {} as any);
            break;
          case 'withdraw':
            result = await citrexWithdraw(agent, {} as any);
            break;
          case 'getProducts':
            result = await citrexGetProducts(agent);
            break;
          case 'getOrderBook': {
            const productId = this.getNodeParameter('productId', i) as string;
            result = await citrexGetOrderBook(agent, productId);
            break;
          }
          case 'getTickers':
            result = await citrexGetTickers(agent);
            break;
          case 'getKlines': {
            const productId = this.getNodeParameter('productId', i) as string;
            result = await citrexGetKlines(agent, productId, '1h', 100);
            break;
          }
          case 'getTradeHistory':
            result = await citrexGetTradeHistory(agent, {} as any);
            break;
          case 'calculateMargin':
            result = await citrexCalculateMarginRequirement(agent, {} as any);
            break;
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
            error: formatProtocolError('Citrex', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

