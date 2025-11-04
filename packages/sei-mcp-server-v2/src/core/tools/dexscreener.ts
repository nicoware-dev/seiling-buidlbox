import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the DexScreener API.
 * @param server The MCP server instance
 */
export function registerDexScreenerTools(server: McpServer) {
  // Search Pairs Tool
  server.tool(
    "dex_search_pairs",
    "Search for token pairs on DexScreener by token name, symbol, or address.",
    {
      query: z.string().describe("Search query (token name, symbol, or contract address)")
    },
    async ({ query }) => {
      try {
        const result = await services.searchPairs(query);
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
            text: `Error searching pairs: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Token Pairs Tool
  server.tool(
    "dex_get_token_pairs",
    "Get all pairs for specific token addresses on DexScreener.",
    {
      tokenAddresses: z.array(z.string()).describe("Array of token contract addresses")
    },
    async ({ tokenAddresses }) => {
      try {
        const result = await services.getTokenPairs(tokenAddresses);
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
            text: `Error getting token pairs: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Pairs by Addresses Tool
  server.tool(
    "dex_get_pairs_by_address",
    "Get pair information by specific pair address on DexScreener.",
    {
      chainId: z.string().describe("Chain ID (e.g., 'ethereum', 'bsc', 'polygon', 'sei')"),
      pairAddress: z.string().describe("Pair contract address")
    },
    async ({ chainId, pairAddress }) => {
      try {
        const result = await services.getPairsByAddress(chainId, pairAddress);
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
            text: `Error getting pairs by addresses: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Token Profile Tool
  server.tool(
    "dex_get_token_profile",
    "Get token profile information including description and links from DexScreener.",
    {
      chainId: z.string().describe("Chain ID (e.g., 'ethereum', 'bsc', 'polygon', 'sei')"),
      tokenAddress: z.string().describe("Token contract address")
    },
    async ({ chainId, tokenAddress }) => {
      try {
        const result = await services.getTokenProfile(chainId, tokenAddress);
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
            text: `Error getting token profile: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Latest Token Profiles Tool (Replacement for trending/latest pairs)
  server.tool(
    "dex_get_latest_token_profiles",
    "Get recently updated token profiles from DexScreener. This provides information about tokens with recent activity.",
    {},
    async () => {
      try {
        const result = await services.getLatestTokenProfiles();
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
            text: `Error getting latest token profiles: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Top Boosted Tokens Tool
  server.tool(
    "dex_get_top_boosted_tokens",
    "Get top boosted tokens on DexScreener. These are tokens that have been promoted by their communities.",
    {},
    async () => {
      try {
        const result = await services.getTopBoostedTokens();
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
            text: `Error getting top boosted tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Orders by Chain Tool (Alternative to trending pairs)
  server.tool(
    "dex_get_orders_by_chain",
    "Get trading orders/activity by chain on DexScreener. This provides information about active trading pairs on a specific blockchain.",
    {
      chainId: z.string().describe("Chain ID (e.g., 'ethereum', 'bsc', 'polygon', 'arbitrum', 'base')"),
      tokenAddress: z.string().describe("Token contract address")
    },
    async ({ chainId, tokenAddress }) => {
      try {
        const result = await services.getOrdersByChain(chainId, tokenAddress);
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
            text: `Error getting orders by chain: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Trending-like Data Tool (Alternative approach for trending tokens)
  server.tool(
    "dex_get_trending_like_data",
    "Get trending-like data by searching for popular tokens. This is an alternative to get data about popular tokens since DexScreener doesn't provide direct trending endpoints.",
    {
      searchTerms: z.array(z.string()).optional().default(['ETH', 'BTC', 'USDC']).describe("Array of search terms for popular tokens (default: ['ETH', 'BTC', 'USDC'])")
    },
    async ({ searchTerms }) => {
      try {
        const result = await services.getTrendingLikeData(searchTerms);
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
            text: `Error getting trending-like data: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Advanced Search Tool
  server.tool(
    "dex_advanced_search",
    "Perform advanced search for tokens with specific criteria. Useful for finding tokens by multiple search terms or filtering results.",
    {
      queries: z.array(z.string()).describe("Array of search queries to find tokens"),
      limit: z.number().optional().default(5).describe("Maximum number of pairs to return per query (default: 5)")
    },
    async ({ queries, limit }) => {
      try {
        const results = [];
        
        for (const query of queries) {
          const result = await services.searchPairs(query);
          
          // Limit results per query
          if (result.pairs && result.pairs.length > limit) {
            result.pairs = result.pairs.slice(0, limit);
          }
          
          results.push({
            query,
            result
          });
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(results, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error in advanced search: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Multi-Chain Token Data Tool
  server.tool(
    "dex_get_multi_chain_token_data",
    "Get token pair data across multiple chains for the same token contract addresses.",
    {
      tokenAddresses: z.array(z.string()).describe("Array of token contract addresses"),
      maxPairsPerToken: z.number().optional().default(10).describe("Maximum number of pairs to return per token (default: 10)")
    },
    async ({ tokenAddresses, maxPairsPerToken }) => {
      try {
        const result = await services.getTokenPairs(tokenAddresses);
        
        // Group pairs by token and limit results
        const groupedResults: Record<string, services.DexPair[]> = {};
        
        if (result.pairs) {
          for (const pair of result.pairs) {
            const tokenAddr = pair.baseToken.address;
            if (!groupedResults[tokenAddr]) {
              groupedResults[tokenAddr] = [];
            }
            
            if (groupedResults[tokenAddr].length < maxPairsPerToken) {
              groupedResults[tokenAddr].push(pair);
            }
          }
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              schemaVersion: result.schemaVersion,
              groupedPairs: groupedResults,
              totalPairs: result.pairs?.length || 0
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting multi-chain token data: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
