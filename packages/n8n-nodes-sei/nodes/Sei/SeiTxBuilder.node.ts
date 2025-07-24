import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { Property, SeiBlockchains } from './commons';
import { parseTokenAmount, isValidTokenAmount } from './utils/tokenUtils';
import { NodeOperationError } from 'n8n-workflow';

export class SeiTxBuilder implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei: Transaction builder',
    name: 'seiTxBuilder',
    icon: 'file:SeiTxBuilder.svg',
    group: ['transform', 'output'],
    version: 1,
    description: 'Generate Sei EVM transaction data',
    defaults: {
      name: 'Build Sei Transaction',
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
      { ...Property.Recipient, required: true },
      Property.Value,
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [
          Property.Abi,
          Property.SmartContractAddress,
          Property.SmartContractMethod,
          Property.SmartContractMethodArgs,
          {
            displayName: 'Token Decimals',
            name: 'tokenDecimals',
            type: 'number',
            default: 18,
            description: 'Number of decimals for token amount conversion (default: 18)',
            hint: 'Used to convert human-readable amounts to wei. Most tokens use 18 decimals.',
          },
          {
            displayName: 'Convert Token Amounts',
            name: 'convertTokenAmounts',
            type: 'boolean',
            default: true,
            description: 'Whether to automatically convert human-readable token amounts to wei',
            hint: 'Enable this for ERC-20 token transfers to convert amounts like "1.5" to "1500000000000000000"',
          },
        ],
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
      const recipient = this.getNodeParameter('recipient', i) as string;
      const value = this.getNodeParameter('value', i, '') as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
      const contractAbi = additionalFields.contractAbi as any[];
      const contractAddress = additionalFields.contractAddress as string;
      const contractMethod = additionalFields.contractMethod as string;
      const contractArgs = additionalFields.contractArgs as any;
      const tokenDecimals = additionalFields.tokenDecimals as number || 18;
      const convertTokenAmounts = additionalFields.convertTokenAmounts !== false;

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

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        let data = '0x';
        let decodedArgs: any[] = [];
        
        if (contractAbi && contractAddress && contractMethod) {
          // Process contract arguments - handle fixedCollection structure
          if (contractArgs && contractArgs.items && Array.isArray(contractArgs.items)) {
            decodedArgs = contractArgs.items.map((item: any) => item.value);
          } else if (contractArgs && Array.isArray(contractArgs)) {
            decodedArgs = contractArgs.map((arg: any) => {
              if (typeof arg === 'object' && arg.value !== undefined) {
                return arg.value;
              }
              return arg;
            });
          }

          // Convert token amounts if enabled and method is transfer/transferFrom
          if (convertTokenAmounts && contractMethod && 
              (contractMethod.toLowerCase().includes('transfer') || contractMethod.toLowerCase().includes('mint'))) {
            decodedArgs = decodedArgs.map((arg, index) => {
              // For transfer methods, the amount is usually the last argument
              // For transfer(address,uint256), amount is index 1
              // For transferFrom(address,address,uint256), amount is index 2
              const isAmountArg = (contractMethod.toLowerCase() === 'transfer' && index === 1) ||
                                  (contractMethod.toLowerCase() === 'transferfrom' && index === 2) ||
                                  (contractMethod.toLowerCase().includes('mint') && index === 1);
              
              if (isAmountArg && typeof arg === 'string' && isValidTokenAmount(arg)) {
                try {
                  return parseTokenAmount(arg, tokenDecimals);
                } catch (error) {
                  console.warn(`Failed to convert token amount ${arg}:`, error);
                  return arg;
                }
              }
              return arg;
            });
          }
          
          // Create contract interface and encode function data
          const contractInterface = new ethers.Interface(contractAbi);
          data = contractInterface.encodeFunctionData(contractMethod, decodedArgs);
        }

        const signer = new ethers.Wallet(account.privateKey as string, provider);
        const nonce = await signer.getNonce();
        
        // Build transaction object
        const txData = {
          to: contractAddress || recipient,
          nonce,
          data,
          value: value ? ethers.parseEther(value.toString()) : 0,
        };

        const signature = await signer.signTransaction(txData);

        returnData.push({ 
          json: { 
            success: true,
            recipient: contractAddress || recipient,
            signature, 
            nonce, 
            data, 
            value,
            contractAddress,
            contractMethod,
            contractArgs: decodedArgs,
            txData,
            rpcUrl,
            chainId: chain,
            timestamp: new Date().toISOString(),
          } 
        } as INodeExecutionData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        returnData.push({
          json: {
            success: false,
            error: true,
            errorMessage,
            recipient,
            value,
            contractAddress,
            contractMethod,
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
