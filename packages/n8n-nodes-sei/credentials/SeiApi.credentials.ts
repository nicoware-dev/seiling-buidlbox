import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SeiApi implements ICredentialType {
  name = 'seiApi';
  displayName = 'Sei API';
  documentationUrl = 'https://docs.sei.io/';
  properties: INodeProperties[] = [
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      required: true,
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The private key for your Sei wallet (hex format)',
    },
  ];
} 