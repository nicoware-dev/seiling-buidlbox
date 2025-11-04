import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";
import { type Address } from 'viem';

/**
 * Registers tools related to the DragonSwap DEX.
 * @param server The MCP server instance
 */
export function registerDragonSwapTools(server: McpServer) {
    // Execute token swap
  server.tool(
    "execute_swap",
    "Execute a token swap on DragonSwap",
    {
      tokenIn: z.string().describe("Input token address"),
      tokenOut: z.string().describe("Output token address"),
      amountIn: z.string().describe("Amount of input token"),
      amountOutMinimum: z.string().describe("Minimum amount of output token"),
      recipient: z.string().describe("Recipient address"),
      fee: z.number().optional().describe("Fee tier (100, 500, 3000, 10000)"),
      deadline: z.number().optional().describe("Transaction deadline timestamp"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenIn, tokenOut, amountIn, amountOutMinimum, recipient, fee = 3000, deadline, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.executeSwap(
          tokenIn, tokenOut, amountIn, amountOutMinimum, recipient, fee, deadline, network
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error executing swap: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Add liquidity
  server.tool(
    "add_liquidity",
    "Add liquidity to a DragonSwap V3 pool",
    {
      token0: z.string().describe("Token0 address"),
      token1: z.string().describe("Token1 address"),
      fee: z.number().describe("Fee tier"),
      tickLower: z.number().describe("Lower tick boundary"),
      tickUpper: z.number().describe("Upper tick boundary"),
      amount0Desired: z.string().describe("Desired amount of token0"),
      amount1Desired: z.string().describe("Desired amount of token1"),
      amount0Min: z.string().describe("Minimum amount of token0"),
      amount1Min: z.string().describe("Minimum amount of token1"),
      recipient: z.string().describe("Recipient address"),
      deadline: z.number().optional().describe("Transaction deadline"),
      network: z.string().optional().describe("Network name")
    },
    async ({ token0, token1, fee, tickLower, tickUpper, amount0Desired, amount1Desired, amount0Min, amount1Min, recipient, deadline, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.addLiquidity(
          token0, token1, fee, tickLower, tickUpper,
          amount0Desired, amount1Desired, amount0Min, amount1Min, recipient, deadline, network
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error adding liquidity: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Remove liquidity
  server.tool(
    "remove_liquidity",
    "Remove liquidity from a DragonSwap V3 position",
    {
      tokenId: z.string().describe("NFT token ID of the position"),
      liquidity: z.string().describe("Amount of liquidity to remove"),
      amount0Min: z.string().describe("Minimum amount of token0"),
      amount1Min: z.string().describe("Minimum amount of token1"),
      deadline: z.number().optional().describe("Transaction deadline"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenId, liquidity, amount0Min, amount1Min, deadline, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.removeLiquidity(
          tokenId, liquidity, amount0Min, amount1Min, deadline, network
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error removing liquidity: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Collect fees
  server.tool(
    "collect_fees",
    "Collect fees from a DragonSwap V3 position",
    {
      tokenId: z.string().describe("NFT token ID of the position"),
      recipient: z.string().describe("Recipient address"),
      amount0Max: z.string().optional().describe("Maximum amount of token0 to collect"),
      amount1Max: z.string().optional().describe("Maximum amount of token1 to collect"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenId, recipient, amount0Max, amount1Max, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.collectFees(
          tokenId, recipient, amount0Max, amount1Max, network
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error collecting fees: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get position info
  server.tool(
    "get_position_info",
    "Get information about a DragonSwap V3 position",
    {
      tokenId: z.string().describe("NFT token ID of the position"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenId, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getPositionInfo(tokenId, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error getting position info: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get or create pool
  server.tool(
    "get_or_create_pool",
    "Get existing pool or create new DragonSwap V3 pool",
    {
      tokenA: z.string().describe("First token address"),
      tokenB: z.string().describe("Second token address"),
      fee: z.number().describe("Fee tier (100, 500, 3000, 10000)"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenA, tokenB, fee, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getOrCreatePool(tokenA, tokenB, fee, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error getting/creating pool: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Pool Address
  server.tool(
    "get_pool_address",
    "Get existing pool address for token pair and fee tier",
    {
      tokenA: z.string().describe("First token address"),
      tokenB: z.string().describe("Second token address"),
      fee: z.number().describe("Fee tier (100, 500, 3000, 10000)"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenA, tokenB, fee, network = DEFAULT_NETWORK }) => {
      try {
        const poolAddress = await services.getPoolAddress(tokenA, tokenB, fee, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(poolAddress, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error getting pool address: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Create Pool
  server.tool(
    "create_pool",
    "Create new DragonSwap V3 pool for token pair and fee tier",
    {
      tokenA: z.string().describe("First token address"),
      tokenB: z.string().describe("Second token address"),
      fee: z.number().describe("Fee tier (100, 500, 3000, 10000)"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenA, tokenB, fee, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.createPool(tokenA, tokenB, fee, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error creating pool: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Check token allowance
  server.tool(
    "check_token_allowance",
    "Check token allowance for DragonSwap contracts",
    {
      tokenAddress: z.string().describe("Token contract address"),
      ownerAddress: z.string().describe("Owner address"),
      spenderAddress: z.string().describe("Spender contract address"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenAddress, ownerAddress, spenderAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.checkTokenAllowance(tokenAddress, ownerAddress, spenderAddress, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error checking allowance: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get token balance
  server.tool(
    "get_token_balance_modified",
    "Get token balance for an address",
    {
      tokenAddress: z.string().describe("Token contract address"),
      accountAddress: z.string().describe("Account address"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenAddress, accountAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getTokenBalance(tokenAddress, accountAddress, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error getting balance: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  /* not done yet 
  // Estimate swap gas
  server.tool(
    "estimate_swap_gas",
    "Estimate gas cost for a DragonSwap token swap",
    {
      routerAddress: z.string().describe("DragonSwap router contract address"),
      tokenIn: z.string().describe("Input token address"),
      tokenOut: z.string().describe("Output token address"),
      amountIn: z.string().describe("Amount of input token"),
      amountOutMinimum: z.string().describe("Minimum amount of output token"),
      recipient: z.string().describe("Recipient address"),
      fee: z.number().optional().describe("Fee tier"),
      deadline: z.number().optional().describe("Transaction deadline"),
      network: z.string().optional().describe("Network name")
    },
    async ({ routerAddress, tokenIn, tokenOut, amountIn, amountOutMinimum, recipient, fee = 3000, deadline, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.estimateSwapGas(
          routerAddress, tokenIn, tokenOut, amountIn, amountOutMinimum, recipient, fee, deadline, network
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error estimating gas: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );
*/

  // Multi-hop swap
  server.tool(
    "execute_multihop_swap",
    "Execute a multi-hop token swap on DragonSwap",
    {
      path: z.string().describe("Encoded path for multi-hop swap"),
      amountIn: z.string().describe("Amount of input token"),
      amountOutMinimum: z.string().describe("Minimum amount of output token"),
      recipient: z.string().describe("Recipient address"),
      deadline: z.number().optional().describe("Transaction deadline"),
      network: z.string().optional().describe("Network name")
    },
    async ({ path, amountIn, amountOutMinimum, recipient, deadline, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.executeMultiHopSwap(
          path as `0x${string}`, amountIn, amountOutMinimum, recipient, deadline, network
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error executing multi-hop swap: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get pool info
  server.tool(
    "get_pool_info",
    "Get information about a DragonSwap pool",
    {
      tokenA: z.string().describe("First token address"),
      tokenB: z.string().describe("Second token address"),
      fee: z.number().describe("Fee tier"),
      network: z.string().optional().describe("Network name")
    },
    async ({ tokenA, tokenB, fee, network = DEFAULT_NETWORK }) => {
      try {
        const poolAddress = await services.getPoolAddress(tokenA, tokenB, fee, network);
        const result = await services.getPoolInfo(poolAddress, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error getting pool info: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Helper tools for calculations
  server.tool(
    "calculate_tick_range",
    "Calculate optimal tick range for liquidity provision",
    {
      currentTick: z.number().describe("Current tick of the pool"),
      tickSpacing: z.number().describe("Tick spacing for the fee tier"),
      rangeMultiplier: z.number().optional().describe("Range multiplier (default: 2)")
    },
    async ({ currentTick, tickSpacing, rangeMultiplier = 2 }) => {
      try {
        const result = services.calculateTickRange(currentTick, tickSpacing, rangeMultiplier);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error calculating tick range: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "calculate_slippage",
    "Calculate minimum amount out with slippage protection",
    {
      expectedAmount: z.string().describe("Expected output amount"),
      slippagePercent: z.number().optional().describe("Slippage tolerance percentage (default: 0.5)")
    },
    async ({ expectedAmount, slippagePercent = 0.5 }) => {
      try {
        const result = services.calculateSlippage(expectedAmount, slippagePercent);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ minAmountOut: result }, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error calculating slippage: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "create_multihop_path",
    "Create encoded path for multi-hop swaps",
    {
      tokens: z.array(z.string()).describe("Array of token addresses"),
      fees: z.array(z.number()).describe("Array of fee tiers for each hop")
    },
    async ({ tokens, fees }) => {
      try {
        const result = services.createMultiHopPath(tokens as Address[], fees);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ path: result }, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error creating multi-hop path: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Wrap Sei using DragonSwap Router
  server.tool(
    "wrap_sei",
    "Wrap SEI to WSEI token",
    {
      amount: z.string().describe("Amount of SEI to wrap (in decimal units)"),
      network: z.string().optional().describe("Network to use (sei|sei-testnet)")
    },
    async ({ amount, network = DEFAULT_NETWORK }) => {
      try {
        const txHash = await services.wrapSei(amount, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ txHash }, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error wrapping SEI: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Unwrap WSEI using DragonSwap Router
  server.tool(
    "unwrap_sei",
    "Unwrap WSEI to SEI token",
    {
      amount: z.string().describe("Amount of WSEI to unwrap (in decimal units)"),
      network: z.string().optional().describe("Network to use (sei|sei-testnet)")
    },
    async ({ amount, network = DEFAULT_NETWORK }) => {
      try {
        const txHash = await services.unwrapSei(amount, network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ txHash }, null, 2)
          }]
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `Error unwrapping WSEI: ${errorMessage}`
          }],
          isError: true
        };
      }
    }
  );

  // Get DragonSwap Token Price
  server.tool(
    "get_dragonswap_token_price",
    "Retrieves the current price of a token from a specific DragonSwap V3 pool.",
    {
      poolAddress: z.string().describe("The address of the DragonSwap pool."),
      tokenAddress: z.string().describe("The address of the token to get the price for."),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ poolAddress, tokenAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getTokenPrice(poolAddress, tokenAddress, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting token price: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get DragonSwap Swap Quote
  server.tool(
    "get_dragonswap_swap_quote",
    "Gets a quote for a single-hop swap from DragonSwap.",
    {
      amountIn: z.string().describe("The amount of the input token."),
      tokenIn: z.string().describe("The address of the input token."),
      tokenOut: z.string().describe("The address of the output token."),
      fee: z.number().optional().describe("The fee tier of the pool (e.g., 3000 for 0.3%). Defaults to 3000."),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ amountIn, tokenIn, tokenOut, fee, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getSwapQuote(amountIn, tokenIn, tokenOut, fee, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting swap quote: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get DragonSwap Multi-Hop Swap Quote
  server.tool(
    "get_dragonswap_multihop_quote",
    "Gets a quote for a multi-hop swap using an encoded path.",
    {
      amountIn: z.string().describe("The amount of the input token."),
      path: z.string().describe("The encoded path for the multi-hop swap."),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ amountIn, path, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getMultiHopSwapQuote(amountIn, path as `0x${string}`, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting multi-hop swap quote: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Convert Tick to Price
  server.tool(
    "convert_tick_to_price",
    "Converts a DragonSwap/Uniswap V3 pool tick to a human-readable price.",
    {
      tick: z.number().describe("The tick value to convert."),
      decimals0: z.number().optional().describe("Decimals of token0. Defaults to 18."),
      decimals1: z.number().optional().describe("Decimals of token1. Defaults to 18.")
    },
    async ({ tick, decimals0, decimals1 }) => {
      try {
        const result = services.tickToPrice(tick, decimals0, decimals1);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ price: result }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting tick to price: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Convert Price to Tick
  server.tool(
    "convert_price_to_tick",
    "Converts a human-readable price to a DragonSwap/Uniswap V3 pool tick.",
    {
      price: z.string().describe("The price to convert."),
      decimals0: z.number().optional().describe("Decimals of token0. Defaults to 18."),
      decimals1: z.number().optional().describe("Decimals of token1. Defaults to 18.")
    },
    async ({ price, decimals0, decimals1 }) => {
      try {
        const result = services.priceToTick(price, decimals0, decimals1);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ tick: result }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error converting price to tick: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Sort DragonSwap Tokens
  server.tool(
    "sort_dragonswap_tokens",
    "Sorts two token addresses to determine which is token0 and token1.",
    {
      tokenA: z.string().describe("The address of the first token."),
      tokenB: z.string().describe("The address of the second token.")
    },
    async ({ tokenA, tokenB }) => {
      try {
        const result = services.sortTokens(tokenA as Address, tokenB as Address);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error sorting tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get DragonSwap Tick Spacing
  server.tool(
    "get_dragonswap_tick_spacing",
    "Returns the correct tick spacing for a given DragonSwap fee tier.",
    {
      fee: z.number().describe("The fee tier (e.g., 100, 500, 3000, 10000).")
    },
    async ({ fee }) => {
      try {
        const result = services.getTickSpacing(fee);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ tickSpacing: result }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting tick spacing: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Calculate Liquidity Amounts
  server.tool(
    "calculate_liquidity_amounts",
    "Calculates the ideal amounts of two tokens to provide for liquidity based on a price range.",
    {
      amount0: z.string().describe("The amount of token0."),
      amount1: z.string().describe("The amount of token1."),
      currentPrice: z.string().describe("The current price of the pool."),
      tickLower: z.number().describe("The lower tick of the liquidity range."),
      tickUpper: z.number().describe("The upper tick of the liquidity range."),
      decimals0: z.number().optional().describe("Decimals of token0. Defaults to 18."),
      decimals1: z.number().optional().describe("Decimals of token1. Defaults to 18.")
    },
    async ({ amount0, amount1, currentPrice, tickLower, tickUpper, decimals0, decimals1 }) => {
      try {
        const result = services.calculateLiquidityAmounts(amount0, amount1, currentPrice, tickLower, tickUpper, decimals0, decimals1);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error calculating liquidity amounts: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Calculate Impermanent Loss
  server.tool(
    "calculate_impermanent_loss",
    "Calculates the potential impermanent loss for a liquidity position.",
    {
      initialPrice: z.string().describe("The price when liquidity was provided."),
      currentPrice: z.string().describe("The current price of the assets."),
      initialAmount0: z.string().describe("The initial amount of token0."),
      initialAmount1: z.string().describe("The initial amount of token1.")
    },
    async ({ initialPrice, currentPrice, initialAmount0, initialAmount1 }) => {
      try {
        const result = services.calculateImpermanentLoss(initialPrice, currentPrice, initialAmount0, initialAmount1);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error calculating impermanent loss: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Optimal Swap Route
  server.tool(
    "get_optimal_swap_route",
    "Finds the best swap route by checking different fee tiers and paths.",
    {
      tokenIn: z.string().describe("The address of the input token."),
      tokenOut: z.string().describe("The address of the output token."),
      amountIn: z.string().describe("The amount of the input token."),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ tokenIn, tokenOut, amountIn, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getOptimalSwapRoute(tokenIn, tokenOut, amountIn, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting optimal swap route: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Pool Historical Data
  server.tool(
    "get_pool_historical_data",
    "Fetches historical event data for a specific DragonSwap pool.",
    {
      poolAddress: z.string().describe("The address of the DragonSwap pool."),
      fromBlock: z.number().describe("The starting block number."),
      toBlock: z.union([z.number(), z.literal('latest')]).optional().describe("The ending block number. Defaults to 'latest'."),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ poolAddress, fromBlock, toBlock, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getPoolHistoricalData(poolAddress, fromBlock, toBlock, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, (key, value) => {
              // Convert BigInt to string for JSON serialization
              return typeof value === 'bigint' ? value.toString() : value;
            }, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting pool historical data: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
