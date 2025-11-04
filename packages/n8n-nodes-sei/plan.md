# n8n-nodes-sei Upgrade Plan - Protocol-Specific Nodes

## Package Overview
Upgrade `n8n-nodes-sei` package to include comprehensive protocol-specific nodes for trading, lending/borrowing, staking, bridging, and DeFi operations on Sei Network. This will enable 5x workflow capabilities and cover 90% of Sei protocols.

**Current Version**: 0.1.0  
**Target**: 2.0.0 (major upgrade)  
**Stack**: TypeScript, n8n-workflow, ethers.js, viem  
**Reference**: `packages/sei-agent-kit-custom/src/tools/` (existing protocol implementations)

## Current State

### ✅ Completed
- Basic Sei blockchain nodes:
  - `SeiExplorer` - Query blockchain data
  - `SeiTxBuilder` - Build transactions
  - `SeiTxExecutor` - Execute transactions
  - `SeiDeployContract` - Deploy contracts
  - `SeiCompileContract` - Compile Solidity
- Common utilities (`commons.ts`):
  - Sei blockchain configurations (testnet/mainnet)
  - Property definitions for nodes
  - RPC helper functions

### ❌ Not Started
- **Trading Protocol Nodes**:
  - Symphony DEX aggregator node (swap action)
  - Carbon strategy management node (create, update, delete, get strategies)
  
- **Lending/Borrowing Protocol Nodes**:
  - Yei Finance node (supply, borrow, repay, withdraw, wrap, unwrap, getHealthFactor)
  - Takara Protocol node (mint, borrow, repay, redeem, query)
  
- **Staking Protocol Nodes**:
  - Silo Finance node (stake, unstake bonds)
  
- **Derivatives/Trading Platform Nodes**:
  - Citrex node (place order, cancel order, list orders, positions, account health, deposit, withdraw, get products, orderbook, tickers, klines, trade history, calculate margin)
  
- **Bridge/Cross-Chain Nodes**:
  - deBridge node (cross-chain transfer)
  - LiFi node (cross-chain transfer)
  
- **Utility/Data Nodes**:
  - DexScreener node (get token info)
  - ERC20 node (balance, transfer)
  - ERC721 node (balance, transfer, mint)

## Reference Examples & Code to Reuse

### Primary Reference: sei-agent-kit-custom Tools
Location: `packages/sei-agent-kit-custom/src/tools/`

**Protocol Categories to Port**:

#### 1. Trading Protocols
- **Symphony** (`tools/symphony/`):
  - `swap.ts` - Token swapping via aggregator
  
- **Carbon** (`tools/carbon/`):
  - `createBuySellStrategy.ts` - Create trading strategies
  - `createOverlappingStrategy.ts` - Overlapping range strategies
  - `updateStrategy.ts` - Modify existing strategies
  - `deleteStrategy.ts` - Remove strategies
  - `getUserStrategies.ts` - List user strategies
  - `composeTradeBySourceTx.ts` - Trade composition
  - `composeTradeByTargetTx.ts` - Target-based trades

#### 2. Lending/Borrowing Protocols
- **Yei Finance** (`tools/yei/`):
  - `supply.ts` - Supply assets to pools
  - `borrow.ts` - Borrow assets
  - `repay.ts` - Repay borrowed assets
  - `withdraw.ts` - Withdraw supplied assets
  - `wrap.ts` / `unwrap.ts` - SEI wrapping
  - `user.ts` - User health factor queries
  
- **Takara Protocol** (`tools/takara/`):
  - `mint.ts` - Mint tTokens (supply)
  - `borrow.ts` - Borrow underlying tokens
  - `repay.ts` - Repay borrowed tokens
  - `redeem.ts` - Redeem tTokens (withdraw)
  - `query.ts` - Query protocol state

#### 3. Staking Protocols
- **Silo Finance** (`tools/silo/`):
  - `stakeBond.ts` - Stake bonds
  - `unstakeBond.ts` - Unstake bonds

