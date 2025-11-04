import { Account, Client, type Address, type TransactionReceipt } from 'viem';
// @ts-ignore
import { Symphony } from 'symphony-sdk/viem';
import { getWalletClient, getPublicClient } from './clients.js';
import { getPrivateKeyAsHex } from '../config.js';
import * as services from './index.js';

/**
 * Options for the getSymphonyRoute function.
 */
interface SymphonyOptions {
  /** If true, the input amount is treated as raw units (wei). Defaults to false. */
  isRaw?: boolean;
}

/**
 * Options for executing a swap, such as handling approvals.
 */
interface SwapExecutionOptions {
  skipApproval?: boolean;
  skipCheckApproval?: boolean;
}

/**
 * Custom slippage settings for a swap.
 */
interface SwapSlippage {
  slippageAmount?: string | number;
  isRaw?: boolean;
  isBps?: boolean;
  outTokenDecimals?: number;
}

/**
 * The result of a successful swap, including transaction receipts.
 */
interface SwapResult {
  swapReceipt: TransactionReceipt;
  approveReceipt?: TransactionReceipt;
}

/**
 * Parameters for generating swap calldata.
 */
interface GenerateCalldataParams {
  from?: string | Address;
  includesNative?: boolean;
  slippage?: {
    slippageAmount?: string;
    isRaw?: boolean;
    isBps?: boolean;
  };
}

/**
 * The raw transaction data for a swap.
 */
interface CalldataResult {
  from: string;
  to: string;
  data: string;
  value: string;
}

const privateKey = getPrivateKeyAsHex();
if (!privateKey) {
  throw new Error('Private key is not set.');
}
// const client = privateKey ? getWalletClient(privateKey, 'sei') : getPublicClient();
const client = getWalletClient(privateKey, 'sei');
const symphony = new Symphony({ client });

/**
 * Retrieves the current configuration of the Symphony SDK instance.
 *
 * @param network The network to query.
 * @returns An object containing the current Symphony configuration.
 */
export function getSymphonyConfig(): Record<string, any> {
  try {
    console.log(`Fetching Symphony config for Sei Mainnet`);
    const config = symphony.getConfig();
    console.log(`Successfully fetched Symphony config.`);
    return config;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony getConfig Error]`, errorMessage);
    throw new Error(`Failed to get config from Symphony: ${errorMessage}`);
  }
}

/**
 * Updates the configuration of the shared Symphony SDK instance.
 *
 * @param options A partial configuration object with the values to update.
 */
export function setSymphonyConfig(options: Record<string, any>): void {
  try {
    console.log(`Updating Symphony config with new options...`);
    symphony.setConfig(options);
    console.log(`Symphony config updated successfully.`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony setConfig Error]`, errorMessage);
    throw new Error(`Failed to set config for Symphony: ${errorMessage}`);
  }
}

/**
 * Retrieves the list of all available tokens for swapping on the Symphony protocol.
 *
 * @returns An object where keys are token addresses and values are TokenInfo objects.
 */
export function getSymphonyTokenList(): Record<string, any> {
  try {
    console.log(`Fetching token list for Symphony on Sei Mainnet`);
    const tokens = symphony.getTokenList();
    console.log(`Successfully fetched ${Object.keys(tokens).length} tokens.`);
    return tokens;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Token List Error]`, errorMessage);
    throw new Error(`Failed to get token list from Symphony: ${errorMessage}`);
  }
}

/**
 * Checks if a given token address is available for swaps in the Symphony protocol.
 *
 * @param tokenAddress The address of the token to check.
 * @returns A boolean indicating if the token is listed.
 */
export function isSymphonyTokenListed(tokenAddress: string): boolean {
  try {
    const isListed = symphony.isTokenListed(tokenAddress);
    console.log(`Token ${tokenAddress} is ${isListed ? 'listed' : 'not listed'} on Symphony.`);
    return isListed;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony isTokenListed Error]`, errorMessage);
    throw new Error(`Failed to check if token is listed on Symphony: ${errorMessage}`);
  }
}

