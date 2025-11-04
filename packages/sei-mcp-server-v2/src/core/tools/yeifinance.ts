import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Address } from "viem";
import { DEFAULT_NETWORK } from "../chains.js";
import * as services from "../services/index.js";

/**
 * Registers tools related to the Yei Finance lending protocol.
 * @param server The MCP server instance
 */
export function registerYeiFinanceTools(server: McpServer) {
  // Get data for all reserves in the pool
  server.tool(
    "get_yei_reserves",
    "Get data for all reserves in the Yei Finance pool.",
    {
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the default network."),
    },
    async ({ network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getFormattedReserves(network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting Yei Finance reserves data: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Get a user's account data
  server.tool(
    "get_yei_user_account",
    "Get a user's account data, including health factor, collateral, and debt.",
    {
      userAddress: z.string().describe("The wallet address of the user."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ userAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.getUserAccountData(userAddress, network);
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, 2)
          }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error getting user account data: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Approve a token for use in the Yei Finance pool
  server.tool(
    "approve_yei_token",
    "Approve the Yei Finance Pool contract to spend a specified amount of an ERC20 token. This is required before supplying or repaying.",
    {
      tokenAddress: z.string().describe("The address of the ERC20 token to approve."),
      amount: z.string().describe("The amount of the token to approve (in decimal units, e.g., '100.5')."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ tokenAddress, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.approveYeiFinance(tokenAddress, amount, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error approving token: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Supply an ERC20 token
  server.tool(
    "supply_yei_asset",
    "Supply (deposit) an ERC20 token into the Yei Finance pool to earn interest.",
    {
      reserveAddress: z.string().describe("The address of the asset (token) to supply."),
      amount: z.string().describe("The amount to supply (in decimal units)."),
      onBehalfOf: z.string().describe("The address that will receive the aTokens."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ reserveAddress, amount, onBehalfOf, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.supply(reserveAddress, amount, onBehalfOf, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error supplying asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Supply the native asset (SEI)
  server.tool(
    "supply_yei_native_asset",
    "Supply (deposit) the native asset (e.g., SEI) into the Yei Finance pool.",
    {
      amount: z.string().describe("The amount of the native asset to supply (in decimal units)."),
      onBehalfOf: z.string().describe("The address that will receive the aTokens."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ amount, onBehalfOf, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.supplyNativeAsset(amount, onBehalfOf, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error supplying native asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Borrow an asset
  server.tool(
    "borrow_yei_asset",
    "Borrow an asset from the Yei Finance pool against supplied collateral.",
    {
      reserveAddress: z.string().describe("The address of the asset to borrow."),
      amount: z.string().describe("The amount to borrow (in decimal units)."),
      interestRateMode: z.enum(["Stable", "Variable"]).optional().describe("The interest rate mode: Stable, Variable."),
      onBehalfOf: z.string().describe("The address that will receive the borrowed assets and debt."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ reserveAddress, amount, interestRateMode = 'Variable', onBehalfOf, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.borrow(reserveAddress, amount, interestRateMode, onBehalfOf, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error borrowing asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Repay a borrowed asset
  server.tool(
    "repay_yei_asset",
    "Repay a borrowed asset to the Yei Finance pool.",
    {
      reserveAddress: z.string().describe("The address of the asset to repay."),
      amount: z.string().describe("The amount to repay. Use '-1' to repay the entire debt for this asset."),
      interestRateMode: z.enum(["Stable", "Variable"]).optional().describe("The interest rate mode of the debt: Stable, Variable."),
      onBehalfOf: z.string().describe("The address whose debt is being repaid."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ reserveAddress, amount, interestRateMode = 'Variable', onBehalfOf, network = DEFAULT_NETWORK }) => {
      try {
        // const rateModeEnum = InterestRate[interestRateMode];
        const result = await services.repay(reserveAddress, amount, interestRateMode, onBehalfOf, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error repaying asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Withdraw a supplied asset
  server.tool(
    "withdraw_yei_asset",
    "Withdraw a supplied asset from the Yei Finance pool.",
    {
      reserveAddress: z.string().describe("The address of the asset to withdraw."),
      amount: z.string().describe("The amount to withdraw. Use '-1' to withdraw the entire supplied balance."),
      toAddress: z.string().describe("The address to send the withdrawn assets to."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ reserveAddress, amount, toAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.withdraw(reserveAddress, amount, toAddress, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error withdrawing asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Tool to Enable/Disable an Asset as Collateral
  server.tool(
    "set_collateral_status",
    "Enable or disable a supplied asset to be used as collateral.",
    {
      reserveAddress: z.string().describe("The address of the asset to modify."),
      useAsCollateral: z.boolean().describe("Set to 'true' to enable as collateral, 'false' to disable."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet')."),
    },
    async ({ reserveAddress, useAsCollateral, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.setUseReserveAsCollateral(reserveAddress, useAsCollateral, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error setting collateral status: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );


  // Tool to Withdraw the Native Asset (SEI)
  server.tool(
    "withdraw_native_asset",
    "Withdraw the native asset (SEI) from the lending pool.",
    {
      amount: z.string().describe("The amount to withdraw. Use '-1' to withdraw the entire balance."),
      toAddress: z.string().describe("The address that will receive the withdrawn assets."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet')."),
    },
    async ({ amount, toAddress, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.withdrawNativeAsset(amount, toAddress, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error withdrawing native asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Tool for Flash Loans (Advanced)
  // This tool is for developers and requires a pre-deployed receiver contract.
  server.tool(
    "execute_flash_loan",
    "Executes a flash loan. Requires a receiver contract to handle the funds.",
    {
      receiverAddress: z.string().describe("The address of your deployed contract that will receive the loan."),
      assets: z.array(z.string()).describe("An array of asset addresses to borrow."),
      amounts: z.array(z.string()).describe("An array of amounts (in decimal units) for each corresponding asset."),
      onBehalfOf: z.string().describe("The address to attribute the flash loan to."),
      params: z.string().optional().default("0x").describe("Hex-encoded data to pass to your receiver contract."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ receiverAddress, assets, amounts, onBehalfOf, params, network = DEFAULT_NETWORK }) => {
      if (assets.length !== amounts.length) {
        return {
          content: [{ type: "text", text: "Error: The 'assets' and 'amounts' arrays must have the same length." }],
          isError: true,
        };
      }

      try {
        const assetAddresses = assets as Address[];

        const result = await services.flashLoan(
          receiverAddress,
          assetAddresses,
          amounts,
          onBehalfOf,
          params as `0x${string}`,
          network
        );

        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error executing flash loan: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Tool for Simple Flash Loans (Single Asset)
  server.tool(
    "execute_simple_flash_loan",
    "Executes a simple flash loan for a single asset.",
    {
      receiverAddress: z.string().describe("The address of your deployed contract that will receive the loan."),
      asset: z.string().describe("The address of the asset to borrow."),
      amount: z.string().describe("The amount to borrow (in decimal units)."),
      network: z.string().optional().describe("Network name (e.g., 'sei', 'sei-testnet')."),
    },
    async ({ receiverAddress, asset, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.flashLoanSimple(
          receiverAddress,
          asset as Address,
          amount,
          "0x",
          network
        );
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error executing simple flash loan: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  // Tool to Set E-Mode Category
  server.tool(
    "set_emode_category",
    "Enter a High-Efficiency Mode (E-Mode) category to get higher borrowing power for correlated assets.",
    {
      categoryId: z.number().int().min(0).describe("The ID of the E-Mode category to enter. Use 0 to exit E-Mode, 1 for Stabecoins and 2 for Sei/WSei."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ categoryId, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.setUserEMode(categoryId, network);
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error setting E-Mode: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to delegate credit by specifying the underlying asset and interest rate type.
   * This is the more user-friendly option.
   */
  server.tool(
    "delegate_credit_by_asset",
    "Delegates borrowing power to another address by specifying the main asset (e.g., USDC).",
    {
      underlyingAssetAddress: z.string().describe("The address of the underlying asset (e.g., USDC, DAI)."),
      delegateeAddress: z.string().describe("The address of the account being delegated borrowing power."),
      amount: z.string().describe("The amount of the asset to approve for delegation."),
      interestRateMode: z.enum(["stable", "variable"]).describe("The type of debt to delegate: 'stable' or 'variable'."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ underlyingAssetAddress, delegateeAddress, amount, interestRateMode, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.approveCreditDelegation(
          underlyingAssetAddress,
          delegateeAddress,
          amount,
          interestRateMode,
          network
        );
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error delegating credit by asset: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );

  /**
   * Tool to delegate credit by specifying the exact debt token address.
   * This is a more advanced option for users who know the specific contract address.
   */
  server.tool(
    "delegate_credit_by_debt_token",
    "Delegates borrowing power to another address using the specific debt token contract.",
    {
      debtTokenAddress: z.string().describe("The address of the Yei Finance debt token (e.g., VariableDebtUSDC)."),
      delegateeAddress: z.string().describe("The address of the account being delegated borrowing power."),
      amount: z.string().describe("The amount of the underlying asset to approve for delegation."),
      network: z.string().optional().describe("Network name (e.g., 'sei'). Defaults to the Sei Mainnet."),
    },
    async ({ debtTokenAddress, delegateeAddress, amount, network = DEFAULT_NETWORK }) => {
      try {
        const result = await services.approveCreditDelegationByDebtToken(
          debtTokenAddress,
          delegateeAddress,
          amount,
          network
        );
        return {
          content: [{ type: "text", text: JSON.stringify({ txHash: result }, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error delegating credit by debt token: ${errorMessage}` }],
          isError: true,
        };
      }
    }
  );
}
