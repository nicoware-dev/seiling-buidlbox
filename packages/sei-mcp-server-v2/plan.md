# SEI MCP Server V2 Upgrade Plan

## Package Overview
Upgrade `packages/sei-mcp-server` from v1.0.0 to v2.0.0+, incorporating all advanced protocol integrations, enhanced tooling, and new capabilities from the V2 example. This upgrade transforms the basic MCP server into a comprehensive toolkit for AI agents on Sei Network.

**Current Version**: 1.0.0  
**Target Version**: 2.0.0+  
**Stack**: TypeScript, Bun/Node.js, MCP SDK, Viem  
**Reference**: `v2/examples/sei-mcp-server-main/` (V2 implementation)

## Current State

### ✅ Completed (v1.0.0)
- Basic MCP server infrastructure
- HTTP/SSE transport support
- STDIO transport support
- Docker containerization
- **Core Blockchain Tools (27 tools)**:
  - Network information (get_supported_networks, get_chain_info, get_chain_id)
  - Balance operations (native, ERC20, ERC721, ERC1155)
  - Transaction operations (transfer_native, transfer_erc20, transfer_erc721, transfer_erc1155)
  - Block & transaction data (get_latest_block, get_block_by_number, get_transaction, get_transaction_receipt, wait_for_transaction)
  - Smart contracts (call_contract, deploy_contract, is_contract, get_code, get_storage_at)
  - Gas & fees (estimate_gas, get_gas_price, get_nonce)
  - Advanced (get_logs, simulate_transaction, get_address_from_private_key)
- Basic service layer (balance, blocks, contracts, tokens, transactions, transfer)
- Client-side private key security model

### ❌ Not Started (V2 Features)
- **Protocol Integrations**:
  - Citrex perpetual futures exchange
  - DragonSwap V3 DEX
  - OpenSea NFT marketplace
  - Yei Finance lending protocol
  - Symphony & Kame DEX aggregators
  - Li.Fi & deBridge cross-chain bridging
  
- **Token Deployment**:
  - ERC20 token deployment tools
  - ERC721 NFT deployment tools
  
- **Data & Analytics**:
  - SeiTrace Insights integration
  - CoinGecko market data
  - DexScreener analytics
  
- **Advanced Features**:
  - Hive Intelligence (natural language querying)
  - Protocol-specific ABIs
  - Enhanced tool organization (tools/ directory structure)
  - Multi-protocol SDK integrations

## Reference Implementation

### Primary Reference: sei-mcp-server-main (V2)
Location: `v2/examples/sei-mcp-server-main/`

**Key Features to Port**:

#### 1. Protocol Integrations
- **Citrex** (`src/core/services/citrex.ts`, `src/core/tools/citrex.ts`):
  - Advanced order execution (market, limit)
  - Order management (batch operations, cancel/replace)
  - Real-time market data (tickers, order books, klines)
  - Account management (deposit, withdraw, health checks)
  - Margin calculations
  
- **DragonSwap V3** (`src/core/services/dragonswap.ts`, `src/core/tools/dragonswap.ts`):
  - Token swaps (single/multi-hop)
  - Liquidity provision (add/remove)
  - Pool management (create, find, info)
  - Price & quote fetching
  - Position management
  
- **OpenSea** (`src/core/services/opensea.ts`, `src/core/tools/opensea.ts`):
  - NFT discovery and metadata
  - Collection analytics
  - Trading (listings, offers, buy)
  - Activity tracking
  - Order management
  
- **Yei Finance** (`src/core/services/yeifinance.ts`, `src/core/tools/yeifinance.ts`):
  - Lending & borrowing
  - Position management
  - Collateral control
  - Flash loans
  - Credit delegation
  
- **Symphony Aggregator** (`src/core/services/symphony.ts`, `src/core/tools/symphony.ts`):
  - Optimal trade routing
  - Swap execution
  - Token & approval management
  - SDK configuration
  - Offline transaction building
  
- **Kame Aggregator** (`src/core/services/kame_ag.ts`, `src/core/tools/kame_ag.ts`):
  - Aggregated swap quotes
  - Direct swap execution
  - Token & price discovery
  - Offline transaction building
  
- **Li.Fi Bridge** (`src/core/services/lifi.ts`, `src/core/tools/lifi.ts`):
  - Cross-chain swaps
  - Route discovery
  - Multi-bridge aggregation
  - Protocol discovery
  