#### 4. Derivatives/Trading Platforms
- **Citrex** (`tools/citrex/`):
  - `placeOrder.ts` - Place trading orders
  - `placeOrders.ts` - Batch order placement
  - `cancelOrder.ts` - Cancel specific order
  - `cancelOrders.ts` - Batch cancel
  - `cancelAndReplaceOrder.ts` - Replace order
  - `listOpenOrders.ts` - Query open orders
  - `listPositions.ts` - View positions
  - `getAccountHealth.ts` - Account health check
  - `deposit.ts` - Deposit funds
  - `withdraw.ts` - Withdraw funds
  - `getProducts.ts` - List trading products
  - `getOrderBook.ts` - Order book data
  - `getTickers.ts` - Price tickers
  - `getKlines.ts` - OHLCV data
  - `getTradeHistory.ts` - Trading history
  - `calculateMarginRequirement.ts` - Margin calculations

#### 5. Bridge/Cross-Chain
- **deBridge** (`tools/deBridge/`) - Check if exists
- **LiFi** (`tools/lifi/`) - Check if exists

#### 6. Utility/Data
- **DexScreener** (`tools/dexscreener/`):
  - `getTokenAddress.ts` - Token lookup
  
- **ERC20/ERC721** (`tools/sei-erc20/`, `tools/sei-erc721/`):
  - Balance queries
  - Transfer operations
  - Mint (ERC721)

### Documentation
- See `docs/pillars/new-feature-development/n8n-expansions.md` for spec

## Architecture

```
packages/n8n-nodes-sei/
├── nodes/
│   ├── Sei/
│   │   ├── commons.ts (✅ existing)
│   │   ├── SeiExplorer.node.ts (✅ existing)
│   │   ├── SeiTxBuilder.node.ts (✅ existing)
│   │   ├── SeiTxExecutor.node.ts (✅ existing)
│   │   ├── SeiDeployContract.node.ts (✅ existing)
│   │   ├── SeiCompileContract.node.ts (✅ existing)
│   │   │
│   │   ├── Trading/
│   │   │   ├── Symphony.node.ts (❌ TODO: Actions: swap)
│   │   │   └── Carbon.node.ts (❌ TODO: Actions: createStrategy, updateStrategy, deleteStrategy, getStrategies)
│   │   │
│   │   ├── Lending/
│   │   │   ├── Yei.node.ts (❌ TODO: Actions: supply, borrow, repay, withdraw, wrap, unwrap, getHealthFactor)
│   │   │   └── Takara.node.ts (❌ TODO: Actions: mint, borrow, repay, redeem, query)
│   │   │
│   │   ├── Staking/
│   │   │   └── Silo.node.ts (❌ TODO: Actions: stake, unstake)
│   │   │
│   │   ├── Derivatives/
│   │   │   └── Citrex.node.ts (❌ TODO: Actions: placeOrder, cancelOrder, listOrders, listPositions, getAccountHealth, deposit, withdraw, getProducts, getOrderBook, getTickers, getKlines, getTradeHistory, calculateMargin)
│   │   │
│   │   ├── Bridge/
│   │   │   ├── DeBridge.node.ts (❌ TODO: Actions: transfer)
│   │   │   └── LiFi.node.ts (❌ TODO: Actions: transfer)
│   │   │
│   │   └── Utility/
│   │       ├── DexScreener.node.ts (❌ TODO: Actions: getToken)
│   │       ├── ERC20.node.ts (❌ TODO: Actions: balance, transfer)
│   │       └── ERC721.node.ts (❌ TODO: Actions: balance, transfer, mint)
│   │
│   └── utils/
│       ├── contractCompiler.ts (✅ existing)
│       ├── contractLoader.ts (✅ existing)
│       ├── tokenUtils.ts (✅ existing)
│       ├── protocolClients.ts (❌ TODO: Shared protocol client setup)
│       └── abiLoader.ts (❌ TODO: Load ABIs from tools)
├── credentials/
│   └── SeiApi.credentials.ts (✅ existing)
├── package.json (✅ existing)
└── index.js (✅ existing)
```

