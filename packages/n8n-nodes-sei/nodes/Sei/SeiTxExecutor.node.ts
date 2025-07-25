import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { ethers } from 'ethers';
import { Property, SeiBlockchains } from './commons';
import { NodeOperationError } from 'n8n-workflow';

export class SeiTxExecutor implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei: Transaction executor',
    name: 'seiTxExecutor',
    icon: 'file:SeiTxExecutor.svg',
    group: ['transform', 'output'],
    version: 1,
    description: 'Execute Sei EVM transaction',
    defaults: {
      name: 'Execute Sei Transaction',
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
      {
        displayName: 'Execution Mode',
        name: 'executionMode',
        type: 'options',
        options: [
          {
            name: 'Use Transaction Builder Data',
            value: 'fromBuilder',
            description: 'Execute transaction using data from Transaction Builder node',
          },
          {
            name: 'Manual Parameters',
            value: 'manual',
            description: 'Manually specify transaction parameters',
          },
        ],
        default: 'fromBuilder',
        description: 'How to get transaction data',
      },
      // Manual mode properties
      Property.Blockchain,
      { ...Property.CustomRPC, required: false },
      { ...Property.Recipient, required: true },
      Property.Value,
      { ...Property.Nonce, required: true },
      { ...Property.Calldata, required: true },
      { ...Property.GasLimit, required: true },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const account = await this.getCredentials('seiApi');
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const executionMode = this.getNodeParameter('executionMode', i, 'fromBuilder') as string;

      try {
        let txData: any = {};
        let rpcUrl: string = '';

        if (executionMode === 'fromBuilder') {
          // Use data from Transaction Builder node
          const inputData = items[i].json;
          
          if (!inputData || !inputData.txData) {
            throw new NodeOperationError(this.getNode(), 'No transaction data found. Make sure to connect this node to a Transaction Builder node.');
          }

          txData = inputData.txData;
          rpcUrl = inputData.rpcUrl as string;
          
          if (!rpcUrl) {
            throw new NodeOperationError(this.getNode(), 'No RPC URL found in transaction data.');
          }
        } else {
          // Manual mode - get parameters from node configuration
          const chain = this.getNodeParameter('chain', i) as string;
          const customRpc = this.getNodeParameter('rpc', i, '') as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const value = this.getNodeParameter('value', i, '') as string;
          const nonce = this.getNodeParameter('nonce', i) as number;
          const data = this.getNodeParameter('calldata', i) as string;
          const gasLimit = this.getNodeParameter('gasLimit', i) as number;

          // Get the correct RPC URL
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

          txData = {
            to: recipient,
            nonce,
            gasLimit: gasLimit || undefined,
            data: data || '0x',
            value: value ? ethers.parseEther(value.toString()) : 0,
          };
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const signer = new ethers.Wallet(account.privateKey as string, provider);
        
        // Get fresh nonce if not provided or if fromBuilder mode
        if (!txData.nonce || executionMode === 'fromBuilder') {
          txData.nonce = await signer.getNonce();
        }

        console.log('Sending transaction:', txData);
        const tx = await signer.sendTransaction(txData);
        
        console.log('Tx hash:', tx.hash);
        const receipt = await tx.wait(1, 60000);
        
        returnData.push({ 
          json: { 
            success: true,
            transactionHash: tx.hash,
            receipt,
            txData,
            rpcUrl,
            timestamp: new Date().toISOString(),
          } 
        } as INodeExecutionData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        console.error('Transaction execution failed:', errorMessage);
        
        returnData.push({
          json: {
            success: false,
            error: true,
            errorMessage,
            timestamp: new Date().toISOString(),
          }
        } as INodeExecutionData);
      }
    }

    return [returnData];
  }
}
