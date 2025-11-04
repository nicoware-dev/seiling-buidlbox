# Seiling Builder

A fully-featured no-code/low-code UI for interacting with and deploying smart contracts on Sei EVM. Part of the Seiling Buidlbox v2 ecosystem, built with modern React, Wagmi, and Mantine UI.

## 🚀 Features

- ✅ **Wallet Connection**: Connect any Web3 wallet via ConnectKit
- ✅ **Network Switching**: Seamlessly switch between Sei Testnet and Mainnet
- ✅ **Contract Interaction**: Read and write to contracts with dynamic ABI forms
- ✅ **ABI Import**: Import ABIs from file upload, SeiScan, or manual entry
- ✅ **Contract Deployment**: Deploy contracts from Solidity source or bytecode
- ✅ **Transaction History**: Track and manage your contract interactions
- ✅ **SeiScan Integration**: View contracts and transactions on SeiScan
- ✅ **n8n Export**: Export workflows for automation
- ✅ **Dynamic Forms**: Auto-generated forms based on contract ABI

## 📋 Getting Started

```bash
# Install dependencies
cd packages/seiling-builder
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3002`

### Run with Docker

Build and run the container locally:

```bash
cd packages/seiling-builder
docker build -t seiling-builder:latest .
docker run --rm -p 3002:80 seiling-builder:latest
```

Or using docker-compose:

```bash
cd packages/seiling-builder
docker compose up --build
```

Open `http://localhost:3002`.

## 🎯 Usage

### Connecting Your Wallet
1. Click the "Connect Wallet" button in the header
2. Select your wallet from the ConnectKit modal
3. Approve the connection in your wallet
4. Your address and balance will be displayed

### Interacting with Contracts
1. Navigate to the "Contract Interaction" tab
2. Enter a contract address
3. Import the ABI (upload file, fetch from SeiScan, or paste JSON)
4. Select a function from the dropdown
5. Fill in parameters using the dynamic forms
6. Click "Read" for view functions or "Execute" for state-changing functions

### Deploying Contracts
1. Go to the "Deploy Contract" tab
2. Click "Deploy New Contract"
3. Choose deployment mode:
   - **Source Code**: Upload/paste Solidity source and compile
   - **Bytecode**: Provide pre-compiled bytecode and ABI
4. Optionally pick a Template (Simple ERC20, Counter) to prefill source code
5. Follow the wizard steps to deploy

### Viewing Transaction History
1. Navigate to the "Transaction History" tab
2. View your recent transactions
3. Filter by hash, address, or function name
4. Click SeiScan links to view on the explorer

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Wagmi v2** - Ethereum wallet interactions
- **Viem** - Low-level Ethereum utilities
- **Mantine UI** - Component library
- **ConnectKit** - Wallet connection UI
- **React Query** - Server state management
- **Solc** - Solidity compiler

## 🌐 Supported Networks

- **Sei EVM Testnet (Atlantic-2)**: Chain ID 1328
- **Sei EVM Mainnet (Pacific-1)**: Chain ID 1329

## 📚 Documentation

For detailed implementation documentation, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)

For the development plan and architecture, see [plan.md](./plan.md)

## 🐛 Known Issues & Limitations

- SeiScan API endpoints may need adjustment based on actual API structure
- Gas estimation is basic and can be enhanced
- Transaction tracking requires manual addition (auto-tracking can be added)
- Struct/tuple parameter handling has basic support

## 🔮 Future Enhancements

- More contract templates (ERC721, ERC1155, MultiSig, etc.)
- Automatic transaction event tracking
- Contract verification on SeiScan
- Advanced gas price estimation
- Transaction simulation/dry-run
- Multi-contract management
- Enhanced n8n export features

## 📝 License

See project root LICENSE file.

