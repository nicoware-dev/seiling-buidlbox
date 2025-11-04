import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from '../commons';
import { createProtocolClient } from '../utils/protocolClients';
import { stakeSei, unstakeSei } from '@sei-agent-kit-custom/tools/silo';
import { NodeOperationError } from 'n8n-workflow';
import { formatProtocolError } from '../utils/errorHandler';

export class Silo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Silo Finance',
    name: 'silo',
    icon: 'file:Silo.svg',
    group: ['transform'],
    version: 1,
    description: 'Stake and unstake SEI bonds in Silo Finance on Sei',
    defaults: { name: 'Silo Finance' },
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
            name: 'Stake',
            value: 'stake',
            description: 'Stake SEI bonds in Silo',
          },
          {
            name: 'Unstake',
            value: 'unstake',
            description: 'Unstake SEI bonds from Silo',
          },
        ],
        default: 'stake',
        description: 'The action to perform',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        required: true,
        description: 'Amount of SEI to stake/unstake (human-readable, e.g., "1.5")',
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
          case 'stake': {
            const amount = this.getNodeParameter('amount', i) as string;
            
            transactionHash = await stakeSei(agent, amount);
            
            result = {
              action: 'stake',
              amount,
              transactionHash,
            };
            break;
          }

          case 'unstake': {
            const amount = this.getNodeParameter('amount', i) as string;
            
            transactionHash = await unstakeSei(agent, amount);
            
            result = {
              action: 'unstake',
              amount,
              transactionHash,
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
            error: formatProtocolError('Silo Finance', this.getNodeParameter('action', i) as string, error),
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}

