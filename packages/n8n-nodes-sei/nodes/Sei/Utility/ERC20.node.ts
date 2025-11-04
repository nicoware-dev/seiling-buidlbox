import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { get_erc20_balance, erc20_transfer } from '@sei-agent-kit-custom/tools/sei-erc20';
import { Address } from 'viem';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { resolveTokenAddress } from '../utils/tokenMaps';

export class ERC20 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ERC20',
    name: 'erc20',
    icon: 'file:ERC20.svg',
    group: ['transform'],
    version: 1,
    description: 'Query balances and transfer ERC20 tokens on Sei',
    defaults: { name: 'ERC20' },
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
            name: 'Get Balance',
            value: 'balance',
            description: 'Query ERC20 token balance for an account',
          },
          {
            name: 'Transfer',
            value: 'transfer',
            description: 'Transfer ERC20 tokens to another address',
          },
        ],
        default: 'balance',
        description: 'The action to perform',
      },
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'ERC20 token contract address (0x...). Leave empty for native SEI balance.',
        displayOptions: {
          show: {
            action: ['balance'],
          },
        },
      },
      {
        displayName: 'Account Address',
        name: 'accountAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Address to query balance for',
        displayOptions: {
          show: {
            action: ['balance'],
          },
        },
      },
      {
        displayName: 'Token Address',
        name: 'tokenAddress',
        type: 'string',
        default: '',
        description: 'ERC20 token contract address (0x...) or leave empty for native SEI',
        displayOptions: {
          show: {
            action: ['transfer'],
          },
        },
      },
      {
        displayName: 'Recipient Address',
        name: 'recipient',
        type: 'string',
        default: '',
        required: true,
        description: 'Address to receive the tokens',
        displayOptions: {
          show: {
            action: ['transfer'],
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
            action: ['transfer'],
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
          case 'balance': {
            const contractAddress = this.getNodeParameter('contractAddress', i, '') as string;
            const accountAddress = this.getNodeParameter('accountAddress', i) as string;
            
            const tokenAddress = contractAddress ? (resolveTokenAddress(contractAddress) as Address) : undefined;
            
            // For native SEI, get_erc20_balance handles this when no address is provided
            const balance = await get_erc20_balance(agent, tokenAddress);
            
            result = {
              account: accountAddress,
              contractAddress: contractAddress || 'native SEI',
              balance,
            };
            break;
          }

          case 'transfer': {
            const tokenAddressInput = this.getNodeParameter('tokenAddress', i, '') as string;
            const recipient = this.getNodeParameter('recipient', i) as string;
            const amount = this.getNodeParameter('amount', i) as string;
            
            const tokenAddress = tokenAddressInput ? resolveTokenAddress(tokenAddressInput) as Address : undefined;
            
            const txHash = await erc20_transfer(agent, amount, recipient as Address, tokenAddress);
            
            result = {
              tokenAddress: tokenAddress || 'native SEI',
              recipient,
              amount,
              transactionHash: txHash,
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
            error: formatProtocolError('ERC20', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

