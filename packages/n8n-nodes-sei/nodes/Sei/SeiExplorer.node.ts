import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from './commons';
import { ethers } from 'ethers';
import { NodeOperationError } from 'n8n-workflow';

// Helper function for RPC calls
async function makeRpcCall(rpcUrl: string, method: string, params: any[] = []): Promise<any> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data && typeof data === 'object' && 'error' in data) {
    const errorObj = data.error as any;
    throw new NodeOperationError(this.getNode(), 'RPC Error: ' + (errorObj?.message || 'Unknown RPC error'));
  }

  return data && typeof data === 'object' && 'result' in data ? data.result : data;
}

export class SeiExplorer implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei Explorer',
    name: 'seiExplorer',
    icon: 'file:SeiExplorer.svg',
    group: ['input'],
    version: 1,
    description: 'Fetch blockchain data from Sei network',
    defaults: {
      name: 'Sei Explorer',
    },
    inputs: ['main'] as any,
    outputs: ['main'] as any,
    credentials: [],
    properties: [
      Property.Blockchain,
      { ...Property.CustomRPC, required: false },
      {
        displayName: 'Query Type',
        name: 'queryType',
        type: 'options',
        options: [
          {
            name: 'Get Block Info',
            value: 'blockInfo',
            description: 'Get information about a specific block',
          },
          {
            name: 'Get Transaction Details',
            value: 'transactionDetails',
            description: 'Get details of a specific transaction',
          },
          {
            name: 'Get Account Balance',
            value: 'accountBalance',
            description: 'Get SEI balance of an account',
          },
          {
            name: 'Call Contract Method',
            value: 'contractCall',
            description: 'Call a read-only contract method',
          },
        ],
        default: 'blockInfo',
        description: 'Type of query to perform',
      },
      {
        displayName: 'Block Number',
        name: 'blockNumber',
        type: 'string',
        default: 'latest',
        description: 'Block number to query (use "latest" for latest block)',
        displayOptions: {
          show: {
            queryType: ['blockInfo'],
          },
        },
      },
      {
        displayName: 'Transaction Hash',
        name: 'transactionHash',
        type: 'string',
        default: '',
        description: 'Transaction hash to query',
        displayOptions: {
          show: {
            queryType: ['transactionDetails'],
          },
        },
      },
      {
        displayName: 'Account Address',
        name: 'accountAddress',
        type: 'string',
        default: '',
        description: 'Account address to query balance for',
        displayOptions: {
          show: {
            queryType: ['accountBalance'],
          },
        },
      },
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        default: '',
        description: 'Smart contract address',
        displayOptions: {
          show: {
            queryType: ['contractCall'],
          },
        },
      },
      {
        displayName: 'Contract ABI',
        name: 'contractAbi',
        type: 'json',
        default: '[]',
        description: 'Contract ABI for method calls',
        displayOptions: {
          show: {
            queryType: ['contractCall'],
          },
        },
      },
      {
        displayName: 'Method Name',
        name: 'methodName',
        type: 'string',
        default: '',
        description: 'Contract method name to call',
        displayOptions: {
          show: {
            queryType: ['contractCall'],
          },
        },
      },
      {
        displayName: 'Method Arguments',
        name: 'methodArgs',
        type: 'fixedCollection',
        default: [],
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'items',
            displayName: 'Argument',
            values: [
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
                description: 'Argument value',
              },
            ],
          },
        ],
        displayOptions: {
          show: {
            queryType: ['contractCall'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const chain = this.getNodeParameter('chain', i) as string;
      const customRpc = this.getNodeParameter('rpc', i, '') as string;
      const queryType = this.getNodeParameter('queryType', i) as string;

      // Get the correct RPC URL
      let rpcUrl: string;
      if (chain === '' || chain === 'custom') {
        if (!customRpc) {
          throw new NodeOperationError(this.getNode(), 'Custom RPC URL is required when using custom network.');
        }
        rpcUrl = customRpc;
      } else {
        const networkConfig = SeiBlockchains.find((n) => n.value === chain);
        if (!networkConfig) {
          throw new NodeOperationError(this.getNode(), `Unknown network: ${chain}.`);
        }
        rpcUrl = networkConfig.rpcUrl;
      }

      try {
        let result: any = {};

        switch (queryType) {
          case 'blockInfo':
            const blockNumber = this.getNodeParameter('blockNumber', i) as string;
            result = await makeRpcCall(rpcUrl, 'eth_getBlockByNumber', [blockNumber, true]);
            break;

          case 'transactionDetails':
            const transactionHash = this.getNodeParameter('transactionHash', i) as string;
            const transaction = await makeRpcCall(rpcUrl, 'eth_getTransactionByHash', [transactionHash]);
            const receipt = await makeRpcCall(rpcUrl, 'eth_getTransactionReceipt', [transactionHash]);
            result = { transaction, receipt };
            break;

          case 'accountBalance':
            const accountAddress = this.getNodeParameter('accountAddress', i) as string;
            const balance = await makeRpcCall(rpcUrl, 'eth_getBalance', [accountAddress, 'latest']);
            result = {
              address: accountAddress,
              balance,
              balanceInEth: parseFloat(balance) / Math.pow(10, 18),
            };
            break;

          case 'contractCall':
            const contractAddress = this.getNodeParameter('contractAddress', i) as string;
            const contractAbi = this.getNodeParameter('contractAbi', i) as any[];
            const methodName = this.getNodeParameter('methodName', i) as string;
            const methodArgs = this.getNodeParameter('methodArgs', i, []) as any;
            
            // Create contract interface and encode method call
            const contractInterface = new ethers.Interface(contractAbi);
            
            // Process method arguments - handle fixedCollection structure
            let args: any[] = [];
            if (methodArgs && methodArgs.items && Array.isArray(methodArgs.items)) {
              args = methodArgs.items.map((item: any) => item.value);
            } else if (Array.isArray(methodArgs)) {
              args = methodArgs.map((arg: any) => {
                if (typeof arg === 'object' && arg.value !== undefined) {
                  return arg.value;
                }
                return arg;
              });
            }
            const encodedData = contractInterface.encodeFunctionData(methodName, args);
            
            const data = {
              to: contractAddress,
              data: encodedData,
            };
            
            const callResult = await makeRpcCall(rpcUrl, 'eth_call', [data, 'latest']);
            
            // Decode the result
            let decodedResult: any;
            try {
              decodedResult = contractInterface.decodeFunctionResult(methodName, callResult);
              // If it's a single value, extract it
              if (decodedResult.length === 1) {
                decodedResult = decodedResult[0];
              }
            } catch (decodeError) {
              decodedResult = callResult; // Fall back to raw result
            }
            
            result = {
              contractAddress,
              methodName,
              arguments: args,
              rawResult: callResult,
              decodedResult,
            };
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown query type: ${queryType}.`);
        }

        returnData.push({
          json: {
            queryType,
            result,
            rpcUrl,
            chainId: chain,
            timestamp: new Date().toISOString(),
          }
        } as INodeExecutionData);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        
        returnData.push({
          json: {
            error: true,
            errorMessage,
            queryType,
            rpcUrl,
            chainId: chain,
            timestamp: new Date().toISOString(),
          }
        } as INodeExecutionData);
      }
    }

    return [returnData];
  }


}
