import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";
import { type Address } from 'viem';
import { getPrivateKeyAsHex } from "../config.js";

/**
 * Registers tools related to tokens (native, ERC20, ERC721, ERC1155).
 * @param server The MCP server instance
 */
export function registerTokenTools(server: McpServer) {
  // Get Sei balance
  server.tool(
    "get_balance",
    "Get the native token balance (Sei) for an address",
    {
      address: z.string().describe("The wallet address name (e.g., '0x1234...') to check the balance for"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet', etc.) or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ address, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getBalance(address, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              network,
              wei: balance.wei.toString(),
              ether: balance.sei
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching balance: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC20 token balance
  server.tool(
    "get_erc20_balance",
    "Get the ERC20 token balance of an EVM address",
    {
      address: z.string().describe("The EVM address to check"),
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ address, tokenAddress, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getERC20Balance(
          tokenAddress as Address,
          address as Address,
          network
        );
    
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              tokenAddress,
              network,
              balance: {
                raw: balance.raw.toString(),
                formatted: balance.formatted,
                decimals: balance.token.decimals
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching ERC20 balance for ${address}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC20 token balance (alternate name)
  server.tool(
    "get_token_balance",
    "Get the balance of an ERC20 token for an address",
    {
      tokenAddress: z.string().describe("The contract address name of the ERC20 token (e.g., '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1')"),
      ownerAddress: z.string().describe("The wallet address name to check the balance for (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet', etc.) or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, ownerAddress, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getERC20Balance(tokenAddress, ownerAddress, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              tokenAddress,
              owner: ownerAddress,
              network,
              raw: balance.raw.toString(),
              formatted: balance.formatted,
              symbol: balance.token.symbol,
              decimals: balance.token.decimals
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching token balance: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Transfer Sei
  server.tool(
    "transfer_sei",
    "Transfer native tokens (Sei) to an address",
    {
      to: z.string().describe("The recipient address (e.g., '0x1234...'"),
      amount: z.string().describe("Amount to send in SEI (or the native token of the network), as a string (e.g., '0.1')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ to, amount, network = DEFAULT_NETWORK }) => {
      try {
        const txHash = await services.transferSei(to, amount, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash,
              to,
              amount,
              network
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error transferring Sei: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Transfer ERC20
  server.tool(
    "transfer_erc20",
    "Transfer ERC20 tokens to another address",
    {
      tokenAddress: z.string().describe("The address of the ERC20 token contract"),
      toAddress: z.string().describe("The recipient address"),
      amount: z.string().describe("The amount of tokens to send (in token units, e.g., '10' for 10 tokens)"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, toAddress, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.transferERC20(
          tokenAddress,
          toAddress,
          amount,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash: result.txHash,
              network,
              tokenAddress,
              recipient: toAddress,
              amount: result.amount.formatted,
              symbol: result.token.symbol
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error transferring ERC20 tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Transfer ERC20 tokens (alternate name)
  server.tool(
    "transfer_token",
    "Transfer ERC20 tokens to an address",
    {
      tokenAddress: z.string().describe("The contract address of the ERC20 token to transfer (e.g., '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')"),
      toAddress: z.string().describe("The recipient address that will receive the tokens (e.g., '0x1234...')"),
      amount: z.string().describe("Amount of tokens to send as a string (e.g., '100' for 100 tokens). This will be adjusted for the token's decimals."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, toAddress, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.transferERC20(
          tokenAddress,
          toAddress,
          amount,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash: result.txHash,
              tokenAddress,
              toAddress,
              amount: result.amount.formatted,
              symbol: result.token.symbol,
              network
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error transferring tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Approve ERC20 token spending
  server.tool(
    "approve_token_spending",
    "Approve another address (like a DeFi protocol or exchange) to spend your ERC20 tokens. This is often required before interacting with DeFi protocols.",
    {
      tokenAddress: z.string().describe("The contract address of the ERC20 token to approve for spending (e.g., '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')"),
      spenderAddress: z.string().describe("The contract address being approved to spend your tokens (e.g., a DEX or lending protocol)"),
      amount: z.string().describe("The amount of tokens to approve in token units, not wei (e.g., '1000' to approve spending 1000 tokens). Use a very large number for unlimited approval."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, spenderAddress, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.approveERC20(
          tokenAddress,
          spenderAddress,
          amount,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash: result.txHash,
              network,
              tokenAddress,
              spender: spenderAddress,
              amount: result.amount.formatted,
              symbol: result.token.symbol
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error approving token spending: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Transfer NFT (ERC721)
  server.tool(
    "transfer_nft",
    "Transfer an NFT (ERC721 token) from one address to another. Requires the private key of the current owner for signing the transaction.",
    {
      tokenAddress: z.string().describe("The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D')"),
      tokenId: z.string().describe("The ID of the specific NFT to transfer (e.g., '1234')"),
      toAddress: z.string().describe("The recipient wallet address that will receive the NFT"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Most NFTs are on Sei mainnet, which is the default.")
    },
    async ({ tokenAddress, tokenId, toAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.transferERC721(
          tokenAddress,
          toAddress,
          BigInt(tokenId),
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash: result.txHash,
              network,
              collection: tokenAddress,
              tokenId: result.tokenId,
              recipient: toAddress,
              name: result.token.name,
              symbol: result.token.symbol
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error transferring NFT: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Transfer ERC1155 token
  server.tool(
    "transfer_erc1155",
    "Transfer ERC1155 tokens to another address. ERC1155 is a multi-token standard that can represent both fungible and non-fungible tokens in a single contract.",
    {
      tokenAddress: z.string().describe("The contract address of the ERC1155 token collection (e.g., '0x76BE3b62873462d2142405439777e971754E8E77')"),
      tokenId: z.string().describe("The ID of the specific token to transfer (e.g., '1234')"),
      amount: z.string().describe("The quantity of tokens to send (e.g., '1' for a single NFT or '10' for 10 fungible tokens)"),
      toAddress: z.string().describe("The recipient wallet address that will receive the tokens"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. ERC1155 tokens exist across many networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, tokenId, amount, toAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.transferERC1155(
          tokenAddress,
          toAddress,
          BigInt(tokenId),
          amount,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              txHash: result.txHash,
              network,
              contract: tokenAddress,
              tokenId: result.tokenId,
              amount: result.amount,
              recipient: toAddress
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error transferring ERC1155 tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC20 token information
  server.tool(
    "get_token_info",
    "Get comprehensive information about an ERC20 token including name, symbol, decimals, total supply, and other metadata. Use this to analyze any token on EVM chains.",
    {
      tokenAddress: z.string().describe("The contract address of the ERC20 token (e.g., '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, network = DEFAULT_NETWORK }) => {
      try {
        const tokenInfo = await services.getERC20TokenInfo(tokenAddress as Address, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address: tokenAddress,
              network,
              ...tokenInfo
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching token info: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC20 token balance (alternate name)
  server.tool(
    "get_token_balance_erc20",
    "Get ERC20 token balance for an address",
    {
      address: z.string().describe("The address to check balance for"),
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      network: z.string().optional().describe("Network name or chain ID. Defaults to Sei mainnet.")
    },
    async ({ address, tokenAddress, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getERC20Balance(
          tokenAddress as Address,
          address as Address,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              tokenAddress,
              network,
              balance: {
                raw: balance.raw.toString(),
                formatted: balance.formatted,
                decimals: balance.token.decimals
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching ERC20 balance for ${address}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get NFT (ERC721) information
  server.tool(
    "get_nft_info",
    "Get detailed information about a specific NFT (ERC721 token), including collection name, symbol, token URI, and current owner if available.",
    {
      tokenAddress: z.string().describe("The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D')"),
      tokenId: z.string().describe("The ID of the specific NFT token to query (e.g., '1234')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', ) or chain ID. Most NFTs are on Sei mainnet, which is the default.")
    },
    async ({ tokenAddress, tokenId, network = DEFAULT_NETWORK }) => {
      try {
        const nftInfo = await services.getERC721TokenMetadata(
          tokenAddress as Address,
          BigInt(tokenId),
          network
        );
        // Check ownership separately
        let owner = null;
        try {
          // This may fail if tokenId doesn't exist
          owner = await services.getPublicClient(network).readContract({
            address: tokenAddress as Address,
            abi: [{
              inputs: [{ type: 'uint256' }],
              name: 'ownerOf',
              outputs: [{ type: 'address' }],
              stateMutability: 'view',
              type: 'function'
            }],
            functionName: 'ownerOf',
            args: [BigInt(tokenId)]
          });
        } catch (e) {
          // Ownership info not available
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              contract: tokenAddress,
              tokenId,
              network,
              ...nftInfo,
              owner: owner || 'Unknown'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching NFT info: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Check NFT ownership
  server.tool(
    "check_nft_ownership",
    "Check if an address owns a specific NFT",
    {
      tokenAddress: z.string().describe("The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D')"),
      tokenId: z.string().describe("The ID of the NFT to check (e.g., '1234')"),
      ownerAddress: z.string().describe("The wallet address to check ownership against (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet' etc.) or chain ID. Supports all Sei networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, tokenId, ownerAddress, network = DEFAULT_NETWORK }) => {
      try {
        const isOwner = await services.isNFTOwner(
          tokenAddress,
          ownerAddress,
          BigInt(tokenId),
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              tokenAddress,
              tokenId,
              ownerAddress,
              network,
              isOwner,
              result: isOwner ? "Address owns this NFT" : "Address does not own this NFT"
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error checking NFT ownership: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC1155 token URI
  server.tool(
    "get_erc1155_token_uri",
    "Get the metadata URI for an ERC1155 token (multi-token standard used for both fungible and non-fungible tokens). The URI typically points to JSON metadata about the token.",
    {
      tokenAddress: z.string().describe("The contract address of the ERC1155 token collection (e.g., '0x5B6D32f2B55b62da7a8cd553857EB6Dc26bFDC63')"),
      tokenId: z.string().describe("The ID of the specific token to query metadata for (e.g., '1234')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. ERC1155 tokens exist across many networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, tokenId, network = DEFAULT_NETWORK }) => {
      try {
        const uri = await services.getERC1155TokenURI(
          tokenAddress as Address,
          BigInt(tokenId),
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              contract: tokenAddress,
              tokenId,
              network,
              uri
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching ERC1155 token URI: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC721 NFT balance
  server.tool(
    "get_nft_balance",
    "Get the total number of NFTs owned by an address from a specific collection. This returns the count of NFTs, not individual token IDs.",
    {
      tokenAddress: z.string().describe("The contract address of the NFT collection (e.g., '0x5B6D32f2B55b62da7a8cd553857EB6Dc26bFDC63')"),
      ownerAddress: z.string().describe("The wallet address to check the NFT balance for (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. Most NFTs are on Sei mainnet, which is the default.")
    },
    async ({ tokenAddress, ownerAddress, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getERC721Balance(
          tokenAddress as Address,
          ownerAddress as Address,
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              collection: tokenAddress,
              owner: ownerAddress,
              network,
              balance: balance.toString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching NFT balance: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get ERC1155 token balance
  server.tool(
    "get_erc1155_balance",
    "Get the balance of a specific ERC1155 token ID owned by an address. ERC1155 allows multiple tokens of the same ID, so the balance can be greater than 1.",
    {
      tokenAddress: z.string().describe("The contract address of the ERC1155 token collection (e.g., '0x5B6D32f2B55b62da7a8cd553857EB6Dc26bFDC63')"),
      tokenId: z.string().describe("The ID of the specific token to check the balance for (e.g., '1234')"),
      ownerAddress: z.string().describe("The wallet address to check the token balance for (e.g., '0x1234...')"),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet', 'sei-devnet') or chain ID. ERC1155 tokens exist across many networks. Defaults to Sei mainnet.")
    },
    async ({ tokenAddress, tokenId, ownerAddress, network = DEFAULT_NETWORK }) => {
      try {
        const balance = await services.getERC1155Balance(
          tokenAddress as Address,
          ownerAddress as Address,
          BigInt(tokenId),
          network
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              contract: tokenAddress,
              tokenId,
              owner: ownerAddress,
              network,
              balance: balance.toString()
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error fetching ERC1155 token balance: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Get address from private key
  server.tool(
    "get_address_from_private_key",
    "Get the EVM address derived from a private key",
    {},
    async () => {
      try {
        const privateKeyValue = getPrivateKeyAsHex();
        if (!privateKeyValue) {
          return {
            content: [{ type: "text", text: "Error: The PRIVATE_KEY environment variable is not set. Please set this variable with your private key and restart the MCP server for this tool to function." }],
            isError: true
          };
        }
        const address = services.getAddressFromPrivateKey(privateKeyValue);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              address,
              // Do not return the private key in the response.
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error deriving address from private key: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}

