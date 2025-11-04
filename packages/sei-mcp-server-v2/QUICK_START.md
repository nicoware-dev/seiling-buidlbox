# Quick Start Guide - SEI MCP Server V2

This guide provides quick examples for common use cases. For detailed documentation, see [FEATURES.md](./FEATURES.md).

## Table of Contents
1. [Basic Token Operations](#basic-token-operations)
2. [DeFi Swapping](#defi-swapping)
3. [NFT Trading](#nft-trading)
4. [Token Deployment](#token-deployment)
5. [Cross-Chain Operations](#cross-chain-operations)
6. [Lending & Borrowing](#lending--borrowing)

---

## Basic Token Operations

### Check Balance
```json
{
  "tool": "get_balance",
  "arguments": {
    "address": "0x...",
    "network": "sei"
  }
}
```

### Transfer Native SEI
```json
{
  "tool": "transfer_sei",
  "arguments": {
    "to": "0x...",
    "amount": "0.1",
    "network": "sei"
  }
}
```

### Transfer ERC20 Token
```json
{
  "tool": "transfer_erc20",
  "arguments": {
    "tokenAddress": "0x...",
    "toAddress": "0x...",
    "amount": "100",
    "network": "sei"
  }
}
```

---

## DeFi Swapping

### DragonSwap - Get Quote First
```json
{
  "tool": "dragonswap_get_swap_quote",
  "arguments": {
    "quoterAddress": "0x...",
    "amountIn": "100",
    "tokenIn": "0x...",
    "tokenOut": "0x...",
    "fee": 3000
  }
}
```

### DragonSwap - Execute Swap
1. **Approve first**:
```json
{
  "tool": "approve_token_spending",
  "arguments": {
    "tokenAddress": "0x...",
    "spenderAddress": "0x...",
    "amount": "1000000000000000000",
    "network": "sei"
  }
}
```

2. **Then swap**:
```json
{
  "tool": "dragonswap_execute_swap",
  "arguments": {
    "routerAddress": "0x...",
    "tokenIn": "0x...",
    "tokenOut": "0x...",
    "amountIn": "100",
    "amountOutMinimum": "99",
    "recipient": "0x...",
    "fee": 3000
  }
}
```

### Symphony Aggregator (Easiest - Auto Routing)
```json
{
  "tool": "swap_on_symphony",
  "arguments": {
    "tokenInAddress": "0x...",
    "tokenOutAddress": "0x...",
    "amount": "100"
  }
}
```

---

## NFT Trading

### Get NFT Information
```json
{
  "tool": "get_opensea_nft",
  "arguments": {
    "address": "0x...",
    "identifier": "123"
  }
}
```

### Buy NFT (Automatic)
```json
{
  "tool": "buy_opensea_nft",
  "arguments": {
    "collectionSlug": "my-collection",
    "identifier": "123",
    "accountAddress": "0x..."
  }
}
```

### List NFT for Sale
```json
{
  "tool": "create_opensea_listing",
  "arguments": {
    "params": {
      "asset": {
        "address": "0x...",
        "tokenId": "123"
      },
      "accountAddress": "0x...",
      "startAmount": "10",
      "expirationTime": "1735689600"
    }
  }
}
```

---

## Token Deployment

### Deploy ERC20 Token
```json
{
  "tool": "deploy_erc20",
  "arguments": {
    "network": "sei",
    "name": "My Token",
    "symbol": "MTK",
    "initialSupply": "1000000",
    "decimals": 18
  }
}
```

### Deploy NFT Collection
```json
{
  "tool": "deploy_erc721",
  "arguments": {
    "network": "sei",
    "name": "My NFT Collection",
    "symbol": "MNC",
    "baseURI_": "ipfs://Qm..."
  }
}
```

### Mint NFTs
```json
{
  "tool": "mint_nft",
  "arguments": {
    "nftContractAddress": "0x...",
    "toAddress": "0x...",
    "network": "sei"
  }
}
```

---

## Cross-Chain Operations

### Li.Fi Cross-Chain Swap
```json
{
  "tool": "create_and_execute_lifi_order",
  "arguments": {
    "fromChainId": 1329,
    "toChainId": 1,
    "fromTokenAddress": "0x...",
    "toTokenAddress": "0x...",
    "fromAmount": "100"
  }
}
```

### deBridge Cross-Chain Transfer
```json
{
  "tool": "create_and_execute_debridge_order",
  "arguments": {
    "srcChainId": 1329,
    "dstChainId": 1,
    "srcChainTokenIn": "0x...",
    "srcChainTokenInAmount": "100",
    "dstChainTokenOut": "0x..."
  }
}
```

---

## Lending & Borrowing

### Supply Assets to Yei Finance
```json
{
  "tool": "supply_yei_asset",
  "arguments": {
    "reserveAddress": "0x...",
    "amount": "1000",
    "onBehalfOf": "0x...",
    "network": "sei"
  }
}
```

### Borrow Against Collateral
```json
{
  "tool": "borrow_yei_asset",
  "arguments": {
    "reserveAddress": "0x...",
    "amount": "500",
    "interestRateMode": 2,
    "onBehalfOf": "0x...",
    "network": "sei"
  }
}
```

### Check Account Health
```json
{
  "tool": "get_yei_user_account",
  "arguments": {
    "userAddress": "0x...",
    "network": "sei"
  }
}
```

---

## Market Data & Analytics

### Get Token Price (CoinGecko)
```json
{
  "tool": "get_token_price",
  "arguments": {
    "tokenId": "sei-network",
    "vsCurrency": "usd"
  }
}
```

### Search Trading Pairs (DexScreener)
```json
{
  "tool": "dex_search_pairs",
  "arguments": {
    "query": "SEI"
  }
}
```

### Natural Language Query (Hive Intelligence)
```json
{
  "tool": "search_hive_intelligence",
  "arguments": {
    "prompt": "What are the holdings in wallet 0x1234...?"
  }
}
```

---

## Common Workflows

### Complete Swap Workflow
1. `get_erc20_balance` - Check you have tokens
2. `dragonswap_get_swap_quote` - Get expected output
3. `approve_token_spending` - Approve router
4. `dragonswap_execute_swap` - Execute swap
5. `get_transaction_receipt` - Verify success

### NFT Purchase Workflow
1. `get_opensea_nft` - View NFT details
2. `get_opensea_best_listing_for_nft` - Check price
3. `buy_opensea_nft` - Purchase
4. `check_nft_ownership` - Verify ownership

### Token Launch Workflow
1. `deploy_erc20` - Deploy contract
2. `verify_erc20_contract_locally` - Verify parameters
3. `verify_erc20_contract` - Submit for public verification
4. `mint_erc20_tokens` - Mint additional supply if needed

---

## Tips & Best Practices

1. **Always get quotes before swaps** - Use quote tools to estimate output
2. **Check balances first** - Verify sufficient funds before operations
3. **Approve before swapping** - Token approvals are required for DEX interactions
4. **Set slippage tolerance** - Use 0.5-1% for stable pairs, 2-5% for volatile
5. **Monitor health factors** - Keep Yei Finance health > 1.5 for safety
6. **Test on testnet** - Use `sei-testnet` for testing before mainnet

---

For detailed documentation on each protocol and all available tools, see [FEATURES.md](./FEATURES.md).