- **deBridge** (`src/core/services/deBridge.ts`, `src/core/tools/deBridge.ts`):
  - Cross-chain transfers
  - Order creation & tracking
  - Order history
  - Order management

#### 2. Token Deployment
- **ERC20 Deployment** (`src/core/services/deployERC20.ts`, `src/core/tools/deployERC20.ts`):
  - Token creation with custom parameters
  - Contract verification
  - Supply management (minting)
  
- **ERC721 Deployment** (`src/core/services/deployERC721.ts`, `src/core/tools/deployERC721.ts`):
  - NFT collection creation
  - Contract verification
  - NFT minting (single/batch)

#### 3. Data & Analytics
- **SeiTrace** (`src/core/services/seitrace.ts`, `src/core/tools/seitrace.ts`):
  - Deep address analysis
  - Comprehensive token data
  - NFT inspection
  - Transaction history analysis
  
- **CoinGecko** (`src/core/services/coingecko.ts`, `src/core/tools/coingecko.ts`):
  - Real-time price data
  - Historical data
  - Token discovery
  - Trending assets
  
- **DexScreener** (`src/core/services/dexscreener.ts`, `src/core/tools/dexscreener.ts`):
  - Real-time pair data
  - Token & pair discovery
  - On-chain activity tracking

#### 4. Advanced Features
- **Hive Intelligence** (`src/core/services/hive_intelligence.ts`, `src/core/tools/hive_intelligence.ts`):
  - Natural language querying
  - Versatile data retrieval
  - Simplified interaction

#### 5. Protocol ABIs
Location: `src/core/services/abi/`
- aToken.ts (Yei Finance)
- debtToken.ts (Yei Finance)
- dragonSwapFactory.ts
- dragonSwapPool.ts
- dragonSwapPositionManager.ts
- dragonSwapQuoterV2.ts
- dragonSwapRouter.ts
- erc1155.ts
- erc20.ts
- erc721.ts
- wrappedSEI.ts
- yeiPool.ts
- yeiUiPoolDataProvider.ts
- yeiWrappedTokenGateway.ts

### Documentation
- See `docs/pillars/expanded-capabilities/mcp-v2.md` for v2 spec
- See `v2/examples/sei-mcp-server-main/README.md` for comprehensive feature list

## Architecture

### Current Structure (v1.0.0)
```
packages/sei-mcp-server/
├── src/
│   ├── core/
│   │   ├── chains.ts
│   │   ├── config.ts
│   │   ├── prompts.ts
│   │   ├── resources.ts
│   │   ├── services/
│   │   │   ├── balance.ts
│   │   │   ├── blocks.ts
│   │   │   ├── clients.ts
│   │   │   ├── contracts.ts
│   │   │   ├── index.ts
│   │   │   ├── tokens.ts
│   │   │   ├── transactions.ts
│   │   │   ├── transfer.ts
│   │   │   └── utils.ts
│   │   └── tools.ts (all tools in one file)
│   ├── server/
│   │   ├── http-server.ts
│   │   └── server.ts
│   └── index.ts
├── package.json (v1.0.0)
└── README.md
```

