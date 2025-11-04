import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";
import { type TransactionReceipt } from 'viem';

/**
 * Registers tools related to the Symphony DEX protocol.
 * @param server The MCP server instance
 */
export function registerSymphonyTools(server: McpServer) {
  // Get the current Symphony SDK configuration
  server.tool(
    "get_symphony_config",
    "Retrieves the current configuration of the Symphony SDK instance.",
    {},
    async () => {
      try {
        const config = await services.getSymphonyConfig();
        return {
          content: [{
            type: "text",
            text: JSON.stringify(config, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching Symphony config: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Update the Symphony SDK configuration
  server.tool(
    "set_symphony_config",
    "Updates the configuration of the shared Symphony SDK instance.",
    {
      options: z.object({
        timeout: z.number().optional().describe("Timeout for RPC calls in milliseconds."),
        chainId: z.number().optional().describe("The ID of the blockchain network."),
        chainName: z.string().optional().describe("The name of the blockchain network."),
        rpcUrl: z.string().optional().describe("The URL for the RPC endpoint."),
        nativeAddress: z.string().optional().describe("The native token address."),
        wrappedNativeAddress: z.string().optional().describe("The wrapped native token address."),
        slippage: z.string().optional().describe("The slippage tolerance percentage."),
        publicClient: z.any().optional().describe("An instance of a public client."),
        tokens: z.record(z.any()).optional().describe("A list of supported tokens."),
        additionalTokens: z.record(z.any()).optional().describe("Additional tokens to be added."),
        overrideDefaultTokens: z.boolean().optional().describe("Whether to override the default token list."),
        feeParams: z.object({
          paramFee: z.string().optional(),
          feeAddress: z.string().optional(),
          feeSharePercentage: z.string().optional(),
        }).optional().describe("Parameters for transaction fees."),
      }).optional()
    },
    async ({ options }) => {
      try {
        await services.setSymphonyConfig(options || {});
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Symphony config updated successfully."
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error updating Symphony config: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get list of available tokens on Symphony
  server.tool(
    "get_symphony_token_list",
    "Retrieves the list of all available tokens for swapping on the Symphony protocol.",
    {
    },
    async () => {
      try {
        const tokenList = await services.getSymphonyTokenList();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ tokenList, network: 'Sei Mainnet' }, null, 2),
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching Symphony token list: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Check if a token is listed on Symphony
  server.tool(
    "is_symphony_token_listed",
    "Checks if a given token address is available for swaps in the Symphony protocol.",
    {
      tokenAddress: z.string().describe("The address of the token to check."),
    },
    async ({ tokenAddress }) => {
      try {
        const isListed = await services.isSymphonyTokenListed(tokenAddress);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              tokenAddress,
              isListed,
              network: 'Sei Mainnet'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking if token is listed on Symphony: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Symphony Swap Route
  server.tool(
    "get_symphony_route",
    "Finds the best swap route for a given token pair using the Symphony protocol. Does not execute the swap.",
    {
      tokenInAddress: z.string().describe("The address of the input token. Use '0x0' for the native token (SEI)."),
      tokenOutAddress: z.string().describe("The address of the output token. Use '0x0' for the native token."),
      amount: z.string().describe("The amount of the input token to swap in human-readable units (e.g., '1.5')."),
      isRaw: z.boolean().optional().describe("If true, the input amount is treated as raw units (wei). Defaults to false."),
    },
    async ({ tokenInAddress, tokenOutAddress, amount, isRaw = false }) => {
      try {
        const route = await services.getSymphonyRoute(
          tokenInAddress,
          tokenOutAddress,
          amount,
          { isRaw }
        );

        const routeJson = JSON.stringify(route, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value, 2);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: `Route found. Expected output: ${route.amountOutFormatted}`,
              route: routeJson,
              network: 'Sei Mainnet'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error getting Symphony route: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Execute Swap on Symphony
  server.tool(
    "swap_on_symphony",
    "Swaps one token for another using the Symphony protocol.",
    {
      tokenInAddress: z.string().describe("The address of the input token. Use '0x0' for the native token (SEI)."),
      tokenOutAddress: z.string().describe("The address of the output token. Use '0x0' for the native token."),
      amount: z.string().describe("The amount of the input token to swap in human-readable units (e.g., '1.5')."),
      isRaw: z.boolean().optional().describe("If true, the input amount is treated as raw units (wei). Defaults to false."),
    },
    async ({ tokenInAddress, tokenOutAddress, amount, isRaw = false }) => {
      try {
        const swapReceipt: TransactionReceipt = await services.swapOnSymphony(
          tokenInAddress,
          tokenOutAddress,
          amount,
          { isRaw }
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              transactionHash: swapReceipt.transactionHash,
              blockNumber: swapReceipt.blockNumber.toString(),
              gasUsed: swapReceipt.gasUsed.toString(),
              status: swapReceipt.status,
              network: 'Sei Mainnet'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error executing swap on Symphony: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Execute Swap on Symphony with Advanced Parameters
  server.tool(
    "swap_on_symphony_advanced",
    "Swaps one token for another using the Symphony protocol, with optional parameters for routing and execution.",
    {
      tokenInAddress: z.string().describe("The address of the input token. Use '0x0' for the native token."),
      tokenOutAddress: z.string().describe("The address of the output token. Use '0x0' for the native token."),
      amount: z.string().describe("The amount of the input token to swap."),
      params: z.object({
        routeOptions: z.record(z.any()).optional().describe("A JSON object of options for the routing engine."),
        swapOptions: z.record(z.any()).optional().describe("A JSON object of options for the swap execution."),
        slippage: z.record(z.any()).optional().describe("A JSON object of slippage settings for the swap.")
      }).optional().describe("Optional parameters for routing, execution, and slippage.")
    },
    async ({ tokenInAddress, tokenOutAddress, amount, params = {} }) => {
      try {
        const result = await services.swapOnSymphonyAdvanced(
          tokenInAddress,
          tokenOutAddress,
          amount,
          {
            routeOptions: params.routeOptions,
            swapOptions: params.swapOptions,
            slippage: params.slippage ? {
              slippageAmount: params.slippage.slippageAmount,
              isRaw: params.slippage.isRaw || false,
              isBps: params.slippage.isBps || false,
              outTokenDecimals: params.slippage.outTokenDecimals
            } : undefined
          }
        );

        const response: Record<string, any> = {
          success: true,
          swapTransactionHash: result.swapReceipt.transactionHash,
          status: result.swapReceipt.status,
          blockNumber: result.swapReceipt.blockNumber.toString(),
        }

        if (result.approveReceipt) {
          response.approveTransactionHash = result.approveReceipt.transactionHash;
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify(response, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error executing swap on Symphony: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get Total Amount Out from Route
  server.tool(
    "get_symphony_total_amount_out",
    "Calculates the total output amount for a given route.",
    {
      tokenInAddress: z.string().describe("The address of the input token."),
      tokenOutAddress: z.string().describe("The address of the output token."),
      amount: z.string().describe("The amount of the input token for the swap."),
      options: z.record(z.any()).optional().describe("A JSON object of options for the routing engine.")
    },
    async ({ tokenInAddress, tokenOutAddress, amount, options = {} }) => {
      try {
        const totalAmountOut = await services.getSymphonyTotalAmountOut(
          tokenInAddress,
          tokenOutAddress,
          amount,
          options
        );

        const amountOutJson = JSON.stringify(totalAmountOut, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value, 2);

        return {
          content: [{
            type: "text",
            text: amountOutJson
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error calculating total amount out from route: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Check Symphony Token Approval Status
  server.tool(
    "check_symphony_approval",
    "Checks if the Symphony protocol has sufficient allowance to spend a specific token for a swap.",
    {
      tokenInAddress: z.string().describe("The address of the input token to check."),
      tokenOutAddress: z.string().describe("The address of the output token (needed to determine the route)."),
      amount: z.string().describe("The amount of the input token for the potential swap."),
      options: z.record(z.any()).optional().describe("A JSON object of options for the routing engine.")
    },
    async ({ tokenInAddress, tokenOutAddress, amount, options = {} }) => {
      try {
        const isApproved = await services.checkSymphonyApproval(
          tokenInAddress,
          tokenOutAddress,
          amount,
          options
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              isApproved: isApproved,
              message: isApproved ? "Sufficient allowance exists." : "Allowance is insufficient. Please approve the token first."
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking Symphony approval: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Approve Symphony Token for Swapping
  server.tool(
    "approve_symphony_token",
    "Approves the Symphony protocol to spend a specific token for swapping. This is a necessary step before swapping non-native tokens.",
    {
      tokenInAddress: z.string().describe("The address of the input token to approve."),
      tokenOutAddress: z.string().describe("The address of the output token (needed to determine the correct contract to approve)."),
      amount: z.string().describe("The amount of the input token to approve for spending."),
      options: z.record(z.any()).optional().describe("A JSON object of options for the routing engine.")
    },
    async ({ tokenInAddress, tokenOutAddress, amount, options }) => {
      try {
        const approvalReceipt = await services.approveSymphonyToken(
          tokenInAddress,
          tokenOutAddress,
          amount,
          options
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              message: "Approval successful.",
              transactionHash: approvalReceipt.transactionHash,
              status: approvalReceipt.status,
              blockNumber: approvalReceipt.blockNumber.toString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error giving approval to Symphony: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Generate Symphony Swap Calldata
  server.tool(
    "generate_symphony_swap_calldata",
    "Generates the transaction calldata for a swap without executing it.",
    {
      tokenInAddress: z.string().describe("The address of the input token."),
      tokenOutAddress: z.string().describe("The address of the output token."),
      amount: z.string().describe("The amount of the input token to swap."),
      options: z.record(z.any()).optional().describe("A JSON object of options for the routing engine."),
      params: z.record(z.any()).optional().describe("A JSON object of slippage settings.")
    },
    async ({ tokenInAddress, tokenOutAddress, amount, options, params }) => {
      try {
        const txData = await services.generateSymphonySwapCalldata(
          tokenInAddress,
          tokenOutAddress,
          amount,
          options,
          params
        );

        return {
          content: [{
            type: "text",
            text: JSON.stringify(txData, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error generating Symphony calldata: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}