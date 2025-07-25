import { INodeProperties } from 'n8n-workflow';

export const SeiBlockchains = [
  {
    name: 'Sei Mainnet EVM (Pacific-1)',
    value: 'sei-mainnet',
    rpcUrl: 'https://evm-rpc.sei-apis.com',
    chainId: 1329,
  },
  {
    name: 'Sei Testnet EVM (Atlantic-2)',
    value: 'sei-testnet',
    rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
    chainId: 1328,
  },
  {
    name: 'Custom',
    value: '',
    rpcUrl: '',
    chainId: '',
  },
];

export const Property: Record<string, INodeProperties> = {
  Blockchain: {
    displayName: 'Blockchain',
    name: 'chain',
    type: 'options',
    options: SeiBlockchains,
    default: 'sei-testnet',
    description: 'Target Sei EVM network',
    hint: 'The default RPC endpoints are provided as a highly-throttled, so consider using a custom RPC endpoint',
  },
  CustomRPC: {
    displayName: 'Custom RPC',
    name: 'rpc',
    type: 'string',
    default: '',
    description: 'Custom Sei EVM RPC endpoint URL',
    displayOptions: {
      show: {
        chain: [''],
      },
    },
  },
  Recipient: {
    displayName: 'Recipient Address',
    name: 'recipient',
    type: 'string',
    default: '',
    description: 'The recipient address (0x... format).',
  },
  Value: {
    displayName: 'Value',
    name: 'value',
    type: 'number',
    typeOptions: {
      numberPrecision: 8,
    },
    default: '',
    description: 'Transaction SEI value',
  },
  Abi: {
    displayName: 'ABI',
    name: 'contractAbi',
    type: 'json',
    default: '[]',
    description: 'JSON ABI which must include encoded method type and should include potential error types',
  },
  SmartContractAddress: {
    displayName: 'Smart Contract Address',
    name: 'contractAddress',
    type: 'string',
    default: '',
  },
  SmartContractMethod: {
    displayName: 'Smart Contract Method Name',
    name: 'contractMethod',
    type: 'string',
    default: '',
  },
  SmartContractMethodArgs: {
    displayName: 'Smart Contract Method Arguments',
    name: 'contractArgs',
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
    hint: 'Preserve the same number and order of arguments as in the ABI definition',
  },
  Nonce: {
    displayName: 'Nonce',
    name: 'nonce',
    type: 'number',
    default: 0,
    description: 'Transaction nonce',
  },
  GasLimit: {
    displayName: 'Gas Limit',
    name: 'gasLimit',
    type: 'number',
    default: 21000,
    description: 'Gas limit for the transaction',
  },
  Signature: {
    displayName: 'Signature',
    name: 'signature',
    type: 'string',
    default: '',
    required: true,
    description: 'Transaction signature',
  },
  Calldata: {
    displayName: 'Calldata',
    name: 'calldata',
    type: 'string',
    default: '',
    description: 'Transaction calldata',
  },
};