/**
 * Finds the best swap route for a given token pair using the Symphony protocol.
 * This function does not execute the swap.
 *
 * @param tokenInAddress The address of the input token. Use "0x0" for the native token (e.g., SEI).
 * @param tokenOutAddress The address of the output token. Use "0x0" for the native token.
 * @param amount The amount of the input token to swap.
 * @param options Optional configuration, like specifying if the amount is in raw units.
 * @returns A promise that resolves to the Route object from the Symphony SDK.
 */
export async function getSymphonyRoute(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {}
): Promise<any> {
  try {
    console.log(`Getting swap route for ${amount} of ${tokenInAddress} to ${tokenOutAddress} on Symphony...`);

    if (symphony.isTokenListed(tokenInAddress) && symphony.isTokenListed(tokenOutAddress)) {
      const route = await symphony.getRoute(
        tokenInAddress,
        tokenOutAddress,
        amount,
        options
      );

      if (!route) {
        throw new Error('Symphony SDK could not find a valid swap route for the specified tokens.');
      }

      console.log(`Route found. Expected output: ${route.amountOutFormatted}`);

      return {
        route,
        amountIn: route.amountIn,
        amountInFormatted: route.amountInFormatted,
        amountOut: route.amountOut,
        amountOutFormatted: route.amountOutFormatted,
        pathPercentages: route.pathPercentages,
        pathCount: route.pathCount,
        includesNative: route.includesNative,
        tokenIn: route.tokenIn,
        tokenOut: route.tokenOut
      };
    } else {
      throw new Error('One or both tokens are not listed on Symphony.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Route Error]`, errorMessage);
    throw new Error(`Failed to get swap route from Symphony: ${errorMessage}`);
  }
}

/**
 * Swaps one token for another using the Symphony protocol SDK.
 *
 * @param tokenInAddress The address of the input token. Use "0x0" for the native token (e.g., SEI).
 * @param tokenOutAddress The address of the output token. Use "0x0" for the native token.
 * @param amount The amount of the input token to swap. By default, this is in human-readable units (e.g., "1.5").
 * @param options Optional configuration for the swap, like specifying if the amount is in raw units.
 * @returns A promise that resolves to the transaction receipt of the swap.
 */
export async function swapOnSymphony(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {}
): Promise<TransactionReceipt> {
  try {
    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, options);
    console.log('Executing swap...');

    const { swapReceipt } = await route.swap();

    console.log(`Swap successfully executed. Transaction Hash: ${swapReceipt.transactionHash}`);

    return swapReceipt;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Swap Error]`, errorMessage);
    throw new Error(`Failed to execute swap on Symphony: ${errorMessage}`);
  }
}

/**
 * Swaps one token for another using the Symphony protocol SDK.
 *
 * @param tokenInAddress The address of the input token. Use "0x0" for the native token.
 * @param tokenOutAddress The address of the output token. Use "0x0" for the native token.
 * @param amount The amount of the input token to swap.
 * @param params Optional parameters for getting the route and executing the swap.
 * @returns A promise that resolves to an object containing the swap and approval transaction receipts.
 */
export async function swapOnSymphonyAdvanced(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  params: {
    routeOptions?: SymphonyOptions;
    swapOptions?: SwapExecutionOptions;
    slippage?: SwapSlippage;
  } = {}
): Promise<SwapResult> {
  try {
    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, params.routeOptions);
    console.log('Executing swap...');

    const result: SwapResult = await route.swap({
      options: params.swapOptions,
      slippage: params.slippage,
    });

    console.log(`Swap successfully executed. Transaction Hash: ${result.swapReceipt.transactionHash}`);
    if (result.approveReceipt) {
      console.log(`Approval transaction hash: ${result.approveReceipt.transactionHash}`);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Swap Error]`, errorMessage);
    throw new Error(`Failed to execute swap on Symphony: ${errorMessage}`);
  }
}

