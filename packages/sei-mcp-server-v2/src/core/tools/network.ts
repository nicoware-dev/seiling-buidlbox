import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupportedNetworks, getRpcUrl, DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";
import { type Address, type Hash } from 'viem';

/**
 * Registers tools related to network information, blocks, and core EVM interactions.
 * @param server The MCP server instance
 */
export function registerNetworkTools(server: McpServer) {
  // Get chain information
  server.tool(
    "get_chain_info",
    "Get information about Sei network",
    {
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet', etc.) or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ network = DEFAULT_NETWORK }) => {
      try {
        const chainId = await services.getChainId(network);
        const blockNumber = await services.getBlockNumber(network);
        const rpcUrl = getRpcUrl(network);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              network,
              chainId,
              blockNumber: blockNumber.toString(),
              rpcUrl
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching chain info: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get supported networks
  server.tool(
    "get_supported_networks",
    "Get a list of supported EVM networks",
    {},
    async () => {
      try {
        const networks = getSupportedNetworks();
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ supportedNetworks: networks }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching supported networks: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get block by number
  server.tool(
    "get_block_by_number",
    "Get a block by its block number",
    {
      blockNumber: z.number().describe("The block number to fetch"),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ blockNumber, network = DEFAULT_NETWORK }) => {
      try {
        const block = await services.getBlockByNumber(blockNumber, network);
        return {
          content: [{
            type: "text",
            text: services.helpers.formatJson(block)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching block ${blockNumber}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get latest block
  server.tool(
    "get_latest_block",
    "Get the latest block from the EVM",
    {
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ network = DEFAULT_NETWORK }) => {
      try {
        const block = await services.getLatestBlock(network);
        return {
          content: [{
            type: "text",
            text: services.helpers.formatJson(block)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching latest block: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get transaction by hash
  server.tool(
    "get_transaction",
    "Get detailed information about a specific transaction by its hash. Includes sender, recipient, value, data, and more.",
    {
      txHash: z.string().describe("The transaction hash to look up (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet', etc.) or chain ID. Defaults to Sei mainnet.")
    },
    async ({ txHash, network = DEFAULT_NETWORK }) => {
      try {
        const tx = await services.getTransaction(txHash as Hash, network);
        return {
          content: [{
            type: "text",
            text: services.helpers.formatJson(tx)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching transaction ${txHash}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get transaction receipt
  server.tool(
    "get_transaction_receipt",
    "Get a transaction receipt by its hash",
    {
      txHash: z.string().describe("The transaction hash to look up"),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ txHash, network = DEFAULT_NETWORK }) => {
      try {
        const receipt = await services.getTransactionReceipt(txHash as Hash, network);
        return {
          content: [{
            type: "text",
            text: services.helpers.formatJson(receipt)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching transaction receipt ${txHash}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Estimate gas
  server.tool(
    "estimate_gas",
    "Estimate the gas cost for a transaction",
    {
      to: z.string().describe("The recipient address"),
      value: z.string().optional().describe("The amount of Sei to send (e.g., '0.1')"),
      data: z.string().optional().describe("The transaction data as a hex string"),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ to, value, data, network = DEFAULT_NETWORK }) => {
      try {
        const params: any = { to: to as Address };
        if (value) params.value = services.helpers.parseEther(value);
        if (data) params.data = data as `0x${string}`;
        const gas = await services.estimateGas(params, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ network, estimatedGas: gas.toString() }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error estimating gas: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Check if address is a contract
  server.tool(
    "is_contract",
    "Check if an address is a smart contract or an externally owned account (EOA)",
    {
      address: z.string().describe("The wallet or contract address to check (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet', etc.) or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ address, network = DEFAULT_NETWORK }) => {
      try {
        const isContract = await services.isContract(address, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              network,
              isContract,
              type: isContract ? "Contract" : "Externally Owned Account (EOA)"
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking if address is a contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Read contract
  server.tool(
    "read_contract",
    "Read data from a smart contract by calling a view/pure function. This doesn't modify blockchain state and doesn't require gas or signing.",
    {
      contractAddress: z.string().describe("The address of the smart contract to interact with"),
      abi: z.array(z.any()).describe("The ABI (Application Binary Interface) of the smart contract function, as a JSON array"),
      functionName: z.string().describe("The name of the function to call on the contract (e.g., 'balanceOf')"),
      args: z.array(z.any()).optional().describe("The arguments to pass to the function, as an array (e.g., ['0x1234...'])"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ contractAddress, abi, functionName, args = [], network = DEFAULT_NETWORK }) => {
      try {
        const parsedAbi = typeof abi === 'string' ? JSON.parse(abi) : abi;
        const params = { address: contractAddress as Address, abi: parsedAbi, functionName, args };
        const result = await services.readContract(params, network);
        return {
          content: [{
            type: "text",
            text: services.helpers.formatJson(result)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error reading contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Write to contract
  server.tool(
    "write_contract",
    "Write data to a smart contract by calling a state-changing function. This modifies blockchain state and requires gas payment and transaction signing.",
    {
      contractAddress: z.string().describe("The address of the smart contract to interact with"),
      abi: z.array(z.any()).describe("The ABI (Application Binary Interface) of the smart contract function, as a JSON array"),
      functionName: z.string().describe("The name of the function to call on the contract (e.g., 'transfer')"),
      args: z.array(z.any()).describe("The arguments to pass to the function, as an array (e.g., ['0x1234...', '1000000000000000000'])"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ contractAddress, abi, functionName, args, network = DEFAULT_NETWORK }) => {
      try {
        const parsedAbi = typeof abi === 'string' ? JSON.parse(abi) : abi;
        const contractParams: Record<string, any> = { address: contractAddress as Address, abi: parsedAbi, functionName, args };
        const txHash = await services.writeContract(contractParams, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ network, transactionHash: txHash, message: "Contract write transaction sent successfully" }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error writing to contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}

