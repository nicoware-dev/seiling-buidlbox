import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the Li.Fi protocol.
 * @param server The MCP server instance
 */
export function registerLifiTools(server: McpServer) {
  /**
   * Tool to get a Li.Fi cross-chain quote.
   * This provides an estimation for a swap, including the transaction data
   * that would be needed for execution.
   */
  server.tool(
    "get_lifi_quote",
    "Gets a cross-chain swap quote from Li.Fi, including transaction details.",
    {
      fromChainId: z.number().int().describe("The ID of the source chain (e.g., 1 for Ethereum)."),
      toChainId: z.number().int().describe("The ID of the destination chain (e.g., 1329 for Sei)."),
      fromTokenAddress: z.string().describe("The address of the token to send from the source chain."),
      toTokenAddress: z.string().describe("The address of the token to receive on the destination chain."),
      fromAmount: z.string().describe("The amount of the source token to send."),
    },
    async (params) => {
      try {
        const result = await services.getLifiQuote(
          params.fromChainId,
          params.toChainId,
          params.fromTokenAddress,
          params.toTokenAddress,
          params.fromAmount
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting Li.Fi quote: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to get a Li.Fi cross-chain route.
   * This provides all the routes avalilabe for the swap
   */
  server.tool(
    "get_lifi_route",
    "Gets a cross-chain swap route from Li.Fi, including transaction details.",
    {
      fromChainId: z.number().int().describe("The ID of the source chain (e.g., 1 for Ethereum)."),
      toChainId: z.number().int().describe("The ID of the destination chain (e.g., 1329 for Sei)."),
      fromTokenAddress: z.string().describe("The address of the token to send from the source chain."),
      toTokenAddress: z.string().describe("The address of the token to receive on the destination chain."),
      fromAmount: z.string().describe("The amount of the source token to send."),
    },
    async (params) => {
      try {
        const result = await services.getLifiRoute(
          params.fromChainId,
          params.toChainId,
          params.fromTokenAddress,
          params.toTokenAddress,
          params.fromAmount
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting Li.Fi quote: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to create and execute a Li.Fi cross-chain swap.
   * This is a full-service tool that handles getting a route and executing the transaction.
   */
  server.tool(
    "create_and_execute_lifi_order",
    "Creates and executes a Li.Fi cross-chain swap, returning the executed route details.",
    {
      fromChainId: z.number().int().describe("The ID of the source chain (e.g., 1 for Ethereum)."),
      toChainId: z.number().int().describe("The ID of the destination chain (e.g., 1329 for Sei)."),
      fromTokenAddress: z.string().describe("The address of the token to send from the source chain."),
      toTokenAddress: z.string().describe("The address of the token to receive on the destination chain."),
      fromAmount: z.string().describe("The amount of the source token to send."),
    },
    async (params) => {
      try {
        const result = await services.createLifiOrder(
          params.fromChainId,
          params.toChainId,
          params.fromTokenAddress,
          params.toTokenAddress,
          params.fromAmount
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error executing Li.Fi order: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to fetch all EVM chains supported by the LI.FI SDK.
   */
  server.tool(
    "get_lifi_chains",
    "Fetches all EVM chains supported by the LI.FI SDK.",
    {},
    async () => {
      try {
        const result = await services.getLifiChains();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error fetching Li.Fi chains: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to fetch details for a specific token on a given chain using lifi sdk.
   */
  server.tool(
    "get_lifi_token",
    "Fetches details for a specific token on a given chain using lifi sdk.",
    {
      chainId: z.number().int().describe("The ID of the chain where the token exists."),
      tokenAddress: z.string().describe("The contract address of the token."),
    },
    async (params) => {
      try {
        const result = await services.getLifiToken(params.chainId, params.tokenAddress);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error fetching Li.Fi token details: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );
}
