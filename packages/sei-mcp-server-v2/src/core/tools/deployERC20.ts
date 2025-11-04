import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";

/**
 * Registers tools related to ERC20 token deployment.
 * @param server The MCP server instance
 */
export function registerDeployErc20Tools(server: McpServer) {
  // Tool to deploy a new ERC20 token to the specified network.
  server.tool(
    "deploy_erc20",
    "Deploys a new ERC20 token to the specified network.",
    {
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to 'sei'."),
      name: z.string().describe("The name of the token (e.g., 'My Awesome Token')."),
      symbol: z.string().describe("The symbol for the token (e.g., 'MAT')."),
      initialSupply: z.string().optional().describe("The total initial supply of the token, without decimals (e.g., '1000000' for one million tokens). Defaults to 1,000,000."),
      decimals: z.number().optional().describe("The number of decimals for the token. Defaults to 18.")
    },
    async ({ network = DEFAULT_NETWORK, name, symbol, initialSupply = '1000000', decimals = 18 }) => {
      try {
        const result = await services.deployERC20(name, symbol, initialSupply, decimals, network);
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
            text: `Error deploying ERC20 token: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to verify an already deployed ERC20 contract by checking its parameters against the deployment inputs.
  server.tool(
    "verify_erc20_contract_locally",
    "Verifies an already deployed ERC20 contract by checking its parameters against the deployment inputs.",
    {
      contractAddress: z.string().describe("The deployed contract address to verify (0x... format)."),
      name: z.string().describe("The name of the token used during deployment."),
      symbol: z.string().describe("The symbol of the token used during deployment."),
      initialSupply: z.string().describe("The initial supply used during deployment (without decimals)."),
      decimals: z.number().describe("The number of decimals used during deployment."),
      network: z.string().optional().describe("Network name where the contract was deployed. Defaults to 'sei'.")
    },
    async ({ contractAddress, name, symbol, initialSupply, decimals, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.verifyERC20ContractLocal(
          contractAddress,
          name,
          symbol,
          initialSupply,
          decimals,
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
            text: `Error verifying ERC20 contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Tool to verify an already deployed ERC20 contract on Seitrace block explorer by submitting the source code for verification.
  server.tool(
    "verify_erc20_contract",
    "Verifies an already deployed ERC20 contract on Seitrace block explorer by submitting the source code for verification.",
    {
      contractAddress: z.string().describe("The deployed contract address to verify (0x... format)."),
      name: z.string().describe("The name of the token used during deployment."),
      symbol: z.string().describe("The symbol of the token used during deployment."),
      initialSupply: z.string().describe("The initial supply used during deployment (without decimals)."),
      decimals: z.number().describe("The number of decimals used during deployment."),
      network: z.string().optional().describe("Network name where the contract was deployed ('sei' or 'sei-testnet'). Defaults to 'sei'.")
    },
    async ({ contractAddress, name, symbol, initialSupply, decimals, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.verifyERC20Contract(
          contractAddress,
          name,
          symbol,
          initialSupply,
          decimals,
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
            text: `Error verifying ERC20 contract: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Verification status check tool
  server.tool(
    "check_verification_status",
    "Checks the verification status of a contract on Seitrace block explorer.",
    {
      contractAddress: z.string().describe("The contract address to check (0x... format)."),
      network: z.string().optional().describe("Network name ('sei' or 'sei-testnet'). Defaults to 'sei'.")
    },
    async ({ contractAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.checkVerificationStatus(contractAddress, network);
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
            text: `Error checking verification status: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // Combined deploy and verify tool
  // server.tool(
  //   "deploy_and_verify_erc20",
  //   "Deploys a new ERC20 token and submits it for verification on Seitrace block explorer in one operation. Note: Verification requires the contract address which may not be immediately available after deployment.",
  //   {
  //     name: z.string().describe("The name of the token (e.g., 'My Awesome Token')."),
  //     symbol: z.string().describe("The symbol for the token (e.g., 'MAT')."),
  //     initialSupply: z.string().optional().describe("The total initial supply of the token, without decimals (e.g., '1000000' for one million tokens). Defaults to 1,000,000."),
  //     decimals: z.number().optional().describe("The number of decimals for the token. Defaults to 18."),
  //     network: z.string().optional().describe("Network name ('sei' or 'sei-testnet'). Defaults to 'sei'."),
  //     contractAddress: z.string().optional().describe("If you already know the contract address (e.g., from a previous deployment), provide it here for verification. Otherwise, verification will be skipped.")
  //   },
  //   async ({ name, symbol, initialSupply = '1000000', decimals = 18, network = DEFAULT_NETWORK, contractAddress }) => {
  //     try {
  //       const result = await services.deployAndVerifyERC20(
  //         name,
  //         symbol,
  //         initialSupply,
  //         decimals,
  //         network,
  //         contractAddress
  //       );
  //       return {
  //         content: [{
  //           type: "text" as const,
  //           text: JSON.stringify(result, null, 2)
  //         }]
  //       };
  //     } catch (error) {
  //       return {
  //         content: [{
  //           type: "text" as const,
  //           text: `Error in deploy and verify process: ${error instanceof Error ? error.message : String(error)}`
  //         }],
  //         isError: true
  //       };
  //     }
  //   }
  // );

  // Tool to mint additional ERC20 tokens to a specified address
  server.tool(
    "mint_erc20_tokens",
    "Mints additional ERC20 tokens to a specified wallet address.",
    {
      tokenAddress: z.string().describe("The deployed ERC20 contract address (e.g., '0x...')."),
      toAddress: z.string().optional().describe("The recipient wallet address to receive minted tokens. Defaults to User Address from Private Key"),
      amount: z.string().describe("The number of tokens to mint (e.g., '5000'). Decimals are handled internally."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet'). Defaults to the sei mainnet network.")
    },
    async ({ tokenAddress, toAddress = "", amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.mintTokens(tokenAddress, toAddress, amount, network);
        return {
          content: [{
            type: "text" as const,
            text: `✅ Tokens minted successfully!\nTransaction hash: ${result.txHash}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `❌ Error minting tokens: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}