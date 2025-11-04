import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";

/**
 * Registers tools related to the SeiTrace API.
 * @param server The MCP server instance
 */
export function registerSeiTraceTools(server: McpServer) {
    /**
     * A helper function to handle the boilerplate of making a SeiTrace API call
     * and formatting the response or error for the MCP server.
     * @param serviceCall The promise returned by the service function.
     * @param errorHandler A function to format the error message.
     * @returns A promise that resolves to a valid tool result.
     */
    const handleSeiTraceRequest = async (serviceCall: Promise<any>, errorHandler: (e: any) => string) => {
        try {
            const result = await serviceCall;
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error) {
            return {
                content: [{
                    type: "text" as const,
                    text: errorHandler(error)
                }],
                isError: true
            };
        }
    };

    // Get Address Details
    server.tool(
        "seitrace_get_address_details",
        "Get details for a specific address from SeiTrace.",
        {
            network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to 'sei'."),
            address: z.string().describe("Wallet address (EVM or Sei address)")
        },
        ({ network = DEFAULT_NETWORK, address }) => handleSeiTraceRequest(
            services.getAddressDetails(network, address),
            (e) => `Error getting address details: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get Smart Contract Details
    server.tool(
        "seitrace_get_smart_contract_details",
        "Get details for a smart contract from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Smart contract address")
        },
        ({ network = DEFAULT_NETWORK, address }) => handleSeiTraceRequest(
            services.getSmartContractDetails(network, address),
            (e) => `Error getting smart contract details: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get Address Transactions
    server.tool(
        "seitrace_get_address_transactions",
        "Get transactions for a specific address from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            status: z.enum(["ALL", "SUCCESS", "ERROR"]).optional().describe("Transaction status"),
            limit: z.number().optional().describe("Limit of items to be returned"),
            offset: z.number().optional().describe("Offset"),
            from_date: z.string().optional().describe("From date (YYYY-MM-DD)"),
            to_date: z.string().optional().describe("To date (YYYY-MM-DD)")
        },
        ({ network = DEFAULT_NETWORK, address, status = "ALL", ...options }) => handleSeiTraceRequest(
            services.getAddressTransactions(network, address, status, options),
            (e) => `Error getting address transactions: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get Token Transfers
    server.tool(
        "seitrace_get_address_token_transfers",
        "Get all types of token transfers for a specific address.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            from_date: z.string().optional(),
            to_date: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, address, ...options }) => handleSeiTraceRequest(
            services.getAddressTokenTransfers(network, address, options),
            (e) => `Error getting address token transfers: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // --- Token Info Tools ---
    
    // Get ERC20 Token Info
    server.tool(
        "seitrace_get_erc20_token_info",
        "Get information about an ERC20 token from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address")
        },
        ({ network = DEFAULT_NETWORK, contract_address }) => handleSeiTraceRequest(
            services.getErc20TokenInfo(network, contract_address),
            (e) => `Error getting ERC20 token info: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get ERC721 Token Info
    server.tool(
        "seitrace_get_erc721_token_info",
        "Get information about an ERC721 token from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address")
        },
        ({ network = DEFAULT_NETWORK, contract_address }) => handleSeiTraceRequest(
            services.getErc721TokenInfo(network, contract_address),
            (e) => `Error getting ERC721 token info: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get ERC1155 Token Info
    server.tool(
        "seitrace_get_erc1155_token_info",
        "Get information about an ERC1155 token from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address")
        },
        ({ network = DEFAULT_NETWORK, contract_address }) => handleSeiTraceRequest(
            services.getErc1155TokenInfo(network, contract_address),
            (e) => `Error getting ERC1155 token info: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // Get Native Token Info
    server.tool(
        "seitrace_get_native_token_info",
        "Get information about a native token from SeiTrace.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            token_denom: z.string().optional().describe("Native token denom")
        },
        ({ network = DEFAULT_NETWORK, token_denom = "usei" }) => handleSeiTraceRequest(
            services.getNativeTokenInfo(network, token_denom),
            (e) => `Error getting native token info: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // --- Token Instance Tools ---

    server.tool(
        "seitrace_get_erc721_instances",
        "Get instances of an ERC721 token collection.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_id: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc721Instances(network, contract_address, options),
            (e) => `Error getting ERC721 instances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc1155_instances",
        "Get instances of an ERC1155 token collection.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_id: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc1155Instances(network, contract_address, options),
            (e) => `Error getting ERC1155 instances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // --- Balance Tools ---

    server.tool(
        "seitrace_get_erc20_balances",
        "Get ERC20 token balances for a wallet address.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_contract_list: z.array(z.string()).optional()
        },
        ({ network = DEFAULT_NETWORK, address, ...options }) => handleSeiTraceRequest(
            services.getErc20Balances(network, address, options),
            (e) => `Error getting ERC20 balances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc721_balances",
        "Get ERC721 token balances for a wallet address.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_contract_list: z.array(z.string()).optional()
        },
        ({ network = DEFAULT_NETWORK, address, ...options }) => handleSeiTraceRequest(
            services.getErc721Balances(network, address, options),
            (e) => `Error getting ERC721 balances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc1155_balances",
        "Get ERC1155 token balances for a wallet address.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_contract_list: z.array(z.string()).optional()
        },
        ({ network = DEFAULT_NETWORK, address, ...options }) => handleSeiTraceRequest(
            services.getErc1155Balances(network, address, options),
            (e) => `Error getting ERC1155 balances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_native_balances",
        "Get native token balances for a wallet address.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            address: z.string().describe("Wallet address"),
            limit: z.number().optional(),
            offset: z.number().optional(),
            token_denom_list: z.array(z.string()).optional()
        },
        ({ network = DEFAULT_NETWORK, address, ...options }) => handleSeiTraceRequest(
            services.getNativeBalances(network, address, options),
            (e) => `Error getting native balances: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // --- Transfer Tools ---

    server.tool(
        "seitrace_get_erc20_token_transfers",
        "Get ERC20 token transfers for a contract.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
            from_date: z.string().optional(),
            to_date: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc20TokenTransfers(network, contract_address, options),
            (e) => `Error getting ERC20 transfers: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc721_token_transfers",
        "Get ERC721 token transfers for a contract.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
            from_date: z.string().optional(),
            to_date: z.string().optional(),
            token_id: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc721TokenTransfers(network, contract_address, options),
            (e) => `Error getting ERC721 transfers: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc1155_token_transfers",
        "Get ERC1155 token transfers for a contract.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
            from_date: z.string().optional(),
            to_date: z.string().optional(),
            token_id: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc1155TokenTransfers(network, contract_address, options),
            (e) => `Error getting ERC1155 transfers: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_native_token_transfers",
        "Get native token transfers for a denom.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            token_denom: z.string().optional().describe("Native token denom"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
            from_date: z.string().optional(),
            to_date: z.string().optional()
        },
        ({ network = DEFAULT_NETWORK, token_denom = "usei", ...options }) => handleSeiTraceRequest(
            services.getNativeTokenTransfers(network, token_denom, options),
            (e) => `Error getting native token transfers: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    // --- Holder Tools ---

    server.tool(
        "seitrace_get_erc20_token_holders",
        "Get holders of an ERC20 token.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            limit: z.number().optional(),
            offset: z.number().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc20TokenHolders(network, contract_address, options),
            (e) => `Error getting ERC20 holders: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc721_token_holders",
        "Get holders of an ERC721 token.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc721TokenHolders(network, contract_address, options),
            (e) => `Error getting ERC721 holders: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_erc1155_token_holders",
        "Get holders of an ERC1155 token.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            contract_address: z.string().describe("Token contract address"),
            wallet_address: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional()
        },
        ({ network = DEFAULT_NETWORK, contract_address, ...options }) => handleSeiTraceRequest(
            services.getErc1155TokenHolders(network, contract_address, options),
            (e) => `Error getting ERC1155 holders: ${e instanceof Error ? e.message : String(e)}`
        )
    );

    server.tool(
        "seitrace_get_native_token_holders",
        "Get holders of a native token.",
        {
            network: z.string().optional().describe("Network name. Defaults to 'sei'."),
            token_denom: z.string().optional().describe("Native token denom"),
            limit: z.number().optional(),
            offset: z.number().optional()
        },
        ({ network = DEFAULT_NETWORK, token_denom = "usei", ...options }) => handleSeiTraceRequest(
            services.getNativeTokenHolders(network, token_denom, options),
            (e) => `Error getting native token holders: ${e instanceof Error ? e.message : String(e)}`
        )
    );
}
