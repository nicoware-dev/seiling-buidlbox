import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";

/**
 * Registers tools related to ERC721 token deployment.
 * @param server The MCP server instance
 */
export function registerDeployErc721Tools(server: McpServer) {
  // Tool to deploy a new ERC721 token to the specified network.
  server.tool(
    "deploy_erc721",
    "Deploys a new ERC721 (NFT) token to the specified network.",
    {
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to 'sei'."),
      name: z.string().describe("The name of the token (e.g., 'My Awesome NFT')."),
      symbol: z.string().describe("The symbol for the token (e.g., 'MAN')."),
      baseURI_: z.string().optional().describe("The base URI for token metadata (e.g., 'https://api.example.com/nfts/').")
    },
    async ({ network = DEFAULT_NETWORK, name, symbol, baseURI_ = 'https://api.example.com/nfts/' }) => {
      try {
        const result = await services.deployERC721(name, symbol, baseURI_, network);
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
            text: `Error deploying ERC721 token: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to verify an already deployed ERC721 contract by checking its parameters against the deployment inputs.
  server.tool(
    "verify_erc721_contract_locally",
    "Verifies an already deployed ERC721 contract by checking its parameters against the deployment inputs.",
    {
      contractAddress: z.string().describe("The deployed contract address to verify (0x... format)."),
      name: z.string().describe("The name of the token used during deployment."),
      symbol: z.string().describe("The symbol of the token used during deployment."),
      baseURI_: z.string().optional().describe("The base URI used during deployment."),
      network: z.string().optional().describe("Network name where the contract was deployed. Defaults to 'sei'.")
    },
    async ({ contractAddress, name, symbol, baseURI_ = 'https://api.example.com/nfts/', network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.verifyERC721ContractLocal(
          contractAddress,
          name,
          symbol,
          baseURI_,
          network
        );
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
            text: `Error verifying ERC721 contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to verify an already deployed ERC721 contract on a block explorer by submitting the source code for verification.
  server.tool(
    "verify_erc721_contract",
    "Verifies an already deployed ERC721 contract on a block explorer by submitting the source code for verification.",
    {
      contractAddress: z.string().describe("The deployed contract address to verify (0x... format)."),
      name: z.string().describe("The name of the token used during deployment."),
      symbol: z.string().describe("The symbol of the token used during deployment."),
      baseURI_: z.string().optional().describe("The base URI used during deployment."),
      network: z.string().optional().describe("Network name where the contract was deployed ('sei' or 'sei-testnet'). Defaults to 'sei'.")
    },
    async ({ contractAddress, name, symbol, baseURI_ = 'https://api.example.com/nfts/', network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.verifyERC721Contract(
          contractAddress,
          name,
          symbol,
          baseURI_,
          network
        );
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
            text: `Error verifying ERC721 contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to mint the next available NFT to a specified address
  server.tool(
    "mint_nft",
    "Mints a new NFT to a specified wallet address on an ERC721 contract.",
    {
      nftContractAddress: z.string().describe("The deployed ERC721 contract address (e.g., '0x...')."),
      toAddress: z.string().optional().describe("The recipient wallet address to receive the NFT. Defaults to the caller's address."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to the sei mainnet network.")
    },
    async ({ nftContractAddress, toAddress = "", network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.mintNFT(nftContractAddress, toAddress, network);
        return {
          content: [{
            type: "text" as const,
            text: `✅ NFT minted successfully!\nTransaction hash: ${result.txHash}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error minting NFT: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to mint a batch of new NFTs to a specified address
  server.tool(
    "mint_batch_nfts",
    "Mints a batch of new NFTs to a specified wallet address on an ERC721 contract.",
    {
      nftContractAddress: z.string().describe("The deployed ERC721 contract address (e.g., '0x...')."),
      toAddress: z.string().optional().describe("The recipient wallet address to receive the NFTs. Defaults to the caller's address."),
      quantity: z.number().describe("The number of NFTs to mint in the batch (must be greater than zero)."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to the sei mainnet network.")
    },
    async ({ nftContractAddress, toAddress = "", quantity, network = DEFAULT_NETWORK }) => {
      try {
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than zero.");
        }
        const result = await services.mintBatchNFTs(nftContractAddress, toAddress, quantity, network);
        return {
          content: [{
            type: "text" as const,
            text: `✅ Batch of ${quantity} NFTs minted successfully!\nTransaction hash: ${result.txHash}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error minting batch NFTs: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