### Target Structure (v2.0.0+)
```
packages/sei-mcp-server/
├── src/
│   ├── core/
│   │   ├── chains.ts (✅ keep, may enhance)
│   │   ├── config.ts (✅ keep, may enhance)
│   │   ├── prompts.ts (✅ keep)
│   │   ├── resources.ts (✅ keep)
│   │   ├── services/
│   │   │   ├── abi/ (❌ TODO: Add all protocol ABIs)
│   │   │   │   ├── aToken.ts
│   │   │   │   ├── debtToken.ts
│   │   │   │   ├── dragonSwapFactory.ts
│   │   │   │   ├── dragonSwapPool.ts
│   │   │   │   ├── dragonSwapPositionManager.ts
│   │   │   │   ├── dragonSwapQuoterV2.ts
│   │   │   │   ├── dragonSwapRouter.ts
│   │   │   │   ├── erc1155.ts
│   │   │   │   ├── erc20.ts
│   │   │   │   ├── erc721.ts
│   │   │   │   ├── wrappedSEI.ts
│   │   │   │   ├── yeiPool.ts
│   │   │   │   ├── yeiUiPoolDataProvider.ts
│   │   │   │   └── yeiWrappedTokenGateway.ts
│   │   │   ├── balance.ts (✅ keep)
│   │   │   ├── blocks.ts (✅ keep)
│   │   │   ├── citrex.ts (❌ TODO)
│   │   │   ├── clients.ts (✅ keep, may enhance)
│   │   │   ├── coingecko.ts (❌ TODO)
│   │   │   ├── contracts.ts (✅ keep)
│   │   │   ├── deBridge.ts (❌ TODO)
│   │   │   ├── deployERC20.ts (❌ TODO)
│   │   │   ├── deployERC721.ts (❌ TODO)
│   │   │   ├── dexscreener.ts (❌ TODO)
│   │   │   ├── dragonswap.ts (❌ TODO)
│   │   │   ├── hive_intelligence.ts (❌ TODO)
│   │   │   ├── index.ts (✅ keep, update exports)
│   │   │   ├── kame_ag.ts (❌ TODO)
│   │   │   ├── lifi.ts (❌ TODO)
│   │   │   ├── opensea.ts (❌ TODO)
│   │   │   ├── seitrace.ts (❌ TODO)
│   │   │   ├── symphony.ts (❌ TODO)
│   │   │   ├── tokens.ts (✅ keep)
│   │   │   ├── transactions.ts (✅ keep)
│   │   │   ├── transfer.ts (✅ keep)
│   │   │   ├── utils.ts (✅ keep)
│   │   │   ├── wrappedSei.ts (❌ TODO: may be in tokens.ts)
│   │   │   └── yeifinance.ts (❌ TODO)
│   │   └── tools/ (❌ TODO: New modular structure)
│   │       ├── index.ts (register all tools)
│   │       ├── network.ts (network tools)
│   │       ├── token.ts (token tools)
│   │       ├── citrex.ts
│   │       ├── coingecko.ts
│   │       ├── deBridge.ts
│   │       ├── deployERC20.ts
│   │       ├── deployERC721.ts
│   │       ├── dexscreener.ts
│   │       ├── dragonswap.ts
│   │       ├── hive_intelligence.ts
│   │       ├── kame_ag.ts
│   │       ├── lifi.ts
│   │       ├── opensea.ts
│   │       ├── seitrace.ts
│   │       ├── symphony.ts
│   │       └── yeifinance.ts
│   ├── server/
│   │   ├── http-server.ts (✅ keep, may enhance)
│   │   └── server.ts (✅ keep, update to use new tools/)
│   └── index.ts (✅ keep)
├── package.json (❌ TODO: Update dependencies, version)
└── README.md (❌ TODO: Update with V2 features)
```

## Core Upgrades to Implement

### Phase 1: Foundation & Organization (Week 1)

#### 1. Restructure Tools Directory
- **Current**: All tools in `src/core/tools.ts` (monolithic)
- **Target**: Modular structure in `src/core/tools/` directory
- **Tasks**:
  - Create `src/core/tools/` directory
  - Extract existing tools into separate files (`network.ts`, `token.ts`)
  - Create `src/core/tools/index.ts` to register all tools
  - Update `src/server/server.ts` to use new structure
  - Ensure backward compatibility

#### 2. Add Protocol ABIs
- **Location**: `src/core/services/abi/`
- **Tasks**:
  - Port all ABIs from V2 example
  - Organize by protocol (Yei, DragonSwap, etc.)
  - Ensure type safety with TypeScript

#### 3. Update Dependencies
- **Current Package.json**: Basic dependencies
- **Target**: Add protocol SDKs
- **Dependencies to Add**:
  ```json
  {
    "@kame-ag/aggregator-sdk": "^1.0.4",
    "@lifi/sdk": "^3.9.2",
    "citrex-sdk": "^1.2.2",
    "opensea-js": "^7.2.1",
    "symphony-sdk": "^2.4.8"
  }
  ```
- **Tasks**:
  - Update `package.json`
  - Run `bun install` or `npm install`
  - Update version to 2.0.0

### Phase 2: Protocol Integrations (Weeks 2-4)

#### 4. Citrex Integration
- **Files**: `services/citrex.ts`, `tools/citrex.ts`
- **Features**:
  - Order placement (market, limit, batch)
  - Order management (cancel, replace, list)
  - Market data (tickers, order books, klines)
  - Account management (deposit, withdraw, health)
  - Margin calculations