## Core Protocol Nodes to Build

### Phase 1: Trading Protocols (High Priority)

#### 1. Symphony Node (`nodes/Sei/Trading/Symphony.node.ts`)
- **Port from**: `tools/symphony/swap.ts`
- **Actions**:
  - `swap` - Token swap via Symphony aggregator
- **Action: swap Properties**:
  - Token In (address or symbol)
  - Token Out (address or symbol)
  - Amount In / Amount Out (toggle)
  - Slippage tolerance (%)
  - Deadline (optional)
- **Output**: Transaction hash, route info, executed amount

#### 2. Carbon Node (`nodes/Sei/Trading/Carbon.node.ts`)
- **Port from**: `tools/carbon/` folder
- **Actions**:
  - `createStrategy` - Create buy/sell or overlapping strategies
  - `updateStrategy` - Update existing strategy parameters
  - `deleteStrategy` - Delete strategy by ID
  - `getStrategies` - List all user strategies with details
- **Action: createStrategy Properties**:
  - Strategy Type (buy/sell/overlapping)
  - Base Token
  - Quote Token
  - Buy Range (low/marginal/high)
  - Sell Range (low/marginal/high)
  - Buy Budget
  - Sell Budget
- **Action: updateStrategy Properties**:
  - Strategy ID
  - Parameters to update (same as createStrategy)
- **Action: deleteStrategy Properties**:
  - Strategy ID
- **Action: getStrategies Properties**:
  - User address (optional, defaults to connected wallet)

### Phase 2: Lending/Borrowing Protocols (High Priority)

#### 3. Yei Finance Node (`nodes/Sei/Lending/Yei.node.ts`)
- **Port from**: `tools/yei/` folder
- **Actions**:
  - `supply` - Supply assets to Yei pools
  - `borrow` - Borrow assets from pools
  - `repay` - Repay borrowed assets
  - `withdraw` - Withdraw supplied assets
  - `wrap` - Wrap SEI to wSEI
  - `unwrap` - Unwrap wSEI to SEI
  - `getHealthFactor` - Query user health factor and positions
- **Action: supply Properties**:
  - Asset (token symbol)
  - Amount (human-readable)
  - On Behalf Of (optional)
- **Action: borrow Properties**:
  - Asset (token symbol)
  - Amount (human-readable)
- **Action: repay Properties**:
  - Asset (token symbol)
  - Amount (human-readable or max)
- **Action: withdraw Properties**:
  - Asset (token symbol)
  - Amount (human-readable or max)
- **Action: wrap Properties**:
  - Amount
- **Action: unwrap Properties**:
  - Amount
- **Action: getHealthFactor Properties**:
  - User address (optional, defaults to connected wallet)

#### 4. Takara Protocol Node (`nodes/Sei/Lending/Takara.node.ts`)
- **Port from**: `tools/takara/` folder
- **Actions**:
  - `mint` - Mint tTokens by supplying underlying
  - `borrow` - Borrow underlying using tTokens as collateral
  - `repay` - Repay borrowed tokens
  - `redeem` - Redeem tTokens to withdraw underlying
  - `query` - Query protocol state (rates, liquidity, etc.)
- **Action: mint Properties**:
  - Ticker (token symbol)
  - Amount
- **Action: borrow Properties**:
  - Ticker (token symbol)
  - Borrow Amount
- **Action: repay Properties**:
  - Ticker (token symbol)
  - Repay Amount
- **Action: redeem Properties**:
  - Ticker (token symbol)
  - Redeem Amount
- **Action: query Properties**:
  - Query Type (rates, liquidity, market info)
  - Ticker (optional)

### Phase 3: Staking Protocols (Medium Priority)

#### 5. Silo Finance Node (`nodes/Sei/Staking/Silo.node.ts`)
- **Port from**: `tools/silo/` folder
- **Actions**:
  - `stake` - Stake bonds in Silo
  - `unstake` - Unstake bonds from Silo
