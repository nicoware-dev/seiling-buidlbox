# n8n-nodes-sei

Custom n8n nodes for Sei blockchain integration.

## Features

- **Sei Transaction Builder**: Build Sei blockchain transactions (token transfers, contract interactions)
- **Sei Transaction Executor**: Execute Sei blockchain transactions
- **Sei Explorer**: Query blocks, transactions, balances, and contract calls
- **Sei Deploy Contract**: Deploy custom, ERC-20, or ERC-721 contracts to Sei or any EVM-compatible chain
- **Sei Compile Contract**: Compile Solidity source code to bytecode and ABI with built-in templates
- Support for Sei Mainnet, Testnet, and custom networks
- Token transfers, smart contract interactions, contract deployment and compilation

## Installation

### Prerequisites

- Node.js 18.10 or higher
- npm or pnpm
- n8n installed globally

### Install from npm

[View on npm: n8n-nodes-sei](https://www.npmjs.com/package/n8n-nodes-sei)

```bash
npm install n8n-nodes-sei
```

### Install for local development

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Link the package:
   ```bash
   npm link
   ```
5. Link to your n8n installation:
   ```bash
   cd ~/.n8n/custom  # or your custom n8n directory
   npm link n8n-nodes-sei
   ```

## Usage

### Setting up Credentials

1. In n8n, go to **Settings > Credentials**
2. Add new credential of type "Sei API"
3. Enter your wallet private key (hex format)

### Using the Nodes

#### Sei Transaction Builder
- Build transactions for token transfers or contract interactions
- Returns transaction data that can be used with the executor

#### Sei Transaction Executor
- Execute transactions on the Sei blockchain
- Requires transaction data from the builder or manual input

#### Sei Explorer
- Query block info, transaction details, account balances, or call contract methods
- Supports custom RPC and all EVM-compatible chains

#### Sei Deploy Contract
- Deploy a smart contract to Sei or any EVM-compatible chain
- Supports three contract types:
  - **Custom**: Paste ABI and bytecode, enter constructor arguments
  - **ERC-20**: Fill in token name, symbol, decimals, initial supply
  - **ERC-721**: Fill in collection name, symbol
- Network selection: Sei Mainnet, Testnet, or custom RPC
- Uses the same credential as other Sei nodes
- Outputs deployed contract address and transaction hash

#### Sei Compile Contract
- Compile Solidity source code to bytecode and ABI
- Features:
  - **Solidity Compiler**: Built-in compiler with version selection (0.8.19-0.8.24)
  - **Optimization**: Configurable compiler optimization settings
  - **Template Support**: Use built-in ERC-20 and ERC-721 contract templates
  - **Error Handling**: Comprehensive compilation error and warning reporting
  - **Output Format**: Produces bytecode and ABI ready for deployment
- Perfect for complete smart contract workflow: Write → Compile → Deploy → Interact

### Networks Supported

- Sei Mainnet (Pacific-1)
- Sei Testnet (Atlantic-2)
- Custom networks via RPC URL (any EVM chain)

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Testing locally

```bash
npm run dev  # Watch mode
```

## License

MIT License 