- **SDK**: `citrex-sdk`

#### 5. DragonSwap V3 Integration
- **Files**: `services/dragonswap.ts`, `tools/dragonswap.ts`
- **Features**:
  - Token swaps (single/multi-hop)
  - Liquidity provision
  - Pool management
  - Price quotes
  - Position management
- **ABIs**: dragonSwapRouter, dragonSwapPool, dragonSwapFactory, etc.

#### 6. OpenSea Integration
- **Files**: `services/opensea.ts`, `tools/opensea.ts`
- **Features**:
  - NFT discovery
  - Collection analytics
  - Trading (listings, offers, buy)
  - Activity tracking
- **SDK**: `opensea-js`

#### 7. Yei Finance Integration
- **Files**: `services/yeifinance.ts`, `tools/yeifinance.ts`
- **Features**:
  - Supply/borrow
  - Position management
  - Collateral control
  - Flash loans
  - Credit delegation
- **ABIs**: aToken, debtToken, yeiPool, etc.

#### 8. Symphony & Kame Aggregators
- **Files**: `services/symphony.ts`, `tools/symphony.ts`, `services/kame_ag.ts`, `tools/kame_ag.ts`
- **Features**:
  - Optimal routing
  - Swap execution
  - Token discovery
  - Offline transaction building
- **SDKs**: `symphony-sdk`, `@kame-ag/aggregator-sdk`

#### 9. Cross-Chain Bridges (Li.Fi & deBridge)
- **Files**: `services/lifi.ts`, `tools/lifi.ts`, `services/deBridge.ts`, `tools/deBridge.ts`
- **Features**:
  - Cross-chain transfers
  - Route discovery
  - Order tracking
  - Multi-bridge aggregation
- **SDKs**: `@lifi/sdk`, deBridge SDK (if available)

### Phase 3: Token Deployment (Week 5)

#### 10. ERC20 Deployment
- **Files**: `services/deployERC20.ts`, `tools/deployERC20.ts`
- **Features**:
  - Token creation
  - Contract verification
  - Supply management
- **ABIs**: erc20.ts

#### 11. ERC721 Deployment
- **Files**: `services/deployERC721.ts`, `tools/deployERC721.ts`
- **Features**:
  - Collection creation
  - Contract verification
  - NFT minting
- **ABIs**: erc721.ts

### Phase 4: Data & Analytics (Week 6)

#### 12. SeiTrace Integration
- **Files**: `services/seitrace.ts`, `tools/seitrace.ts`
- **Features**:
  - Address analysis
  - Token data
  - NFT inspection
  - Transaction history
- **API**: SeiTrace Insights API

#### 13. CoinGecko Integration
- **Files**: `services/coingecko.ts`, `tools/coingecko.ts`
- **Features**:
  - Real-time prices
  - Historical data
  - Token discovery
- **API**: CoinGecko API (Pro API key optional)

#### 14. DexScreener Integration
- **Files**: `services/dexscreener.ts`, `tools/dexscreener.ts`
- **Features**:
  - Pair data
  - Token discovery
  - Activity tracking
- **API**: DexScreener API

### Phase 5: Advanced Features (Week 7)

#### 15. Hive Intelligence
- **Files**: `services/hive_intelligence.ts`, `tools/hive_intelligence.ts`
- **Features**:
  - Natural language querying
  - Versatile data retrieval
  - Simplified interaction
- **API**: Hive Intelligence API (API key required)

#### 16. Wrapped SEI Service
- **Files**: `services/wrappedSei.ts` (or integrate into tokens.ts)
- **Features**:
  - Wrap SEI to WSEI
  - Unwrap WSEI to SEI
- **ABIs**: wrappedSEI.ts

### Phase 6: Documentation & Testing (Week 8)

#### 17. Update Documentation
- **Tasks**:
  - Update README.md with all V2 features
  - Document all new tools
  - Update API reference
  - Add usage examples
  - Document environment variables
  - Create migration guide from v1 to v2

#### 18. Testing & Validation
- **Tasks**:
  - Test all protocol integrations
  - Test token deployment flows
  - Validate backward compatibility
  - Test cross-chain operations
  - Performance testing
  - Integration testing

