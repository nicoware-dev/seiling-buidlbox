import { IExecuteFunctions, INodeType, INodeExecutionData, INodeTypeDescription, IDataObject, NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';
import { Property, SeiBlockchains } from './commons';
import { loadContract } from './utils/contractLoader';
import { getCompiledContract } from './utils/contractCompiler';

export class SeiDeployContract implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei: Deploy Contract',
    name: 'seiDeployContract',
    icon: 'file:SeiDeployContract.svg',
    group: ['transform', 'output'],
    version: 1,
    description: 'Deploy a smart contract to Sei or any EVM-compatible chain',
    defaults: {
      name: 'Deploy Contract',
    },
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
        displayName: 'Contract Type',
        name: 'contractType',
        type: 'options',
        options: [
          { name: 'Custom', value: 'custom' },
          { name: 'ERC-20 Token', value: 'erc20' },
          { name: 'ERC-721 NFT', value: 'erc721' },
        ],
        default: 'custom',
        description: 'Type of contract to deploy',
      },
      // Custom contract fields
      {
        displayName: 'Contract ABI',
        name: 'customAbi',
        type: 'json',
        default: '[]',
        description: 'ABI for custom contract (JSON format)',
        displayOptions: { show: { contractType: ['custom'] } },
      },
      {
        displayName: 'Contract Bytecode',
        name: 'customBytecode',
        type: 'string',
        default: '',
        description: 'Compiled bytecode for custom contract (0x...)',
        displayOptions: { show: { contractType: ['custom'] } },
      },
      {
        displayName: 'Constructor Arguments',
        name: 'customArgs',
        type: 'fixedCollection',
        default: [],
        typeOptions: { multipleValues: true },
        options: [
          {
            name: 'items',
            displayName: 'Argument',
            values: [
              { displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Constructor argument value' },
            ],
          },
        ],
        description: 'Constructor arguments for custom contract',
        displayOptions: { show: { contractType: ['custom'] } },
      },
      // ERC-20 fields
      {
        displayName: 'Token Name',
        name: 'erc20Name',
        type: 'string',
        default: 'My Token',
        description: 'Full name of the ERC-20 token',
        displayOptions: { show: { contractType: ['erc20'] } },
      },
      {
        displayName: 'Token Symbol',
        name: 'erc20Symbol',
        type: 'string',
        default: 'MTK',
        description: 'Symbol/ticker of the ERC-20 token',
        displayOptions: { show: { contractType: ['erc20'] } },
      },
      {
        displayName: 'Decimals',
        name: 'erc20Decimals',
        type: 'number',
        default: 18,
        description: 'Number of decimal places (usually 18)',
        displayOptions: { show: { contractType: ['erc20'] } },
      },
      {
        displayName: 'Initial Supply',
        name: 'erc20Supply',
        type: 'number',
        default: 1000000,
        description: 'Initial token supply (will be multiplied by 10^decimals)',
        displayOptions: { show: { contractType: ['erc20'] } },
      },
      // ERC-721 fields
      {
        displayName: 'Collection Name',
        name: 'erc721Name',
        type: 'string',
        default: 'My NFT Collection',
        description: 'Name of the NFT collection',
        displayOptions: { show: { contractType: ['erc721'] } },
      },
      {
        displayName: 'Collection Symbol',
        name: 'erc721Symbol',
        type: 'string',
        default: 'MNFT',
        description: 'Symbol of the NFT collection',
        displayOptions: { show: { contractType: ['erc721'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const account = await this.getCredentials('seiApi');
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const chain = this.getNodeParameter('chain', i) as string;
      const customRpc = this.getNodeParameter('rpc', i, '') as string;
      const contractType = this.getNodeParameter('contractType', i) as string;

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

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = new ethers.Wallet(account.privateKey as string, provider);

      let abi: any[] = [];
      let bytecode = '';
      let args: any[] = [];

      try {
        if (contractType === 'custom') {
          abi = this.getNodeParameter('customAbi', i) as any[];
          bytecode = this.getNodeParameter('customBytecode', i) as string;
          const customArgs = this.getNodeParameter('customArgs', i, []) as any;
          
          // Process custom arguments - handle fixedCollection structure
          if (customArgs && customArgs.items && Array.isArray(customArgs.items)) {
            args = customArgs.items.map((item: any) => item.value);
          } else if (customArgs && Array.isArray(customArgs)) {
            args = customArgs.map((item: any) => {
              if (typeof item === 'object' && item.value !== undefined) {
                return item.value;
              }
              return item;
            });
          }
        } else if (contractType === 'erc20') {
          // Compile ERC20 contract from source
          const contract = getCompiledContract('ERC20', 'BasicERC20');
          abi = contract.abi;
          bytecode = contract.bytecode;
          
          const name = this.getNodeParameter('erc20Name', i) as string;
          const symbol = this.getNodeParameter('erc20Symbol', i) as string;
          const decimals = this.getNodeParameter('erc20Decimals', i) as number;
          const supply = this.getNodeParameter('erc20Supply', i) as number;
          // Note: The contract handles the decimals multiplication internally
          args = [name, symbol, decimals, supply];
        } else if (contractType === 'erc721') {
          // Compile ERC721 contract from source
          const contract = getCompiledContract('ERC721', 'BasicERC721');
          abi = contract.abi;
          bytecode = contract.bytecode;
          
          args = [
            this.getNodeParameter('erc721Name', i) as string,
            this.getNodeParameter('erc721Symbol', i) as string,
          ];
        }

        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(...args);
        
        // Wait for deployment to complete
        await contract.waitForDeployment();
        
        // Get contract address and deployment tx hash
        const contractAddress = await contract.getAddress();
        const deployTx = contract.deploymentTransaction();
        
        returnData.push({
          json: {
            contractAddress,
            transactionHash: deployTx?.hash || null,
            contractType,
            constructorArgs: args,
            abi,
            bytecode,
            rpcUrl,
            chainId: chain,
            timestamp: new Date().toISOString(),
            success: true,
          },
        } as INodeExecutionData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        returnData.push({
          json: {
            error: true,
            errorMessage,
            contractType,
            constructorArgs: args,
            rpcUrl,
            chainId: chain,
            timestamp: new Date().toISOString(),
            success: false,
          },
        } as INodeExecutionData);
      }
    }

    return [returnData];
  }
} 