/**
 * Calculates the total output amount for a given route.
 *
 * @param route The Route object to calculate the output amount from.
 * @returns An object containing the raw and formatted output amounts and token addresses.
 */
export async function getSymphonyTotalAmountOut(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {}
): Promise<Record<string, any>> {
  try {
    console.log('Calculating total amount out for the route...');
    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, options);
    const totalAmountOut = route.getTotalAmountOut();
    console.log(`Total amount out: ${totalAmountOut.amountOutFormatted}`);
    return totalAmountOut;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Total Amount Out Error]`, errorMessage);
    throw new Error(`Failed to get total amount out from route: ${errorMessage}`);
  }
}

/**
 * Checks if the Symphony protocol has sufficient allowance to spend a specific token for a swap.
 *
 * @param tokenInAddress The address of the input token.
 * @param tokenOutAddress The address of the output token.
 * @param amount The amount of the input token for the swap.
 * @param options Optional configuration for getting the route.
 * @returns A promise that resolves to true if the allowance is sufficient, otherwise false.
 */
export async function checkSymphonyApproval(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {}
): Promise<boolean> {
  try {
    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, options);
    console.log(`Checking approval for token ${tokenInAddress}...`);

    const isApproved = await route.isApproved();
    console.log(`Sufficient allowance: ${isApproved}`);

    return isApproved;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Check Approval Error]`, errorMessage);
    throw new Error(`Failed to check approval status on Symphony: ${errorMessage}`);
  }
}

/**
 * Approves the Symphony protocol to spend a specific token for swapping.
 * This is a necessary step before swapping non-native tokens.
 *
 * @param tokenInAddress The address of the input token to approve.
 * @param tokenOutAddress The address of the output token (needed to determine the route).
 * @param amount The amount of the input token to approve for.
 * @param options Optional configuration for getting the route.
 * @returns A promise that resolves to the transaction receipt of the approval.
 */
export async function approveSymphonyToken(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {}
): Promise<TransactionReceipt> {
  try {
    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, options);
    console.log(`Approving token ${tokenInAddress} for swapping...`);

    const approvalReceipt = await route.giveApproval();
    console.log(`Approval transaction successful. Hash: ${approvalReceipt.transactionHash}`);

    return approvalReceipt;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Approval Error]`, errorMessage);
    throw new Error(`Failed to give approval to Symphony: ${errorMessage}`);
  }
}

/**
 * Generates the transaction calldata for a swap without executing it.
 *
 * @param route The Route object for the swap.
 * @param params Optional parameters like the sender's address and slippage.
 * @returns A promise that resolves to the raw transaction data.
 */
export async function generateSymphonySwapCalldata(
  tokenInAddress: string,
  tokenOutAddress: string,
  amount: string | number | bigint,
  options: SymphonyOptions = {},
  params: GenerateCalldataParams = {}
): Promise<CalldataResult> {
  try {
    console.log('Generating swap calldata...');
    if (!params.from && !client.account) {
      throw new Error(
        "A sender address ('from') must be provided in the parameters, " +
        "as the SDK is not configured with a wallet client account."
      );
    }

    const route = await symphony.getRoute(tokenInAddress, tokenOutAddress, amount, options);
    const txData = await route.generateCalldata({ ...params, from: client.account?.address });
    console.log('Successfully generated calldata.');

    return {
      from: (txData as any).account || txData.from,
      to: txData.to,
      data: txData.data,
      value: txData.value
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Symphony Generate Calldata Error]`, errorMessage);
    if (errorMessage.includes("Invalid 'from' parameter")) {
      throw new Error("Failed to generate calldata on Symphony: The 'from' address provided is invalid or missing, and no default wallet is configured.");
    }
    throw new Error(`Failed to generate calldata on Symphony: ${errorMessage}`);
  }
}