## Package.json Updates

### Dependencies to Add
```json
{
  "dependencies": {
    "@kame-ag/aggregator-sdk": "^1.0.4",
    "@lifi/sdk": "^3.9.2",
    "citrex-sdk": "^1.2.2",
    "opensea-js": "^7.2.1",
    "symphony-sdk": "^2.4.8"
  }
}
```

### Version Update
- Update version from `1.0.0` to `2.0.0` (or `2.0.1` to match example)

### Scripts
- Keep existing scripts
- Ensure build scripts work with new structure

## Environment Variables

### New Variables Needed
```bash
# Optional API Keys for enhanced features
COINGECKO_PRO_API_KEY=your_coingecko_pro_api_key_here
SEITRACE_API_KEY=your_seitrace_api_key_here
OPENSEA_API_KEY=your_opensea_api_key_here
HIVE_INTELLIGENCE_API_KEY=your_hive_intelligence_api_key_here

# MCP v2 Features (future)
ENABLE_MCP_V2=yes
SESSION_SECRET=your_session_secret_here
```

### Existing Variables
```bash
PRIVATE_KEY=your_private_key_here  # Still required for transactions
```

## Integration Points

- **Protocol SDKs**: Symphony, Kame, Citrex, OpenSea, Li.Fi
- **ABI Management**: Protocol-specific ABIs in `services/abi/`
- **Service Layer**: All protocol logic in `services/` directory
- **Tool Layer**: Tool registration in `tools/` directory
- **MCP Server**: Main server in `server/server.ts`

## Step-by-Step Development Tasks

### Phase 1: Foundation (Week 1)
1. ✅ Review V2 example code structure
2. ❌ Create `src/core/tools/` directory structure
3. ❌ Extract existing tools into modular files
4. ❌ Create `tools/index.ts` to register all tools
5. ❌ Update `server/server.ts` to use new structure
6. ❌ Port all protocol ABIs to `services/abi/`
7. ❌ Update `package.json` dependencies
8. ❌ Test backward compatibility

### Phase 2: Protocol Integrations Part 1 (Week 2)
9. ❌ Implement Citrex service and tools
10. ❌ Implement DragonSwap service and tools
11. ❌ Test Citrex integration
12. ❌ Test DragonSwap integration

### Phase 3: Protocol Integrations Part 2 (Week 3)
13. ❌ Implement OpenSea service and tools
14. ❌ Implement Yei Finance service and tools
15. ❌ Test OpenSea integration
16. ❌ Test Yei Finance integration

### Phase 4: Protocol Integrations Part 3 (Week 4)
17. ❌ Implement Symphony aggregator service and tools
18. ❌ Implement Kame aggregator service and tools
19. ❌ Implement Li.Fi bridge service and tools
20. ❌ Implement deBridge service and tools
21. ❌ Test all aggregator/bridge integrations

### Phase 5: Token Deployment (Week 5)
22. ❌ Implement ERC20 deployment service and tools
23. ❌ Implement ERC721 deployment service and tools
24. ❌ Test token deployment flows

### Phase 6: Data & Analytics (Week 6)
25. ❌ Implement SeiTrace service and tools
26. ❌ Implement CoinGecko service and tools
27. ❌ Implement DexScreener service and tools
28. ❌ Test data integrations

### Phase 7: Advanced Features (Week 7)
29. ❌ Implement Hive Intelligence service and tools
30. ❌ Implement/update Wrapped SEI service
31. ❌ Test advanced features

### Phase 8: Documentation & Testing (Week 8)
32. ❌ Update README.md with all V2 features
33. ❌ Document all new tools and APIs
34. ❌ Create migration guide
35. ❌ Comprehensive testing
36. ❌ Update Docker configuration if needed
37. ❌ Release v2.0.0

## Success Criteria

- [ ] All V2 protocol integrations implemented
- [ ] Modular tool structure in place
- [ ] All protocol ABIs ported
- [ ] Token deployment tools working
- [ ] Data & analytics integrations functional
- [ ] Hive Intelligence working
- [ ] Backward compatibility maintained
- [ ] All tools tested and validated
- [ ] Documentation updated
- [ ] Package version bumped to 2.0.0+
- [ ] Ready for production use

## Protocol-Specific Implementation Details