- **Action: stake Properties**:
  - Bond Type
  - Amount
- **Action: unstake Properties**:
  - Bond ID or Type
  - Amount

### Phase 4: Derivatives/Trading Platforms (Medium Priority)

#### 6. Citrex Node (`nodes/Sei/Derivatives/Citrex.node.ts`)
- **Port from**: `tools/citrex/` folder
- **Actions**:
  - **Trading**: `placeOrder`, `placeOrders` (batch), `cancelOrder`, `cancelOrders` (batch), `cancelAndReplaceOrder`
  - **Account**: `deposit`, `withdraw`, `getAccountHealth`
  - **Data/Query**: `listOpenOrders`, `listPositions`, `getProducts`, `getOrderBook`, `getTickers`, `getKlines`, `getTradeHistory`, `calculateMarginRequirement`
- **Action: placeOrder Properties**:
  - Order type (market/limit)
  - Product ID
  - Side (buy/sell)
  - Size
  - Price (for limit orders)
- **Action: cancelOrder Properties**:
  - Order ID
- **Action: deposit Properties**:
  - Amount
  - Token/Product
- **Action: withdraw Properties**:
  - Amount
  - Token/Product
- **Action: getAccountHealth Properties**:
  - Account address (optional)
- **Data query actions** have appropriate properties based on their function

### Phase 5: Bridge/Cross-Chain (Medium Priority)

#### 7. DeBridge Node (`nodes/Sei/Bridge/DeBridge.node.ts`)
- **Port from**: `tools/deBridge/` (check if exists)
- **Actions**:
  - `transfer` - Cross-chain transfer via deBridge
- **Action: transfer Properties**:
  - Source Chain
  - Destination Chain
  - Token Address
  - Amount
  - Recipient Address

#### 8. LiFi Node (`nodes/Sei/Bridge/LiFi.node.ts`)
- **Port from**: `tools/lifi/` (check if exists)
- **Actions**:
  - `transfer` - Cross-chain transfer via LiFi
- **Action: transfer Properties**:
  - Source Chain
  - Destination Chain
  - Token Address
  - Amount
  - Recipient Address

### Phase 6: Utility/Data Nodes (Low Priority)

#### 9. DexScreener Node (`nodes/Sei/Utility/DexScreener.node.ts`)
- **Port from**: `tools/dexscreener/`
- **Actions**:
  - `getToken` - Token info lookup
- **Action: getToken Properties**:
  - Token address or symbol

#### 10. ERC20 Node (`nodes/Sei/Utility/ERC20.node.ts`)
- **Port from**: `tools/sei-erc20/`
- **Actions**:
  - `balance` - Query token balance
  - `transfer` - Transfer tokens
- **Action: balance Properties**:
  - Token address
  - Account address
- **Action: transfer Properties**:
  - Token address
  - To address
  - Amount

#### 11. ERC721 Node (`nodes/Sei/Utility/ERC721.node.ts`)
- **Port from**: `tools/sei-erc721/`
- **Actions**:
  - `balance` - Query NFT balance
  - `transfer` - Transfer NFTs
  - `mint` - Mint new NFT (if supported)
- **Action: balance Properties**:
  - Contract address
  - Account address
- **Action: transfer Properties**:
  - Contract address
  - From address
  - To address
  - Token ID
- **Action: mint Properties**:
  - Contract address
  - To address
  - Token URI (optional)

## Shared Utilities to Build

### 1. Protocol Client Factory (`utils/protocolClients.ts`)
- **Purpose**: Create initialized clients for each protocol
- **Features**:
  - SeiAgentKit initialization (from sei-agent-kit-custom)
  - RPC client setup
  - Wallet client setup (from credentials)
  - Protocol-specific SDK initialization
- **Usage**: All protocol nodes use this for consistent client setup

