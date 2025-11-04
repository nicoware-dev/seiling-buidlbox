import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the deBridge Liquidity Network (DLN) protocol.
 * @param server The MCP server instance
 */
export function registerDebridgeTools(server: McpServer) {
  /**
   * Tool to create a deBridge cross-chain order.
   * This is a dual-purpose tool that follows the recommended deBridge API pattern.
   * - If called without wallet addresses, it returns an estimation only.
   * - If called with wallet addresses, it returns a complete, signable transaction object.
   */
  server.tool(
    "create_debridge_order",
    "Creates a deBridge cross-chain order. Provides an estimation and, if all wallet details are provided, a transaction to sign.",
    {
      srcChainId: z.number().describe("The ID of the source chain (e.g., 56 for BSC)."),
      srcChainTokenIn: z.string().describe("The address of the token to send from the source chain."),
      srcChainTokenInAmount: z.string().describe("The amount of the source token to send (in wei)."),
      dstChainId: z.number().describe("The ID of the destination chain (e.g., 1329 for Sei)."),
      dstChainTokenOut: z.string().describe("The address of the token to receive on the destination chain."),
      // The following addresses are optional for estimation but required to receive a transaction object.
      dstChainTokenOutRecipient: z.string().optional().describe("Required for a transaction. The wallet address to receive the funds on the destination chain."),
      srcChainOrderAuthorityAddress: z.string().optional().describe("Required for a transaction. The user's wallet address on the source chain."),
      dstChainOrderAuthorityAddress: z.string().optional().describe("Required for a transaction. The user's wallet address on the destination chain."),
    },
    async (params) => {
      try {
        const result = await services.createDebridgeTx(
          params.srcChainId,
          params.srcChainTokenIn,
          params.srcChainTokenInAmount,
          params.dstChainId,
          params.dstChainTokenOut,
          params.dstChainTokenOutRecipient,
          params.srcChainOrderAuthorityAddress,
          params.dstChainOrderAuthorityAddress
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
          content: [{ type: "text", text: `Error creating deBridge order: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to create and execute a deBridge cross-chain order.
   * This is a full-service tool that handles fetching the transaction data
   * from the deBridge API and sending it to the blockchain.
   */
  server.tool(
    "create_and_execute_debridge_order",
    "Creates and executes a deBridge cross-chain order, returning the transaction hash.",
    {
      srcChainId: z.number().int().describe("The ID of the source chain (e.g., 56 for BSC)."),
      srcChainTokenIn: z.string().describe("The address of the token to send from the source chain."),
      srcChainTokenInAmount: z.string().describe("The amount of the source token to send (in wei)."),
      dstChainId: z.number().int().describe("The ID of the destination chain (e.g., 1329 for Sei)."),
      dstChainTokenOut: z.string().describe("The address of the token to receive on the destination chain."),
    },
    async (params) => {
      try {
        const result = await services.createDebridgeOrder(
          params.srcChainId,
          params.srcChainTokenIn,
          params.srcChainTokenInAmount,
          params.dstChainId,
          params.dstChainTokenOut,
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ txHash: result }, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error executing deBridge order: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to get a deBridge quote using human-readable chain names.
   * This provides an estimation without requiring wallet connection details.
   * IMPORTANT: This tool is for development and display purposes only.
   * It is an anti-pattern for production transaction flows.
   */
  server.tool(
    "get_debridge_quote_by_name",
    "Gets a deBridge quote using chain names (e.g., 'sei', 'ethereum'). FOR DEVELOPMENT USE ONLY.",
    {
      srcChain: z.string().describe("The name of the source chain (e.g., 'ethereum')."),
      srcChainTokenIn: z.string().describe("The address of the token to send from the source chain."),
      srcChainTokenInAmount: z.string().describe("The amount of the source token to send (in wei)."),
      dstChain: z.string().describe("The name of the destination chain (e.g., 'sei')."),
      dstChainTokenOut: z.string().describe("The address of the token to receive on the destination chain."),
    },
    async (params) => {
      try {
        const result = await services.getDebridgeQuote(
          params.srcChain,
          params.srcChainTokenIn,
          params.srcChainTokenInAmount,
          params.dstChain,
          params.dstChainTokenOut
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
          content: [{ type: "text", text: `Error getting deBridge quote: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to retrieve a list of historical deBridge orders for a given wallet address (maker).
   * Allows for advanced filtering based on order status, chains, and pagination.
   */
  server.tool(
    "get_debridge_orders_by_wallet",
    "Retrieves a list of historical deBridge orders for a given wallet address (maker), with optional filters.",
    {
      address: z.string().describe("The wallet address of the order creator (maker or user address)."),
      orderStates: z.array(z.string()).optional().describe("Filter by order states (e.g., ['Created', 'Fulfilled', 'SentUnlock', 'ClaimedUnlock'])."),
      giveChainIds: z.array(z.number().int()).optional().describe("Filter by source chain IDs (e.g., [1, 56] for Ethereum and BSC)."),
      takeChainIds: z.array(z.number().int()).optional().describe("Filter by destination chain IDs (e.g., [1329, 137] for Sei and Polygon)."),
      skip: z.number().int().optional().describe("Number of orders to skip for pagination."),
      take: z.number().int().optional().describe("Maximum number of orders to return (page size).")
    },
    async (params) => {
      if (params.take === undefined) {
        params.take = 10;
      }
      try {
        const result = await services.getDebridgeOrdersByWallet(params);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting deBridge orders: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to retrieve the details of a deBridge order by its creation transaction hash.
   */
  server.tool(
    "get_debridge_order_by_tx_hash",
    "Retrieves the details of a deBridge order by its creation transaction hash.",
    {
      txHash: z.string().describe("The transaction hash of the order creation."),
    },
    async (params) => {
      try {
        const result = await services.getDebridgeOrderByTxHash(params.txHash);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting deBridge order: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to retrieve all deBridge order IDs created in a single transaction.
   */
  server.tool(
    "get_debridge_order_ids_by_tx_hash",
    "Retrieves all deBridge order IDs created in a single transaction.",
    {
      txHash: z.string().describe("The transaction hash to query for its created order IDs."),
    },
    async (params) => {
      try {
        const result = await services.getDebridgeOrderIdsByTxHash(params.txHash);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting deBridge order IDs: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to retrieve the status and details of a specific deBridge order by its ID.
   */
  server.tool(
    "get_debridge_order_status_by_id",
    "Retrieves the status and details of a specific deBridge order by its ID.",
    {
      orderId: z.string().describe("The order ID of the deBridge order."),
    },
    async (params) => {
      try {
        const result = await services.getDebridgeOrderStatus(params.orderId);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting deBridge order status: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to initiate and execute the cancellation of an unfulfilled deBridge order.
   * This fetches a cancellation transaction from the deBridge API and executes it.
   */
  server.tool(
    "cancel_debridge_order",
    "Initiates and executes the cancellation of an unfulfilled deBridge order.",
    {
      orderId: z.string().describe("The ID of the deBridge order to cancel."),
    },
    async (params) => {
      try {
        const result = await services.cancelDebridgeOrder(params.orderId);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ txHash: result }, null, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error canceling deBridge order: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );
}