### Citrex
- **SDK**: `citrex-sdk`
- **Key Features**: Order management, market data, account health
- **Environment**: Mainnet/Testnet configuration

### DragonSwap V3
- **Approach**: Direct contract interaction via ABIs
- **Key Contracts**: Router, Pool, Factory, PositionManager, QuoterV2
- **Features**: Swaps, liquidity, pools

### OpenSea
- **SDK**: `opensea-js`
- **Key Features**: NFT discovery, trading, analytics
- **API Key**: Required for full functionality

### Yei Finance
- **Approach**: Direct contract interaction via ABIs
- **Key Contracts**: Pool, aToken, debtToken, WrappedTokenGateway
- **Features**: Lending, borrowing, flash loans

### Symphony & Kame
- **SDKs**: `symphony-sdk`, `@kame-ag/aggregator-sdk`
- **Key Features**: Aggregated swaps, routing, offline tx building

### Li.Fi & deBridge
- **SDKs**: `@lifi/sdk`, deBridge SDK
- **Key Features**: Cross-chain transfers, route discovery, order tracking

## Notes for AI Agent

### Key Patterns to Follow

1. **Service-Tool Separation**:
   - All business logic in `services/` directory
   - Tool registration in `tools/` directory
   - Services should be reusable and testable

2. **ABI Management**:
   - All ABIs in `services/abi/` directory
   - Export ABIs from service files
   - Use TypeScript types for type safety

3. **Error Handling**:
   - Consistent error handling across all services
   - User-friendly error messages
   - Proper error propagation to MCP tools

4. **Configuration**:
   - Environment variables for API keys
   - Default values where appropriate
   - Clear documentation of required vs optional

5. **Tool Registration**:
   - Use `server.tool()` method from MCP SDK
   - Provide clear descriptions
   - Use Zod schemas for parameter validation
   - Return proper MCP response format

6. **Backward Compatibility**:
   - Existing tools must continue working
   - Don't break existing API contracts
   - Version migration should be smooth

### Testing Strategy

1. **Unit Tests**: Test individual services
2. **Integration Tests**: Test protocol integrations with mock data
3. **E2E Tests**: Test full workflows with real protocols (testnet)
4. **Backward Compatibility Tests**: Ensure v1 tools still work

### Documentation Requirements

1. **README**: Comprehensive feature list, installation, usage
2. **API Reference**: All tools documented with parameters
3. **Migration Guide**: How to migrate from v1 to v2
4. **Examples**: Usage examples for each protocol
5. **Environment Variables**: Clear documentation of all variables

## Migration Notes

- **Backward Compatibility**: All v1.0.0 tools must continue working
- **New Features**: All V2 features are additive
- **Breaking Changes**: None planned (pure additive upgrade)
- **Docker**: May need to update Docker image tag
- **Configuration**: New environment variables are optional

## File Organization

### Tools Directory Structure
- `tools/index.ts` - Main registration function
- `tools/network.ts` - Network-related tools (existing)
- `tools/token.ts` - Token-related tools (existing)
- `tools/[protocol].ts` - One file per protocol

### Services Directory Structure
- `services/[service].ts` - One service file per protocol/feature
- `services/abi/[protocol]/` - Protocol-specific ABIs
- `services/index.ts` - Export all services

## Dependencies to Research

1. **Citrex SDK**: Verify npm package and version
2. **deBridge SDK**: Check if SDK exists or use direct API
3. **Protocol Contract Addresses**: Verify Sei deployment addresses
4. **API Endpoints**: Verify all API endpoints are correct
5. **SDK Compatibility**: Ensure SDKs work with Sei network

## Known Challenges

1. **API Keys**: Some features require API keys (optional but recommended)
2. **Network Support**: Ensure all protocols support Sei mainnet/testnet
3. **SDK Compatibility**: Verify SDKs work with Sei's EVM compatibility
4. **Testing**: Need testnet accounts and tokens for integration testing
5. **Documentation**: Large amount of new features to document

## Future Enhancements (Post-v2.0)

1. **MCP v2 Protocol Features**:
   - Multi-session support
   - Cross-chain tool chaining
   - Persistent context
   - IBC support

2. **Additional Protocols**:
   - More Sei-native protocols as they launch
   - Additional bridges if needed

3. **Performance**:
   - Caching for API calls
   - Rate limiting
   - Batch operations optimization