### 2. ABI Loader (`utils/abiLoader.ts`)
- **Purpose**: Load ABIs from sei-agent-kit-custom
- **Features**:
  - Import ABIs from tools folders
  - Cache ABIs in memory
  - Support for protocol-specific ABIs (Yei, Takara, etc.)

### 3. Token Map Utilities (`utils/tokenMaps.ts`)
- **Purpose**: Token address/symbol mapping
- **Features**:
  - Yei token map
  - Takara token map
  - Common token addresses (USDC, WETH, etc.)
  - Symbol to address resolution

### 4. Error Handling (`utils/errorHandler.ts`)
- **Purpose**: Standardized error handling
- **Features**:
  - Parse protocol-specific errors
  - User-friendly error messages
  - Transaction revert reason extraction

## Node Implementation Pattern

### Standard Node Structure with Action Selection
```typescript
import { IExecuteFunctions } from 'n8n-workflow';
import { INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import { SeiBlockchains, Property } from './commons';
import { createProtocolClient } from '../utils/protocolClients';
import { functionName1, functionName2 } from '@sei-agent-kit-custom/tools/protocol-name';

export class ProtocolNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Protocol Name',
    name: 'protocolName',
    icon: 'file:ProtocolName.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with Protocol Name on Sei',
    defaults: { name: 'Protocol Name' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'seilingApi',
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
            name: 'Action 1',
            value: 'action1',
            description: 'Description of action 1',
          },
          {
            name: 'Action 2',
            value: 'action2',
            description: 'Description of action 2',
          },
        ],
        default: 'action1',
        description: 'The action to perform',
      },
      // Action 1 specific properties
      {
        displayName: 'Parameter 1',
        name: 'param1',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            action: ['action1'],
          },
        },
      },
      // Action 2 specific properties
      {
        displayName: 'Parameter 2',
        name: 'param2',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            action: ['action2'],
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
        // 1. Get parameters
        const chain = this.getNodeParameter('chain', i) as string;
        const customRpc = this.getNodeParameter('rpc', i, '') as string;
        const action = this.getNodeParameter('action', i) as string;
        
        // 2. Create protocol client
        const credentials = await this.getCredentials('seilingApi');
        const agent = await createProtocolClient(chain, customRpc, credentials);
        
        // 3. Execute based on action
        let result: any;
        switch (action) {
          case 'action1':
            const param1 = this.getNodeParameter('param1', i) as string;
            result = await functionName1(agent, { param1 });
            break;
            
          case 'action2':
            const param2 = this.getNodeParameter('param2', i) as string;
            result = await functionName2(agent, { param2 });
            break;
            
          default:
            throw new Error(`Unknown action: ${action}`);
        }
        
        // 4. Format output
        returnData.push({
          json: {
            success: true,
            action,
            result,
            transactionHash: typeof result === 'string' ? result : result?.hash || result?.transactionHash,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  }
}
```

## Credentials Enhancement

### Current: `SeiApi.credentials.ts`
- **Enhancement Needed**: Support for protocol-specific credentials
- **Properties to Add**:
  - Private key (encrypted)
  - Protocol API keys (Citrex, Carbon, etc.)
  - RPC endpoint preferences

## Package.json Updates

### Dependencies to Add
```json
{
  "dependencies": {
    "ethers": "^6.14.4", // ✅ existing
    "viem": "^2.21.35", // ❌ TODO: Add for better TypeScript support
    "@sei-agent-kit-custom": "workspace:*", // ❌ TODO: Reference local package
    "symphony-sdk": "^x.x.x", // ❌ TODO: Symphony SDK
    "@bancor/carbon-sdk": "^x.x.x", // ❌ TODO: Carbon SDK
    // Protocol-specific SDKs as needed
  }
}
```

### Node Registration
Update `package.json` n8n.nodes array to include all new nodes.

## Integration Points

- **sei-agent-kit-custom**: Import tool functions directly
- **Sei RPC**: Use existing RPC configuration from commons
- **Wallet Management**: Via credentials (private key)
- **Protocol SDKs**: Symphony, Carbon, Citrex APIs
- **ABI Management**: Load from sei-agent-kit-custom tools

