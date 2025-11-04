import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the CoinGecko API.
 * @param server The MCP server instance
 */
export function registerCoinGeckoTools(server: McpServer) {
  // Get Token Price Tool
  server.tool(
    "get_token_price",
    "Gets current price and market data for a token from CoinGecko.",
    {
      tokenId: z.string().describe("CoinGecko token ID (e.g., 'bitcoin', 'ethereum', 'sei-network')"),
      vsCurrency: z.string().optional().default('usd').describe("Currency to get price in (default: usd)"),
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ tokenId, vsCurrency, apiKey, isPro }) => {
      try {
        const result = await services.getTokenPriceCoinGecko(tokenId, vsCurrency, { apiKey, isPro });
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

  // Get Token Historical Data Tool
  server.tool(
    "get_token_historical_data",
    "Gets historical price data for a token from CoinGecko.",
    {
      tokenId: z.string().describe("CoinGecko token ID"),
      vsCurrency: z.string().optional().default('usd').describe("Currency for price data"),
      days: z.number().optional().default(30).describe("Number of days of historical data (1-365)"),
      interval: z.enum(['minutely', 'hourly', 'daily']).optional().describe("Data interval (minutely for 1 day, hourly for 90 days, daily for above 90 days)"),
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ tokenId, vsCurrency, days, interval, apiKey, isPro }) => {
      try {
        const result = await services.getTokenHistoricalData(tokenId, vsCurrency, days, interval, { apiKey, isPro });
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
            text: `Error getting historical data: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Search Tokens Tool
  server.tool(
    "search_tokens",
    "Searches for tokens on CoinGecko by name or symbol.",
    {
      query: z.string().describe("Search query (token name or symbol)"),
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ query, apiKey, isPro }) => {
      try {
        const result = await services.searchTokens(query, { apiKey, isPro });
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
            text: `Error searching tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Trending Tokens Tool
  server.tool(
    "get_trending_tokens",
    "Gets currently trending tokens from CoinGecko.",
    {
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ apiKey, isPro }) => {
      try {
        const result = await services.getTrendingTokens({ apiKey, isPro });
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
            text: `Error getting trending tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Token by Contract Address Tool
  server.tool(
    "get_token_by_contract",
    "Gets token information by contract address from CoinGecko.",
    {
      platformId: z.string().describe("Platform ID (e.g., 'ethereum', 'binance-smart-chain', 'polygon-pos')"),
      contractAddress: z.string().describe("Token contract address"),
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ platformId, contractAddress, apiKey, isPro }) => {
      try {
        const result = await services.getTokenByContract(platformId, contractAddress, { apiKey, isPro });
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
            text: `Error getting token by contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Multiple Token Prices Tool
  server.tool(
    "get_multiple_token_prices",
    "Gets current prices for multiple tokens from CoinGecko.",
    {
      tokenIds: z.array(z.string()).describe("Array of CoinGecko token IDs"),
      vsCurrency: z.string().optional().default('usd').describe("Currency to get prices in"),
      includeMarketCap: z.boolean().optional().default(false).describe("Include market cap data"),
      include24hrChange: z.boolean().optional().default(false).describe("Include 24hr price change data"),
      apiKey: z.string().optional().describe("CoinGecko Pro API key (optional)"),
      isPro: z.boolean().optional().default(false).describe("Use CoinGecko Pro API endpoint")
    },
    async ({ tokenIds, vsCurrency, includeMarketCap, include24hrChange, apiKey, isPro }) => {
      try {
        const result = await services.getMultipleTokenPrices(tokenIds, vsCurrency, includeMarketCap, include24hrChange, { apiKey, isPro });
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
            text: `Error getting multiple token prices: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
