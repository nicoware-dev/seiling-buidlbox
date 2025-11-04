import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the Hive Intelligence API.
 * @param {McpServer} server The MCP server instance.
 */
export function registerHiveIntelligenceTools(server: McpServer) {
    server.tool(
        "search_hive_intelligence",
        "Sends a natural language prompt to the Hive Intelligence API to retrieve blockchain data like wallet holdings, transaction history, and token information.",
        {
            prompt: z.string().describe("The natural language query for the API. For example: 'What are the holdings in my wallet 0x... on Sei chain?'"),
        },
        async ({ prompt }) => {
            try {
                const result = await services.fetchHiveResults(prompt);

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
                        text: `Error fetching Hive Intelligence results: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );
}