## Step-by-Step Development Tasks

### Phase 1: Foundation & Trading (Week 1-2)
1. Create shared utilities (`protocolClients.ts`, `abiLoader.ts`, `tokenMaps.ts`)
2. Enhance credentials for protocol support
3. Build Symphony node (swap action)
4. Build Carbon node (createStrategy, updateStrategy, deleteStrategy, getStrategies actions)
5. Test trading nodes on Sei testnet

### Phase 2: Lending/Borrowing (Week 3-4)
6. Build Yei Finance node (supply, borrow, repay, withdraw, wrap, unwrap, getHealthFactor actions)
7. Build Takara Protocol node (mint, borrow, repay, redeem, query actions)
8. Test lending operations end-to-end
9. Create lending workflow templates

### Phase 3: Staking & Derivatives (Week 5-6)
10. Build Silo Finance node (stake, unstake actions)
11. Build Citrex node (all trading, account, and data query actions)
12. Test derivatives trading flows

### Phase 4: Bridge & Utilities (Week 7-8)
13. Build deBridge node (transfer action)
14. Build LiFi node (transfer action)
15. Build DexScreener node (getToken action)
16. Build ERC20 node (balance, transfer actions)
17. Build ERC721 node (balance, transfer, mint actions)

### Phase 5: Testing & Documentation (Week 9-10)
18. Integration testing with real protocols
19. Error handling improvements
20. Create workflow templates for each protocol
21. Write documentation and examples
22. Update package.json node registration
23. Publish/release

## Success Criteria

- [ ] 11 protocol-specific nodes implemented (one per protocol)
- [ ] All major Sei protocols covered (Yei, Takara, Symphony, Carbon, Citrex, Silo, DeBridge, LiFi, DexScreener, ERC20, ERC721)
- [ ] Each node supports multiple actions via action selection
- [ ] Trading workflows work end-to-end
- [ ] Lending/borrowing workflows work end-to-end
- [ ] Nodes follow consistent patterns (action selection pattern)
- [ ] Error handling is user-friendly
- [ ] Documentation and examples provided
- [ ] 5x workflow capability increase achieved

## Protocol-Specific Implementation Details

### Trading Protocols

#### Symphony
- **SDK**: `symphony-sdk/viem`
- **Key Functions**: `getRoute()`, `checkApproval()`, `giveApproval()`, `swap()`
- **Inputs**: Token addresses, amount, slippage
- **Outputs**: Transaction hash, route info

#### Carbon
- **SDK**: `@bancor/carbon-sdk`
- **Key Classes**: `Toolkit`, `ContractsApi`, `initSyncedCache`
- **Key Functions**: `createStrategy()`, `updateStrategy()`, `deleteStrategy()`
- **Inputs**: Strategy type, tokens, price ranges, budgets
- **Outputs**: Strategy ID, transaction hash


### Lending Protocols

#### Yei Finance
- **Approach**: Direct contract interaction via viem
- **Key Contracts**: Pool contract (check sei-agent-kit-custom for address)
- **ABIs**: Load from `tools/yei/abi/`
- **Token Map**: Load from `tools/yei/tokenMap.ts`
- **Key Functions**: `supply()`, `borrow()`, `repay()`, `withdraw()`, `wrap()`, `unwrap()`
- **Health Factor**: Query via `getYeiHealthFactor()`

#### Takara Protocol
- **Approach**: Direct contract interaction
- **Key Contracts**: Comptroller, tToken contracts
- **ABIs**: Load from `tools/takara/abi/`
- **Token Map**: Load from `tools/takara/tokenMap.ts`
- **Key Functions**: `mint()`, `borrow()`, `repay()`, `redeem()`, query functions

### Staking Protocols

#### Silo Finance
- **Approach**: Direct contract interaction
- **Key Functions**: `stakeBond()`, `unstakeBond()`
- **Inputs**: Bond type/ID, amount
- **Outputs**: Transaction hash

