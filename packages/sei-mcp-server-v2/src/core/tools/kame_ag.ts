import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the Kame DEX Aggregator protocol.
 * @param server The MCP server instance
 */
export function registerKameTools(server: McpServer) {
    // Get a swap quote from Kame Aggregator
    server.tool(
        "get_kame_quote",
        "Retrieves a quote for a token swap from the Kame Aggregator. This function does not execute the swap.",
        {
            fromTokenAddress: z.string().describe("The address of the input token."),
            toTokenAddress: z.string().describe("The address of the output token."),
            amount: z.string().describe("The amount of the input token to swap in human-readable units (e.g., '1.5')."),
        },
        async ({ fromTokenAddress, toTokenAddress, amount }) => {
            try {
                const [quote, outputAmount] = await services.getKameQuote(
                    fromTokenAddress,
                    toTokenAddress,
                    amount
                );

                const quoteJson = JSON.stringify(quote, (key, value) =>
                    typeof value === 'bigint' ? value.toString() : value, 2);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            message: "Kame quote retrieved successfully.",
                            quote: quoteJson,
                            outputAmount: outputAmount,
                            network: 'Sei Mainnet'
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error getting Kame quote: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Execute Swap on Kame
    server.tool(
        "swap_on_kame",
        "Executes a token swap on the Kame Aggregator.",
        {
            fromTokenAddress: z.string().describe("The address of the input token."),
            toTokenAddress: z.string().describe("The address of the output token."),
            amount: z.string().describe("The amount of the input token to swap in human-readable format (e.g., '1.5')."),
            slippage: z.number().optional().describe("Optional slippage tolerance in basis points (e.g., 50 for 0.5%). Defaults to 100 (1%)."),
        },
        async ({ fromTokenAddress, toTokenAddress, amount, slippage = 100 }) => {
            try {
                const swapReceipt = await services.executeKameSwap(
                    fromTokenAddress,
                    toTokenAddress,
                    amount,
                    slippage
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
                        text: `Error executing swap on Kame: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Generate Kame Swap Calldata
    server.tool(
        "generate_kame_swap_calldata",
        "Generates the transaction calldata for a swap without executing it.",
        {
            fromTokenAddress: z.string().describe("The address of the input token."),
            toTokenAddress: z.string().describe("The address of the output token."),
            amount: z.string().describe("The amount of the input token to swap."),
        },
        async ({ fromTokenAddress, toTokenAddress, amount }) => {
            try {
                const txData = await services.generateKameSwapCalldata(
                    fromTokenAddress,
                    toTokenAddress,
                    amount
                );

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(txData, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error generating Kame calldata: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get Kame Token List
    server.tool(
        "get_kame_token_list",
        "Retrieves a list of tokens from the Kame Aggregator. Can fetch all tokens, specific tokens by ID, or search for tokens.",
        {
            ids: z.array(z.string()).optional().describe("An array of token IDs to fetch specifically."),
            cursor: z.number().optional().describe("The cursor for pagination."),
            count: z.number().optional().describe("The number of tokens to return per page."),
            pattern: z.string().optional().describe("A search pattern to filter tokens by name or symbol."),
        },
        async ({ ids, cursor, count, pattern }) => {
            try {
                const tokens = await services.getKameTokens({ ids, cursor, count, pattern });

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            count: tokens.length,
                            tokens: tokens
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Kame token list: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get Kame Token Prices
    server.tool(
        "get_kame_prices",
        "Retrieves token prices from the Kame Aggregator. Can fetch all prices or prices for specific token IDs.",
        {
            ids: z.array(z.string()).optional().describe("An array of token IDs to fetch prices for."),
        },
        async ({ ids }) => {
            try {
                const prices = await services.getKamePrices({ ids });

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            prices: prices
                        }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Kame token prices: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );
}