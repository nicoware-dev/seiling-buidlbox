import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { get_erc721_balance, erc721Transfer, erc721Mint } from '@sei-agent-kit-custom/tools/sei-erc721';
import { Address } from 'viem';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';
import { resolveTokenAddress } from '../utils/tokenMaps';

export class ERC721 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ERC721',
    name: 'erc721',
    icon: 'file:ERC721.svg',
    group: ['transform'],
    version: 1,
    description: 'Query balances, transfer, and mint ERC721 NFTs on Sei',
    defaults: { name: 'ERC721' },
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
            description: 'Query ERC721 NFT balance for an account',
          },
          {
            name: 'Transfer',
            value: 'transfer',
            description: 'Transfer an NFT to another address',
          },
          {
            name: 'Mint',
            value: 'mint',
            description: 'Mint a new NFT',
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
        description: 'ERC721 NFT contract address (0x...)',
        displayOptions: {
          show: {
            action: ['balance', 'transfer', 'mint'],
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
        displayName: 'From Address',
        name: 'fromAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Address to transfer NFT from',
        displayOptions: {
          show: {
            action: ['transfer'],
          },
        },
      },
      {
        displayName: 'To Address',
        name: 'toAddress',
        type: 'string',
        default: '',
        required: true,
        description: 'Address to transfer NFT to',
        displayOptions: {
          show: {
            action: ['transfer', 'mint'],
          },
        },
      },
      {
        displayName: 'Token ID',
        name: 'tokenId',
        type: 'string',
        default: '',
        required: true,
        description: 'NFT token ID',
        displayOptions: {
          show: {
            action: ['transfer', 'mint'],
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
            const contractAddress = this.getNodeParameter('contractAddress', i) as Address;
            const accountAddress = this.getNodeParameter('accountAddress', i) as string;
            
            const balance = await get_erc721_balance(agent, resolveTokenAddress(contractAddress) as Address);
            
            result = {
              account: accountAddress,
              contractAddress,
              balance,
            };
            break;
          }

          case 'transfer': {
            const contractAddress = this.getNodeParameter('contractAddress', i) as Address;
            const fromAddress = this.getNodeParameter('fromAddress', i) as Address;
            const toAddress = this.getNodeParameter('toAddress', i) as Address;
            const tokenId = this.getNodeParameter('tokenId', i) as string;
            
            const txHash = await erc721Transfer(
              agent,
              BigInt(1), // Deprecated parameter
              toAddress,
              resolveTokenAddress(contractAddress) as Address,
              BigInt(tokenId)
            );
            
            result = {
              contractAddress,
              from: fromAddress,
              to: toAddress,
              tokenId,
              transactionHash: txHash,
            };
            break;
          }

          case 'mint': {
            const contractAddress = this.getNodeParameter('contractAddress', i) as Address;
            const toAddress = this.getNodeParameter('toAddress', i) as Address;
            const tokenId = this.getNodeParameter('tokenId', i) as string;
            
            const txHash = await erc721Mint(
              agent,
              toAddress,
              resolveTokenAddress(contractAddress) as Address,
              BigInt(tokenId)
            );
            
            result = {
              contractAddress,
              to: toAddress,
              tokenId,
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
            error: formatProtocolError('ERC721', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

