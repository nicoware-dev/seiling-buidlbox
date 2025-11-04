# SEI MCP Server V2 - Complete Features Documentation

This document provides comprehensive documentation for all features and protocol integrations in SEI MCP Server V2.

## Table of Contents

1. [Core Blockchain Tools](#core-blockchain-tools)
2. [Token Operations](#token-operations)
3. [NFT Operations](#nft-operations)
4. [DragonSwap V3 DEX](#dragonswap-v3-dex)
5. [Citrex Perpetual Futures Exchange](#citrex-perpetual-futures-exchange)
6. [Yei Finance Lending Protocol](#yei-finance-lending-protocol)
7. [OpenSea NFT Marketplace](#opensea-nft-marketplace)
8. [Symphony DEX Aggregator](#symphony-dex-aggregator)
9. [Kame DEX Aggregator](#kame-dex-aggregator)
10. [Li.Fi Cross-Chain Bridge](#lifi-cross-chain-bridge)
11. [deBridge Cross-Chain Bridge](#debridge-cross-chain-bridge)
12. [Token Deployment](#token-deployment)
13. [Data & Analytics Services](#data--analytics-services)
14. [Hive Intelligence](#hive-intelligence)

---

## Core Blockchain Tools

### Network Information Tools

**`get_chain_info`**
- **Purpose**: Get comprehensive information about a Sei network
- **Parameters**:
  - `network` (optional): Network name or chain ID (default: Sei mainnet)
- **Returns**: Network name, chain ID, current block number, and RPC URL
- **Example**:
  ```
  "Get information about Sei mainnet"
  ```
  Returns: `{ network: "sei", chainId: 1329, blockNumber: "12345", rpcUrl: "..." }`

**`get_supported_networks`**
- **Purpose**: List all supported Sei networks
- **Returns**: Array of supported network names
- **Example**: Returns `["sei", "sei-testnet", "sei-devnet"]`

### Block & Transaction Tools

**`get_block_by_number`**
- **Purpose**: Retrieve block data by block number
- **Parameters**:
  - `blockNumber` (required): The block number to fetch
  - `network` (optional): Network name or chain ID
- **Returns**: Complete block data including transactions, timestamp, gas used, etc.

**`get_latest_block`**
- **Purpose**: Get the most recent block from the chain
- **Parameters**: `network` (optional)
- **Returns**: Latest block information

**`get_transaction`**
- **Purpose**: Get detailed transaction information
- **Parameters**:
  - `txHash` (required): Transaction hash (0x...)
  - `network` (optional)
- **Returns**: Transaction details including from/to addresses, value, data, gas, etc.

**`get_transaction_receipt`**
- **Purpose**: Get transaction receipt with execution status and logs
- **Parameters**: `txHash`, `network` (optional)
- **Returns**: Receipt with status, gas used, logs, and contract address (if contract creation)

**`estimate_gas`**
- **Purpose**: Estimate gas cost for a transaction before execution
- **Parameters**:
  - `to` (required): Recipient address
  - `value` (optional): Amount of SEI to send
  - `data` (optional): Transaction data (hex string)
  - `network` (optional)
- **Returns**: Estimated gas amount

### Smart Contract Tools

**`read_contract`**
- **Purpose**: Read data from a smart contract (view/pure functions)
- **Parameters**:
  - `contractAddress` (required): Contract address
  - `abi` (required): Contract ABI as JSON array
  - `functionName` (required): Function name to call
  - `args` (optional): Function arguments array
  - `network` (optional)
- **Returns**: Function return value
- **Example**: Read token balance, check allowance, get token metadata

**`write_contract`**
- **Purpose**: Execute state-changing contract functions (requires signing)
- **Parameters**: Same as `read_contract`, but `args` is required
- **Returns**: Transaction hash
- **Example**: Transfer tokens, approve spending, call DeFi protocol functions

**`is_contract`**
- **Purpose**: Check if an address is a smart contract or EOA
- **Parameters**: `address`, `network` (optional)
- **Returns**: Boolean indicating if address is a contract

---

## Token Operations

### Native SEI Operations

**`get_balance`**
- **Purpose**: Get native SEI balance for an address
- **Parameters**: `address`, `network` (optional)
- **Returns**: Balance in both wei and SEI (formatted)

**`transfer_sei`**
- **Purpose**: Transfer native SEI tokens to another address
- **Parameters**:
  - `to` (required): Recipient address
  - `amount` (required): Amount in SEI (e.g., "0.1")
  - `network` (optional)
- **Returns**: Transaction hash
- **Note**: Requires PRIVATE_KEY environment variable

### ERC20 Token Operations

**`get_token_info`**
- **Purpose**: Get comprehensive ERC20 token metadata
- **Parameters**: `tokenAddress`, `network` (optional)
- **Returns**: Token name, symbol, decimals, total supply, contract address

**`get_erc20_balance` / `get_token_balance`**
- **Purpose**: Get ERC20 token balance for an address
- **Parameters**: `address`, `tokenAddress`, `network` (optional)
- **Returns**: Balance in raw format and human-readable format with token info

**`transfer_erc20` / `transfer_token`**
- **Purpose**: Transfer ERC20 tokens between addresses
- **Parameters**:
  - `tokenAddress`: ERC20 contract address
  - `toAddress`: Recipient address
  - `amount`: Amount in token units (will be adjusted for decimals)
  - `network` (optional)
- **Returns**: Transaction hash and transfer details

**`approve_token_spending`**
- **Purpose**: Approve another address to spend your tokens (required before DeFi interactions)
- **Parameters**:
  - `tokenAddress`: Token contract address
  - `spenderAddress`: Address to approve (e.g., DEX router)
  - `amount`: Amount to approve (use large number for unlimited)
  - `network` (optional)
- **Returns**: Transaction hash
- **Example**: Approve DragonSwap router to spend USDC before swapping

### Wrapped SEI Operations

**`wrap_sei_directly`**
- **Purpose**: Wrap native SEI into WSEI (Wrapped SEI) token
- **Parameters**:
  - `wrappedSeiAddress`: WSEI contract address
  - `amount`: Amount of SEI to wrap
  - `network` (optional)
- **Returns**: Transaction hash
- **Use Case**: Wrap SEI to use in DeFi protocols that require ERC20 tokens

**`unwrap_sei_directly`**
- **Purpose**: Unwrap WSEI back to native SEI
- **Parameters**: `wrappedSeiAddress`, `amount`, `network` (optional)
- **Returns**: Transaction hash

---

## NFT Operations

### ERC721 (NFT) Operations

**`get_nft_info`**
- **Purpose**: Get detailed information about a specific NFT
- **Parameters**:
  - `tokenAddress`: NFT collection contract address
  - `tokenId`: Specific token ID
  - `network` (optional)
- **Returns**: Collection name, symbol, token URI, metadata, and current owner

**`get_nft_balance`**
- **Purpose**: Get total number of NFTs owned from a specific collection
- **Parameters**: `tokenAddress`, `ownerAddress`, `network` (optional)
- **Returns**: Count of NFTs owned

**`check_nft_ownership`**
- **Purpose**: Verify if an address owns a specific NFT
- **Parameters**: `tokenAddress`, `tokenId`, `ownerAddress`, `network` (optional)
- **Returns**: Boolean ownership status

**`transfer_nft`**
- **Purpose**: Transfer an ERC721 NFT to another address
- **Parameters**:
  - `tokenAddress`: NFT collection address
  - `tokenId`: Token ID to transfer
  - `toAddress`: Recipient address
  - `network` (optional)
- **Returns**: Transaction hash and transfer details

### ERC1155 (Multi-Token) Operations

**`get_erc1155_balance`**
- **Purpose**: Get balance of a specific ERC1155 token ID
- **Parameters**: `tokenAddress`, `tokenId`, `ownerAddress`, `network` (optional)
- **Returns**: Balance amount (can be > 1 for fungible tokens)

**`get_erc1155_token_uri`**
- **Purpose**: Get metadata URI for an ERC1155 token
- **Parameters**: `tokenAddress`, `tokenId`, `network` (optional)
- **Returns**: Token URI (typically IPFS or HTTP URL)

**`transfer_erc1155`**
- **Purpose**: Transfer ERC1155 tokens (fungible or NFT)
- **Parameters**:
  - `tokenAddress`: ERC1155 contract address
  - `tokenId`: Token ID to transfer
  - `amount`: Quantity to transfer
  - `toAddress`: Recipient address
  - `network` (optional)
- **Returns**: Transaction hash

---

## DragonSwap V3 DEX

DragonSwap is a Uniswap V3-style DEX on Sei, providing concentrated liquidity and efficient token swaps.

### Getting Started

DragonSwap uses fee tiers (0.01%, 0.05%, 0.3%, 1%) and requires pool addresses for operations. Common addresses:
- Factory: `0x...` (check chains.ts or DragonSwap docs)
- Router: `0x...`
- QuoterV2: `0x...`
- Position Manager: `0x...`

### Swap Operations

**`dragonswap_get_swap_quote`**
- **Purpose**: Get a quote for a single-hop token swap
- **Parameters**:
  - `quoterAddress`: DragonSwap QuoterV2 contract address
  - `amountIn`: Input amount (human-readable, e.g., "100")
  - `tokenIn`: Input token address
  - `tokenOut`: Output token address
  - `fee`: Pool fee tier (500 = 0.05%, 3000 = 0.3%, etc.)
- **Returns**: Amount out, gas estimate, and swap path
- **How It Works**: Queries the QuoterV2 contract to simulate the swap and return expected output
- **Example**:
  ```
  Quote swapping 100 USDC to SEI
  - tokenIn: USDC address
  - tokenOut: SEI/WSEI address
  - fee: 3000 (0.3% pool)
  ```

**`dragonswap_get_multi_hop_swap_quote`**
- **Purpose**: Get quote for multi-hop swaps (tokenA → tokenB → tokenC)
- **Parameters**:
  - `quoterAddress`: QuoterV2 contract
  - `amountIn`: Input amount
  - `path`: Encoded path (token addresses + fees)
- **Returns**: Output amount and gas estimate
- **Use Case**: Swapping tokens that don't have direct liquidity pools

**`dragonswap_get_optimal_swap_route`**
- **Purpose**: Automatically find the best route (direct or multi-hop)
- **Parameters**: `quoterAddress`, `tokenIn`, `tokenOut`, `amountIn`
- **Returns**: Best route with highest output amount
- **How It Works**: Compares all available routes and selects the one with best price

**`dragonswap_execute_swap`**
- **Purpose**: Execute a single-hop token swap
- **Parameters**:
  - `routerAddress`: DragonSwap Router contract
  - `tokenIn`: Input token address
  - `tokenOut`: Output token address
  - `amountIn`: Amount to swap
  - `amountOutMinimum`: Minimum acceptable output (for slippage protection)
  - `recipient`: Address to receive output tokens
  - `fee`: Pool fee tier
- **Returns**: Transaction hash
- **Prerequisites**: 
  1. Approve router to spend input token (`approve_token_spending`)
  2. Ensure sufficient token balance
- **Example Workflow**:
  1. Get quote to determine expected output
  2. Approve router for input token
  3. Execute swap with 0.5% slippage tolerance

**`dragonswap_execute_multi_hop_swap`**
- **Purpose**: Execute multi-hop swap through encoded path
- **Parameters**: `routerAddress`, `path`, `amountIn`, `amountOutMinimum`, `recipient`
- **Returns**: Transaction hash
- **Use Case**: Swapping tokens that require intermediate hops for better price

### Liquidity Provision

**`dragonswap_add_liquidity`**
- **Purpose**: Add liquidity to a V3 pool within a price range
- **Parameters**:
  - `positionManagerAddress`: Position Manager contract
  - `token0`, `token1`: Token addresses (sorted)
  - `fee`: Pool fee tier
  - `tickLower`, `tickUpper`: Price range boundaries
  - `amount0Desired`, `amount1Desired`: Desired amounts
  - `amount0Min`, `amount1Min`: Minimum amounts (slippage protection)
  - `recipient`: Address to receive position NFT
- **Returns**: Transaction hash, actual amounts added
- **How It Works**: 
  - V3 uses concentrated liquidity with price ranges
  - You receive an NFT representing your position
  - Liquidity earns trading fees from swaps in your range
- **Example**: Provide liquidity for USDC/SEI pair between $0.99-$1.01

**`dragonswap_remove_liquidity`**
- **Purpose**: Remove liquidity from a position
- **Parameters**:
  - `positionManagerAddress`: Position Manager
  - `tokenId`: Position NFT token ID
  - `liquidity`: Amount of liquidity to remove (0 to remove all)
  - `amount0Min`, `amount1Min`: Minimum amounts out
- **Returns**: Transaction hash
- **Note**: Burns or reduces the position NFT

**`dragonswap_collect_fees`**
- **Purpose**: Collect accrued trading fees from a liquidity position
- **Parameters**: `positionManagerAddress`, `tokenId`, `recipient`
- **Returns**: Transaction hash
- **Use Case**: Withdraw fees earned from providing liquidity

**`dragonswap_get_position_info`**
- **Purpose**: Get detailed information about a liquidity position
- **Parameters**: `positionManagerAddress`, `tokenId`
- **Returns**: Tokens, amounts, fee tier, price range, fees earned

### Pool Management

**`dragonswap_get_token_price`**
- **Purpose**: Get current token price from a pool
- **Parameters**: `poolAddress`, `tokenAddress`
- **Returns**: Price, liquidity, fee tier, tick

**`dragonswap_get_pool_address`**
- **Purpose**: Find existing pool address for a token pair
- **Parameters**: `factoryAddress`, `tokenA`, `tokenB`, `fee`
- **Returns**: Pool contract address (or null if doesn't exist)

**`dragonswap_create_pool`**
- **Purpose**: Create a new liquidity pool
- **Parameters**: `factoryAddress`, `tokenA`, `tokenB`, `fee`
- **Returns**: Transaction hash (pool creation)
- **Use Case**: Launching new token pairs

**`dragonswap_get_pool_info`**
- **Purpose**: Get comprehensive pool information
- **Parameters**: `poolAddress`
- **Returns**: Tokens, fee, liquidity, current price, tick spacing

---

## Citrex Perpetual Futures Exchange

Citrex is a perpetual futures exchange on Sei. Users can trade perpetual contracts with leverage.

### Setup

Requires `PRIVATE_KEY` environment variable. Citrex SDK initializes automatically on server start.

### Market Data Tools

**`citrex_get_tickers`**
- **Purpose**: Get ticker information for markets
- **Parameters**: `symbol` (optional): Market symbol (e.g., "BTCperp") or omit for all markets
- **Returns**: Price, 24h volume, funding rate, open interest
- **Example**: Get all market tickers or specific market like "SEIperp"

**`citrex_get_product`**
- **Purpose**: Get product information by ID or symbol
- **Parameters**: `identifier`: Numeric ID or symbol string
- **Returns**: Product details including fees, min/max quantities, mark price

**`citrex_get_products`**
- **Purpose**: Get all available products with parsed mark prices
- **Returns**: Array of all products with human-readable prices

**`citrex_get_order_book`**
- **Purpose**: Get order book (bids and asks) for a market
- **Parameters**: `symbol`: Market symbol (e.g., "SEIperp")
- **Returns**: Bids, asks, with price and quantity levels

**`citrex_get_klines`**
- **Purpose**: Get historical candlestick (OHLCV) data
- **Parameters**:
  - `productSymbol`: Market symbol
  - `optionalArgs`: { startTime, endTime, limit }
- **Returns**: Array of candlestick data points

**`citrex_get_trade_history`**
- **Purpose**: Get recent trades for a market
- **Parameters**: `productSymbol`, `quantity` (optional, default: 10)
- **Returns**: Recent trades with price, quantity, side

### Account Management

**`citrex_get_account_health`**
- **Purpose**: Get account health and margin information
- **Returns**: Margin ratio, collateral, positions, liquidation price

**`citrex_list_balances`**
- **Purpose**: Get all asset balances in your Citrex account
- **Returns**: Balances for each supported asset

**`citrex_deposit`**
- **Purpose**: Deposit funds to Citrex account
- **Parameters**: `amount`: Amount in base units
- **Returns**: Transaction hash on success
- **How It Works**: Transfers funds from your wallet to Citrex account contract

**`citrex_withdraw`**
- **Purpose**: Withdraw funds from Citrex account
- **Parameters**: `amount`: Amount to withdraw
- **Returns**: Success confirmation
- **Note**: Subject to account health requirements

### Trading Tools

**`citrex_place_order`**
- **Purpose**: Place a new order (market or limit)
- **Parameters** (`orderArgs` object):
  - `isBuy`: true for long, false for short
  - `price`: Order price
  - `productId`: Product numeric ID
  - `quantity`: Order size
  - `orderType`: OrderType enum (MARKET, LIMIT)
  - `timeInForce`: FOK, IOC, GTC, etc.
  - `expiration`: Order expiration timestamp
  - `slippage`: Slippage tolerance for market orders
- **Returns**: Order ID and placement confirmation
- **Example**:
  ```
  Place market buy order for 10 SEIperp contracts
  - isBuy: true
  - orderType: MARKET
  - productId: 1004
  - quantity: 10
  ```

**`citrex_place_orders`**
- **Purpose**: Place multiple orders in one transaction
- **Parameters**: `ordersArgs`: Array of order argument objects
- **Returns**: Array of order placement results
- **Use Case**: Batch orders for efficiency

**`citrex_list_open_orders`**
- **Purpose**: List your open orders
- **Parameters**: `productSymbol` (optional): Filter by market
- **Returns**: Array of open orders with details

**`citrex_cancel_order`**
- **Purpose**: Cancel a specific order
- **Parameters**: `orderId`, `productId`
- **Returns**: Cancellation confirmation

**`citrex_cancel_orders`**
- **Purpose**: Cancel multiple orders atomically
- **Parameters**: `ordersArgs`: Array of [orderId, productId] tuples
- **Returns**: Cancellation results

**`citrex_cancel_and_replace_order`**
- **Purpose**: Atomically cancel and replace an order
- **Parameters**: `orderId`, `orderArgs` (new order parameters)
- **Returns**: New order placement result
- **Use Case**: Update order price or quantity without losing queue position

**`citrex_cancel_open_orders_for_product`**
- **Purpose**: Cancel all orders for a specific market
- **Parameters**: `productId`
- **Returns**: Cancellation result
- **Use Case**: Emergency close all positions in a market

**`citrex_calculate_margin_requirement`**
- **Purpose**: Calculate margin needed for a potential trade
- **Parameters**: `isBuy`, `price`, `productId`, `quantity`
- **Returns**: Required margin amount
- **Use Case**: Check if you have sufficient margin before placing order

### Configuration

**`citrex_get_config`**
- **Purpose**: Get current Citrex SDK configuration
- **Returns**: Environment (mainnet/testnet), RPC URL, sub-account ID

**`citrex_update_config`**
- **Purpose**: Update Citrex SDK configuration
- **Parameters**: `debug`, `environment`, `rpc`, `subAccountId`
- **Returns**: Success confirmation
- **Note**: Re-initializes the SDK with new settings

---

## Yei Finance Lending Protocol

Yei Finance is an Aave-style lending protocol allowing users to supply assets to earn interest and borrow against collateral.

### Core Concepts

- **Supply**: Deposit assets to earn interest (aTokens)
- **Borrow**: Borrow assets against supplied collateral (debt tokens)
- **Health Factor**: Risk metric (must stay > 1 to avoid liquidation)
- **Collateral**: Supplied assets used as borrowing collateral
- **E-Mode**: High-efficiency mode for correlated assets

### Market Data

**`get_yei_reserves`**
- **Purpose**: Get all available reserve assets and their parameters
- **Parameters**: `network` (optional)
- **Returns**: Array of reserves with:
  - Asset address and metadata
  - Liquidity, utilization rates
  - Interest rates (supply and borrow)
  - LTV (Loan-to-Value), liquidation threshold
  - Available to supply/borrow amounts

**`get_yei_user_account`**
- **Purpose**: Get comprehensive user account data
- **Parameters**: `userAddress`, `network` (optional)
- **Returns**:
  - Total collateral (in USD)
  - Total debt (in USD)
  - Health factor
  - Current liquidation threshold
  - Available borrowing power

### Supply & Withdraw

**`supply_yei_asset`**
- **Purpose**: Supply ERC20 tokens to earn interest
- **Parameters**:
  - `reserveAddress`: Asset reserve contract address
  - `amount`: Amount to supply
  - `onBehalfOf`: Address to credit interest (usually your address)
  - `network` (optional)
- **Returns**: Transaction hash
- **How It Works**: 
  1. Approves reserve if needed
  2. Transfers tokens to pool
  3. Receives aTokens (interest-bearing tokens)
- **Example**: Supply 1000 USDC to earn ~5% APY

**`supply_yei_native_asset`**
- **Purpose**: Supply native SEI to the pool
- **Parameters**: `amount`, `onBehalfOf`, `network` (optional)
- **Returns**: Transaction hash
- **Note**: Native asset supply uses payable function

**`withdraw_yei_asset`**
- **Purpose**: Withdraw supplied ERC20 assets
- **Parameters**: `reserveAddress`, `amount`, `toAddress`, `network` (optional)
- **Returns**: Transaction hash
- **Note**: Withdrawing all requires health factor > 1

**`withdraw_native_asset`**
- **Purpose**: Withdraw supplied SEI
- **Parameters**: `amount`, `toAddress`, `network` (optional)
- **Returns**: Transaction hash

### Borrow & Repay

**`borrow_yei_asset`**
- **Purpose**: Borrow assets against collateral
- **Parameters**:
  - `reserveAddress`: Asset to borrow
  - `amount`: Borrow amount
  - `interestRateMode`: Stable (1) or Variable (2)
  - `onBehalfOf`: Borrower address
  - `network` (optional)
- **Returns**: Transaction hash
- **Prerequisites**: 
  1. Must have supplied collateral
  2. Health factor must remain > 1
  3. Asset must be borrowable
- **Example**: Borrow 500 USDC against 2000 SEI collateral

**`repay_yei_asset`**
- **Purpose**: Repay borrowed assets
- **Parameters**: `reserveAddress`, `amount`, `interestRateMode`, `onBehalfOf`, `network` (optional)
- **Returns**: Transaction hash
- **Note**: Repaying max amount requires -1 or full balance

### Position Management

**`set_collateral_status`**
- **Purpose**: Enable/disable asset as collateral
- **Parameters**: `reserveAddress`, `useAsCollateral` (boolean), `network` (optional)
- **Returns**: Transaction hash
- **Use Case**: Disable collateral to improve health factor or enable new asset

**`set_emode_category`**
- **Purpose**: Enter/exit E-Mode (High-Efficiency Mode)
- **Parameters**: `categoryId` (0 to exit), `network` (optional)
- **Returns**: Transaction hash
- **Use Case**: Higher LTV for correlated assets (e.g., stablecoins)

### Advanced Features

**`execute_flash_loan`**
- **Purpose**: Execute flash loan (borrow and repay in one transaction)
- **Parameters**:
  - `receiverAddress`: Contract address that receives loan
  - `assets`: Array of asset addresses
  - `amounts`: Array of amounts
  - `onBehalfOf`: Address to repay (usually your address)
  - `network` (optional)
- **Returns**: Transaction hash
- **Use Case**: Arbitrage, liquidations, debt refinancing
- **Requirements**: Must repay + fee in same transaction

**`delegate_credit_by_asset`**
- **Purpose**: Delegate borrowing power to another address
- **Parameters**:
  - `underlyingAssetAddress`: Asset to delegate
  - `delegateeAddress`: Address receiving delegation
  - `amount`: Amount to delegate
  - `interestRateMode`: Stable or Variable
  - `network` (optional)
- **Returns**: Transaction hash
- **Use Case**: Let another address borrow against your collateral

---

## OpenSea NFT Marketplace

OpenSea integration provides access to NFT discovery, trading, and analytics on Sei.

### Setup

Requires optional `OPENSEA_API_KEY` environment variable for higher rate limits.

### Discovery Tools

**`get_opensea_collections`**
- **Purpose**: Get list of NFT collections on Sei
- **Returns**: Array of collections with metadata

**`get_opensea_collection_stats`**
- **Purpose**: Get collection statistics
- **Parameters**: `collectionSlug`: Collection identifier
- **Returns**: Floor price, volume, owner count, supply

**`get_opensea_nft`**
- **Purpose**: Get detailed NFT information
- **Parameters**: `address` (contract), `identifier` (token ID)
- **Returns**: Metadata, traits, current owner, listing status

**`get_opensea_nfts_by_account`**
- **Purpose**: Get NFTs owned by an address
- **Parameters**: `address`
- **Returns**: Array of NFTs with metadata

**`get_opensea_nfts_by_collection`**
- **Purpose**: Get multiple NFTs from a collection
- **Parameters**: `collectionSlug`
- **Returns**: NFTs in the collection

**`get_opensea_contract`**
- **Purpose**: Get smart contract information
- **Parameters**: `address`: Contract address
- **Returns**: Contract details and verification status

### Trading Tools

**`create_opensea_listing`**
- **Purpose**: Create and list an NFT for sale
- **Parameters**: `params` object with:
  - `asset`: { address, tokenId }
  - `accountAddress`: Your address
  - `startAmount`: Listing price
  - `expirationTime`: Listing expiration
- **Returns**: Order object with signature
- **How It Works**: Creates off-chain order that can be fulfilled by buyers

**`create_opensea_offer`**
- **Purpose**: Make an offer on an NFT
- **Parameters**:
  - `asset`: { address, tokenId }
  - `accountAddress`: Your address
  - `startAmount`: Offer price
- **Returns**: Order object

**`create_opensea_collection_offer`**
- **Purpose**: Make an offer on any NFT in a collection
- **Parameters**: `collectionSlug`, `accountAddress`, `amount`, `quantity`
- **Returns**: Order object
- **Use Case**: Bulk purchasing from a collection

**`fulfill_opensea_order`**
- **Purpose**: Fulfill a listing or accept an offer
- **Parameters**: `order` (order object), `accountAddress`
- **Returns**: Transaction hash
- **Note**: For listings, this buys the NFT. For offers, this accepts the offer.

**`buy_opensea_nft`**
- **Purpose**: High-level tool to buy NFT at best price
- **Parameters**: `collectionSlug`, `identifier`, `accountAddress`
- **Returns**: Transaction hash
- **How It Works**: Finds best listing and fulfills automatically

**`cancel_opensea_order`**
- **Purpose**: Cancel active listing or offer
- **Parameters**: `order`, `accountAddress`
- **Returns**: Transaction hash

### Activity & Events

**`get_opensea_events_by_account`**
- **Purpose**: Get activity history for an account
- **Parameters**: `address`, `options` (event types, pagination)
- **Returns**: Array of events (sales, transfers, listings)

**`get_opensea_events_by_collection`**
- **Purpose**: Get collection activity
- **Parameters**: `collectionSlug`
- **Returns**: Recent events in the collection

**`get_opensea_events_by_nft`**
- **Purpose**: Get activity for a specific NFT
- **Parameters**: `address`, `identifier`
- **Returns**: History of that NFT

---

## Symphony DEX Aggregator

Symphony finds optimal swap routes across multiple DEXs on Sei for best prices.

### Configuration

**`get_symphony_config`**
- **Purpose**: Get current Symphony SDK configuration
- **Returns**: RPC URL, chain ID, and other settings

**`set_symphony_config`**
- **Purpose**: Update Symphony SDK configuration
- **Parameters**: `options` object with RPC, chain ID, etc.
- **Returns**: Success confirmation

### Token Discovery

**`get_symphony_token_list`**
- **Purpose**: Get all tokens available for swapping
- **Returns**: Array of tokens with addresses and metadata

**`is_symphony_token_listed`**
- **Purpose**: Check if token is available on Symphony
- **Parameters**: `tokenAddress`
- **Returns**: Boolean

### Route Discovery

**`get_symphony_route`**
- **Purpose**: Find best swap route (single quote)
- **Parameters**:
  - `tokenInAddress`: Input token (0x0 for native)
  - `tokenOutAddress`: Output token
  - `amount`: Input amount
- **Returns**: Route object with output amount and path

**`get_symphony_total_amount_out`**
- **Purpose**: Calculate total output for a route
- **Parameters**: Same as `get_symphony_route`
- **Returns**: Output amount in human-readable format

### Swap Execution

**`swap_on_symphony`**
- **Purpose**: Execute swap with default options
- **Parameters**: `tokenInAddress`, `tokenOutAddress`, `amount`
- **Returns**: Transaction receipt
- **How It Works**: 
  1. Finds optimal route
  2. Checks/approves token if needed
  3. Executes swap
- **Note**: Automatically handles token approvals

**`swap_on_symphony_advanced`**
- **Purpose**: Swap with custom options
- **Parameters**: 
  - `tokenInAddress`, `tokenOutAddress`, `amount`
  - `params`: { routeOptions, swapOptions, slippage }
- **Returns**: Swap result with receipt and optional approval receipt
- **Use Case**: Custom slippage, specific routing preferences

### Transaction Utilities

**`check_symphony_approval`**
- **Purpose**: Check if protocol has sufficient token allowance
- **Parameters**: `tokenInAddress`, `tokenOutAddress`, `amount`
- **Returns**: Approval status and required amount

**`approve_symphony_token`**
- **Purpose**: Approve Symphony to spend tokens
- **Parameters**: `tokenInAddress`, `tokenOutAddress`, `amount`
- **Returns**: Transaction hash
- **Note**: Usually handled automatically by swap functions

**`generate_symphony_swap_calldata`**
- **Purpose**: Generate transaction data without executing
- **Parameters**: `tokenInAddress`, `tokenOutAddress`, `amount`
- **Returns**: Transaction calldata
- **Use Case**: Multi-sig wallets, offline signing

---

## Kame DEX Aggregator

Kame is another DEX aggregator on Sei, similar to Symphony but with different routing algorithms.

### Swap Operations

**`get_kame_quote`**
- **Purpose**: Get swap quote from Kame
- **Parameters**: `fromTokenAddress`, `toTokenAddress`, `amount`
- **Returns**: Output amount and swap parameters

**`swap_on_kame`**
- **Purpose**: Execute swap on Kame aggregator
- **Parameters**: 
  - `fromTokenAddress`: Input token
  - `toTokenAddress`: Output token
  - `amount`: Input amount
  - `slippage`: Slippage tolerance in basis points (default: 100 = 1%)
- **Returns**: Transaction receipt
- **How It Works**: Fetches swap data from Kame API and executes transaction

**`generate_kame_swap_calldata`**
- **Purpose**: Generate swap transaction data offline
- **Parameters**: `fromTokenAddress`, `toTokenAddress`, `amount`
- **Returns**: Transaction calldata for external execution

### Token Discovery

**`get_kame_token_list`**
- **Purpose**: Browse available tokens on Kame
- **Parameters**: `ids`, `cursor`, `count`, `pattern` (for filtering)
- **Returns**: Paginated token list

**`get_kame_prices`**
- **Purpose**: Get real-time token prices
- **Parameters**: `ids`: Array of token addresses
- **Returns**: Price data for requested tokens

---

## Li.Fi Cross-Chain Bridge

Li.Fi aggregates multiple bridges and DEXs for cross-chain swaps between different blockchains.

### Quote & Route Discovery

**`get_lifi_quote`**
- **Purpose**: Get single best quote for cross-chain swap
- **Parameters**:
  - `fromChainId`: Source chain ID (e.g., 1329 for Sei)
  - `toChainId`: Destination chain ID
  - `fromTokenAddress`: Source token address
  - `toTokenAddress`: Destination token address
  - `fromAmount`: Amount to swap
- **Returns**: Best route with bridge, DEX, fees, and execution steps

**`get_lifi_route`**
- **Purpose**: Get all available routes for comparison
- **Parameters**: Same as `get_lifi_quote`
- **Returns**: Array of all possible routes
- **Use Case**: Compare different bridge/DEX combinations

### Swap Execution

**`create_and_execute_lifi_order`**
- **Purpose**: Execute cross-chain swap in one step
- **Parameters**: Same as `get_lifi_quote`
- **Returns**: Transaction hash(es)
- **How It Works**:
  1. Finds optimal route
  2. Executes source chain transaction
  3. Monitors bridge execution
  4. Returns when destination transaction is complete
- **Note**: Cross-chain swaps take time (minutes to hours depending on chains)

### Chain & Token Discovery

**`get_lifi_chains`**
- **Purpose**: Get all EVM chains supported by Li.Fi
- **Returns**: Array of chains with IDs, names, RPC URLs

**`get_lifi_token`**
- **Purpose**: Get token details on a specific chain
- **Parameters**: `chainId`, `tokenAddress`
- **Returns**: Token metadata and bridge availability

---

## deBridge Cross-Chain Bridge

deBridge provides direct cross-chain asset transfers and swaps.

### Order Creation

**`create_debridge_order`**
- **Purpose**: Create cross-chain order (quote or signable transaction)
- **Parameters**:
  - `srcChainId`: Source chain ID
  - `srcChainTokenIn`: Source token address
  - `srcChainTokenInAmount`: Amount to send
  - `dstChainId`: Destination chain ID
  - `dstChainTokenOut`: Destination token address
  - `dstChainTokenOutRecipient`: Recipient address on destination
- **Returns**: Order estimation or signable transaction
- **How It Works**: Creates order that deBridge fulfills cross-chain

**`create_and_execute_debridge_order`**
- **Purpose**: Create and execute order in one step
- **Parameters**: Same as above (recipient optional, uses your address)
- **Returns**: Transaction hash
- **Note**: Full execution waits for cross-chain confirmation

### Order Tracking

**`get_debridge_order_status_by_id`**
- **Purpose**: Check order status by order ID
- **Parameters**: `orderId`
- **Returns**: Order status, current stage, transaction hashes

**`get_debridge_order_by_tx_hash`**
- **Purpose**: Get order details by creation transaction
- **Parameters**: `txHash`: Transaction hash that created the order
- **Returns**: Order details

**`get_debridge_orders_by_wallet`**
- **Purpose**: Get order history for a wallet
- **Parameters**:
  - `address`: Wallet address
  - `orderStates`: Filter by status (optional)
  - `giveChainIds`, `takeChainIds`: Filter by chains (optional)
  - `skip`, `take`: Pagination
- **Returns**: Array of historical orders

**`get_debridge_order_ids_by_tx_hash`**
- **Purpose**: Get all order IDs from a transaction
- **Parameters**: `txHash`
- **Returns**: Array of order IDs (one tx can create multiple orders)

### Order Management

**`cancel_debridge_order`**
- **Purpose**: Cancel unfulfilled order
- **Parameters**: `orderId`
- **Returns**: Cancellation transaction hash
- **Note**: Only works if order hasn't been processed by bridge

---

## Token Deployment

### ERC20 Token Deployment

**`deploy_erc20`**
- **Purpose**: Deploy a new ERC20 token contract
- **Parameters**:
  - `network` (optional): Network to deploy on
  - `name`: Token name (e.g., "My Token")
  - `symbol`: Token symbol (e.g., "MTK")
  - `initialSupply`: Initial token supply (human-readable, e.g., "1000000")
  - `decimals`: Token decimals (usually 18)
- **Returns**: Contract address and deployment transaction hash
- **How It Works**: 
  1. Deploys ERC20 contract with constructor parameters
  2. Mints initial supply to deployer address
  3. Returns contract address for verification
- **Example**: Create a token with 1M supply, 18 decimals

**`verify_erc20_contract_locally`**
- **Purpose**: Verify deployed ERC20 by checking on-chain parameters
- **Parameters**: `contractAddress`, `name`, `symbol`, `initialSupply`, `decimals`, `network`
- **Returns**: Verification result (match/mismatch details)

**`verify_erc20_contract`**
- **Purpose**: Submit contract source for public verification on SeiTrace
- **Parameters**: Same as above
- **Returns**: Verification submission confirmation
- **Note**: Makes contract source code publicly viewable on block explorer

**`check_verification_status`**
- **Purpose**: Check if contract is verified on SeiTrace
- **Parameters**: `contractAddress`, `network`
- **Returns**: Verification status

**`mint_erc20_tokens`**
- **Purpose**: Mint additional tokens after deployment
- **Parameters**: `tokenAddress`, `toAddress`, `amount`, `network`
- **Returns**: Transaction hash
- **Prerequisites**: Deployer must own the contract

### ERC721 (NFT) Deployment

**`deploy_erc721`**
- **Purpose**: Deploy a new NFT collection contract
- **Parameters**:
  - `network` (optional)
  - `name`: Collection name
  - `symbol`: Collection symbol
  - `baseURI_`: Base URI for token metadata (e.g., "ipfs://...")
- **Returns**: Contract address and deployment transaction hash
- **How It Works**: Deploys ERC721 contract with metadata URI support

**`verify_erc721_contract_locally`**
- **Purpose**: Verify deployed NFT contract parameters
- **Parameters**: `contractAddress`, `name`, `symbol`, `baseURI_`, `network`
- **Returns**: Verification result

**`verify_erc721_contract`**
- **Purpose**: Submit NFT contract for public verification
- **Parameters**: Same as above
- **Returns**: Verification submission

**`mint_nft`**
- **Purpose**: Mint a single NFT from the collection
- **Parameters**: `nftContractAddress`, `toAddress`, `network`
- **Returns**: Transaction hash
- **Note**: Token ID is auto-incremented

**`mint_batch_nfts`**
- **Purpose**: Mint multiple NFTs in one transaction
- **Parameters**: `nftContractAddress`, `toAddress`, `quantity`, `network`
- **Returns**: Transaction hash
- **Use Case**: Efficiently mint multiple NFTs to same address

---

## Data & Analytics Services

### SeiTrace Insights

SeiTrace provides comprehensive on-chain analytics for addresses, tokens, and transactions.

#### Setup
Requires optional `SEITRACE_API_KEY` environment variable for authenticated access.

#### Address Analysis

**`seitrace_get_address_details`**
- **Purpose**: Get comprehensive address profile
- **Parameters**: `network`, `address`
- **Returns**: 
  - Address type (EOA or contract)
  - Transaction counts
  - Token holdings summary
  - First and last activity
- **Use Case**: Wallet analysis, contract verification

**`seitrace_get_smart_contract_details`**
- **Purpose**: Get detailed contract information
- **Parameters**: `network`, `address`
- **Returns**: 
  - Contract verification status
  - Creator address and creation transaction
  - Contract source code (if verified)
  - Implementation details

#### Transaction History

**`seitrace_get_address_transactions`**
- **Purpose**: Get transaction history for an address
- **Parameters**:
  - `network`, `address` (required)
  - `status`: Filter by status (optional)
  - `limit`, `offset`: Pagination
  - `from_date`, `to_date`: Date range
- **Returns**: Array of transactions with details

**`seitrace_get_address_token_transfers`**
- **Purpose**: Get all token transfers (ERC20, ERC721, ERC1155, native)
- **Parameters**: `network`, `address`, `limit`, `offset`
- **Returns**: All token transfers in/out of address

**`seitrace_get_erc20_token_transfers`**
- **Purpose**: Get ERC20 transfers for a specific token
- **Parameters**: `network`, `contract_address`, `wallet_address` (optional), `limit`
- **Returns**: Transfer history for the token

**`seitrace_get_erc721_token_transfers`**
- **Purpose**: Get NFT transfers for a collection
- **Parameters**: `network`, `contract_address`, `wallet_address` (optional), `token_id` (optional), `limit`
- **Returns**: NFT transfer events

**`seitrace_get_erc1155_token_transfers`**
- **Purpose**: Get ERC1155 transfers
- **Parameters**: `network`, `contract_address`, `wallet_address`, `token_id`, `limit`
- **Returns**: ERC1155 transfer events

**`seitrace_get_native_token_transfers`**
- **Purpose**: Get native SEI transfers
- **Parameters**: `network`, `token_denom`, `wallet_address`, `limit`
- **Returns**: Native token transfers

#### Token Information

**`seitrace_get_erc20_token_info`**
- **Purpose**: Get comprehensive ERC20 token data
- **Parameters**: `network`, `contract_address`
- **Returns**: 
  - Token metadata (name, symbol, decimals)
  - Total supply and holders count
  - Price data (if available)
  - Contract details

**`seitrace_get_erc721_token_info`**
- **Purpose**: Get NFT collection information
- **Parameters**: `network`, `contract_address`
- **Returns**: Collection metadata, total supply, owner count

**`seitrace_get_erc1155_token_info`**
- **Purpose**: Get ERC1155 contract information
- **Parameters**: `network`, `contract_address`
- **Returns**: Contract details and token types

#### Token Balances & Holders

**`seitrace_get_erc20_balances`**
- **Purpose**: Get all ERC20 balances for a wallet
- **Parameters**: `network`, `address`, `limit`
- **Returns**: Array of token balances with metadata

**`seitrace_get_erc721_balances`**
- **Purpose**: Get all NFTs owned by an address
- **Parameters**: `network`, `address`, `limit`
- **Returns**: NFTs from all collections

**`seitrace_get_erc1155_balances`**
- **Purpose**: Get ERC1155 balances
- **Parameters**: `network`, `address`, `limit`
- **Returns**: ERC1155 token holdings

**`seitrace_get_native_balances`**
- **Purpose**: Get native token balance
- **Parameters**: `network`, `address`, `limit`
- **Returns**: Native SEI balance

**`seitrace_get_erc20_token_holders`**
- **Purpose**: List all holders of an ERC20 token
- **Parameters**: `network`, `contract_address`, `limit`
- **Returns**: Addresses and balances of token holders

**`seitrace_get_erc721_token_holders`**
- **Purpose**: List owners of NFTs in a collection
- **Parameters**: `network`, `contract_address`, `limit`
- **Returns**: Unique owners and their NFT counts

**`seitrace_get_erc1155_token_holders`**
- **Purpose**: List ERC1155 token holders
- **Parameters**: `network`, `contract_address`, `limit`
- **Returns**: Holders and their balances

**`seitrace_get_native_token_holders`**
- **Purpose**: List native token holders
- **Parameters**: `network`, `token_denom`, `limit`
- **Returns**: Addresses with native balances

#### NFT Tools

**`seitrace_get_erc721_instances`**
- **Purpose**: Get specific NFT instances in a collection
- **Parameters**: `network`, `contract_address`, `token_id`, `limit`
- **Returns**: NFT metadata and ownership

**`seitrace_get_erc1155_instances`**
- **Purpose**: Get ERC1155 token instances
- **Parameters**: `network`, `contract_address`, `token_id`, `limit`
- **Returns**: Token instance details

### CoinGecko Market Data

CoinGecko provides cryptocurrency market data and prices.

#### Setup
Optional `COINGECKO_PRO_API_KEY` for higher rate limits (free tier available).

#### Price Data

**`get_token_price`**
- **Purpose**: Get current price and market data
- **Parameters**:
  - `tokenId`: CoinGecko token ID (e.g., "sei-network")
  - `vsCurrency`: Quote currency (e.g., "usd")
- **Returns**: Current price, market cap, 24h volume, price change

**`get_multiple_token_prices`**
- **Purpose**: Get prices for multiple tokens in one call
- **Parameters**: `tokenIds` (array), `vsCurrency`
- **Returns**: Price data for all requested tokens

**`get_token_historical_data`**
- **Purpose**: Get historical price data
- **Parameters**:
  - `tokenId`: Token identifier
  - `vsCurrency`: Quote currency
  - `days`: Number of days (1, 7, 30, 365, max)
  - `interval`: Data interval (daily, hourly, minutely)
- **Returns**: Historical price points
- **Example**: Get 30-day daily prices for SEI

#### Token Discovery

**`search_tokens`**
- **Purpose**: Search for tokens by name or symbol
- **Parameters**: `query`: Search string
- **Returns**: Matching tokens with IDs

**`get_trending_tokens`**
- **Purpose**: Get currently trending tokens
- **Returns**: Trending tokens with price changes

**`get_token_by_contract`**
- **Purpose**: Get token info by on-chain contract address
- **Parameters**: `platformId` (chain identifier), `contractAddress`
- **Returns**: Token information and CoinGecko ID

### DexScreener Analytics

DexScreener provides real-time DEX analytics and pair data.

#### Pair Discovery

**`dex_search_pairs`**
- **Purpose**: Search for trading pairs
- **Parameters**: `query`: Token name, symbol, or address
- **Returns**: Matching pairs across all DEXs

**`dex_get_token_pairs`**
- **Purpose**: Get all pairs for specific tokens
- **Parameters**: `tokenAddresses`: Array of token addresses
- **Returns**: All trading pairs involving those tokens

**`dex_get_pairs_by_address`**
- **Purpose**: Get information for specific pair contract
- **Parameters**: `chainId`, `pairAddress`
- **Returns**: Pair details, liquidity, volume, price

#### Token Profiles

**`dex_get_token_profile`**
- **Purpose**: Get token profile with description and links
- **Parameters**: `chainId`, `tokenAddress`
- **Returns**: Token profile, social links, description

**`dex_get_latest_token_profiles`**
- **Purpose**: Get recently updated token profiles
- **Returns**: Recently active tokens

**`dex_get_top_boosted_tokens`**
- **Purpose**: Get community-promoted tokens
- **Returns**: Tokens that have been boosted by communities

#### Trading Activity

**`dex_get_orders_by_chain`**
- **Purpose**: Get recent trading activity
- **Parameters**: `chainId`, `tokenAddress`
- **Returns**: Recent swaps and trades

**`dex_advanced_search`**
- **Purpose**: Perform multiple limited searches
- **Parameters**: `queries`: Array of search queries, `limit`
- **Returns**: Results for each query

**`dex_get_multi_chain_token_data`**
- **Purpose**: Get token data across multiple chains
- **Parameters**: `tokenAddresses`, `maxPairsPerToken`
- **Returns**: Token presence and pairs across chains

---

## Hive Intelligence

Hive Intelligence provides natural language querying of blockchain data.

### Setup
Requires optional `HIVE_INTELLIGENCE_API_KEY` environment variable.

### Natural Language Queries

**`search_hive_intelligence`**
- **Purpose**: Query blockchain data using natural language
- **Parameters**: `prompt`: Natural language question
- **Returns**: Structured blockchain data based on query
- **How It Works**: 
  - Processes natural language query
  - Interprets intent (wallet analysis, token info, transactions)
  - Retrieves relevant on-chain data
  - Returns formatted results
- **Examples**:
  - "What are the holdings in wallet 0x1234...?"
  - "Show me the transaction history for address 0x5678..."
  - "What tokens does this wallet own?"
  - "Get the balance of USDC for address 0xabcd..."
- **Use Cases**:
  - Simplifying complex queries into natural language
  - AI assistants can ask questions without knowing specific tool names
  - Exploratory data analysis of wallets and tokens

---

## Common Patterns & Workflows

### DeFi Swap Workflow

1. **Check Balance**: `get_erc20_balance` to verify you have tokens
2. **Get Quote**: Use `dragonswap_get_swap_quote` or `symphony_get_route`
3. **Approve Spending**: `approve_token_spending` to approve router
4. **Execute Swap**: Use `dragonswap_execute_swap` or `swap_on_symphony`
5. **Verify**: `get_transaction_receipt` to confirm success

### NFT Trading Workflow

1. **Discover NFT**: `get_opensea_nft` or `get_nft_info`
2. **Check Best Price**: `get_opensea_best_listing_for_nft`
3. **Buy NFT**: `buy_opensea_nft` (high-level) or `fulfill_opensea_order`
4. **Verify Ownership**: `check_nft_ownership`

### Token Deployment Workflow

1. **Deploy Contract**: `deploy_erc20` or `deploy_erc721`
2. **Verify Locally**: `verify_erc20_contract_locally`
3. **Submit Verification**: `verify_erc20_contract` for public verification
4. **Mint Tokens**: `mint_erc20_tokens` or `mint_nft` / `mint_batch_nfts`

### Cross-Chain Bridge Workflow

1. **Get Quote**: `get_lifi_quote` or `create_debridge_order`
2. **Execute**: `create_and_execute_lifi_order` or `create_and_execute_debridge_order`
3. **Monitor**: `get_debridge_order_status_by_id` to track progress
4. **Verify**: Check destination chain for received assets

### Lending Protocol Workflow

1. **Supply Assets**: `supply_yei_asset` to deposit and earn interest
2. **Check Account**: `get_yei_user_account` to see health factor
3. **Borrow**: `borrow_yei_asset` against collateral
4. **Manage Position**: `set_collateral_status` or `set_emode_category`
5. **Repay**: `repay_yei_asset` to reduce debt
6. **Withdraw**: `withdraw_yei_asset` when needed

---

## Error Handling

All tools return errors in a consistent format:
```json
{
  "content": [{
    "type": "text",
    "text": "Error message here"
  }],
  "isError": true
}
```

Common error scenarios:
- **Insufficient Balance**: Check token/native balance before operations
- **Approval Required**: Approve spender before token transfers/swaps
- **Invalid Address**: Ensure addresses are valid EVM addresses (0x...)
- **Network Mismatch**: Verify network parameter matches your target chain
- **Missing Private Key**: Set PRIVATE_KEY environment variable for signing operations
- **Contract Errors**: Check contract state, allowances, and parameters

---

## Best Practices

1. **Always Check Balances First**: Verify sufficient funds before transactions
2. **Use Quotes Before Swaps**: Get quotes to estimate output and slippage
3. **Set Appropriate Slippage**: Use 0.5-1% for stable pairs, 2-5% for volatile pairs
4. **Monitor Health Factors**: Keep Yei Finance health factor > 1.5 for safety
5. **Verify Contracts**: Always verify deployed contracts for transparency
6. **Use Natural Language**: Leverage Hive Intelligence for complex queries
7. **Batch Operations**: Use batch functions when available (multiple orders, mints)
8. **Monitor Transactions**: Check receipts to confirm execution
9. **Test on Testnet**: Use sei-testnet for testing before mainnet operations
10. **Keep Keys Secure**: Never commit private keys, use environment variables

---

## Support & Resources

- **Documentation**: This file and README.md
- **Protocol Docs**: 
  - [DragonSwap](https://docs.dragonswap.io)
  - [Citrex](https://docs.citrex.io)
  - [Yei Finance](https://docs.yei.finance)
  - [OpenSea](https://docs.opensea.io)
- **Sei Network**: [Sei Documentation](https://docs.sei.io)
- **Issues**: GitHub Issues for bugs and feature requests

---

**Last Updated**: V2.0.0
**Maintained by**: SEI Protocol Team