### Derivatives

#### Citrex
- **Approach**: REST API + contract interaction
- **Base URL**: Check citrex tools for API endpoint
- **Key Operations**: Order placement, cancellation, position management
- **Data Queries**: Orderbook, tickers, history via API
- **Account Operations**: Deposit, withdraw, health checks

## Notes for AI Agent

### Key Patterns to Follow

1. **Client Initialization**:
   - Always use `createProtocolClient()` from utils
   - Handle both testnet and mainnet
   - Support custom RPC endpoints

2. **Parameter Extraction**:
   - Use `this.getNodeParameter()` with proper types
   - Validate required parameters
   - Provide defaults where appropriate

3. **Error Handling**:
   - Wrap all operations in try-catch
   - Use `NodeOperationError` for user-facing errors
   - Log detailed errors for debugging

4. **Output Format**:
   - Always return consistent JSON structure
   - Include success/error status
   - Include transaction hash when applicable
   - Include timestamp and relevant metadata

5. **ABI Management**:
   - Load ABIs from sei-agent-kit-custom tools
   - Don't duplicate ABI definitions
   - Use shared ABI loader utility

6. **Token Handling**:
   - Support both addresses and symbols
   - Use token maps for symbol resolution
   - Handle decimals properly (parseUnits/formatUnits)

7. **Transaction Flow**:
   - Check approvals before contract calls
   - Wait for transaction receipts
   - Handle revert reasons gracefully

### Testing Strategy

1. **Unit Tests**: Test individual node functions
2. **Integration Tests**: Test with real protocols on testnet
3. **Workflow Tests**: Create sample n8n workflows for each protocol
4. **Error Scenarios**: Test insufficient balance, revert cases, etc.

### Documentation Requirements

1. **Node Documentation**: Description for each node in properties
2. **Workflow Examples**: Create sample workflows
3. **API Reference**: Document all node properties and outputs
4. **Troubleshooting**: Common errors and solutions

## File Organization

### Recommended Structure
- Group nodes by protocol category in subfolders
- Keep existing nodes in root `nodes/Sei/`
- Create protocol-specific subfolders:
  - `Trading/` - All trading-related nodes
  - `Lending/` - Lending/borrowing nodes
  - `Staking/` - Staking nodes
  - `Derivatives/` - Derivatives trading nodes
  - `Bridge/` - Cross-chain nodes
  - `Utility/` - Utility/data nodes

### SVG Icons
- Create or find icons for each protocol
- Use protocol logos/branding where possible
- Store in `nodes/Sei/[category]/` folders

## Dependencies to Research

1. **Symphony SDK**: Check npm package name and version
2. **Carbon SDK**: Check `@bancor/carbon-sdk` version compatibility
3. **Citrex API**: Research API documentation and endpoints
4. **Protocol Contract Addresses**: Verify addresses from sei-agent-kit-custom
5. **deBridge/LiFi SDKs**: Check if SDKs exist or use direct API calls

## Migration Notes

- Existing nodes (`SeiExplorer`, `SeiTxBuilder`, etc.) remain unchanged
- New protocol nodes are additive (backward compatible)
- **Architecture Change**: One node per protocol with action selection (instead of one node per action)
- All protocol interactions use action dropdown pattern similar to `SeiExplorer` node
- Consider version bump to 2.0.0 for major feature addition

## Node Organization Strategy

### Why One Node Per Protocol?

1. **Better UX**: Users select protocol once, then choose action (fewer nodes to find)
2. **Consistency**: All protocol interactions follow same pattern
3. **Maintainability**: Single file per protocol is easier to maintain
4. **Shared Logic**: Protocol-specific initialization code lives in one place
5. **Cleaner UI**: Less node clutter in n8n interface

### Action Selection Pattern

- Each protocol node has an `action` property (dropdown/options type)
- Properties shown/hidden based on selected action using `displayOptions`
- Switch statement in execute function routes to appropriate function
- Follows same pattern as existing `SeiExplorer` node

