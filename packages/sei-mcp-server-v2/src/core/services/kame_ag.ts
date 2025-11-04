import { parseUnits, type Address, type TransactionReceipt } from 'viem';
import { Api, FetchProviderConnector, GetQuoteParametersParams, GetSwapParametersParams, GetTokenParametersParams, GetPricesParametersParams, TokenPricesResponse } from '@kame-ag/aggregator-sdk';
import { Token, Address as KameAddress } from '@kame-ag/sdk-core';
import * as services from './index.js';
import { getWalletClient, getPublicClient } from './clients.js';
import { getPrivateKeyAsHex } from '../config.js';
import { privateKeyToAccount } from 'viem/accounts';

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

const client = getWalletClient(privateKey, 'sei');
const aggregatorAPI = new Api({ httpConnector: new FetchProviderConnector() });

/**
 * Retrieves a quote for a token swap from the Kame Aggregator.
 * This function does not execute the swap.
 *
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param amount The amount of the input token to swap.
 * @returns A promise that resolves to the quote object from the Kame SDK.
 */
export async function getKameQuote(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
): Promise<any> {
  try {
    console.log(`Getting swap quote for ${amount} of ${fromTokenAddress} to ${toTokenAddress} on Kame...`);

    const fromTokenDecimals = await services.getERC20TokenInfo(fromTokenAddress as Address, 'sei');
    const toTokenDecimals = await services.getERC20TokenInfo(toTokenAddress as Address, 'sei')
    const fromToken = new Token(1329, fromTokenAddress, fromTokenDecimals.decimals);
    const toToken = new Token(1329, toTokenAddress, toTokenDecimals.decimals);
    const formatAmount = (parseUnits(amount, fromTokenDecimals.decimals)).toString();

    const params: GetQuoteParametersParams = {
      fromToken,
      amount: formatAmount,
      toToken,
    };

    const quote = await aggregatorAPI.getQuote(params);

    if (!quote) {
      throw new Error('Kame Aggregator could not find a valid quote for the specified tokens.');
    }
    const formatAmountOutput = (Number(quote.dstAmount) / (10 ** toTokenDecimals.decimals)).toString();
    return [quote, formatAmountOutput];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Kame Quote Error]`, errorMessage);
    throw new Error(`Failed to get swap quote from Kame: ${errorMessage}`);
  }
}

/**
 * Fetches swap data from the Kame Aggregator and executes the transaction.
 *
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param amount The amount of the input token to swap (in human-readable format).
 * @param slippage Optional slippage tolerance in basis points (e.g., 50 for 0.5%). Defaults to 100 (1%).
 * @returns A promise that resolves to the transaction receipt of the swap.
 */
export async function executeKameSwap(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  slippage: number
): Promise<TransactionReceipt> {
  try {
    console.log(`Getting swap data for ${amount} of ${fromTokenAddress} to ${toTokenAddress} on Kame...`);

    const account = privateKeyToAccount(privateKey as `0x{string}`);

    const fromTokenDecimals = await services.getERC20TokenInfo(fromTokenAddress as Address, 'sei');
    const toTokenDecimals = await services.getERC20TokenInfo(toTokenAddress as Address, 'sei')
    const fromToken = new Token(1329, fromTokenAddress, fromTokenDecimals.decimals);
    const toToken = new Token(1329, toTokenAddress, toTokenDecimals.decimals);
    const formatAmount = (parseUnits(amount, fromTokenDecimals.decimals)).toString();
    const originAddress = new KameAddress(account.address);

    // Fetch Swap Data from Kame Aggregator
    const params: GetSwapParametersParams = {
      origin: originAddress,
      fromToken,
      amount: formatAmount,
      toToken,
      tradeConfig: {
        recipient: originAddress,
        slippage: slippage,
      },
    };

    const swapData = await aggregatorAPI.getSwap(params);

    if (!swapData || !swapData.tx) {
      throw new Error('Kame Aggregator could not generate a valid swap transaction.');
    }

    // Execute the Swap Transaction
    console.log('Executing swap transaction...');
    const hash = await client.sendTransaction({
      account,
      to: swapData.tx.to as `0x${string}`,
      data: swapData.tx.data as `0x${string}`,
      value: BigInt(swapData.tx.value),
      chain: client.chain,
    });
    console.log(`Swap transaction sent. Hash: ${hash}`);

    // Wait for Transaction Confirmation
    const publicClient = getPublicClient('sei');
    const swapReceipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log(`Swap successfully executed. Transaction Hash: ${swapReceipt.transactionHash}`);
    return swapReceipt;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Kame Swap Error]`, errorMessage);
    throw new Error(`Failed to execute swap on Kame: ${errorMessage}`);
  }
}

/**
 * Generates the transaction calldata for a swap without executing it.
 * This is useful for applications that need to display the transaction data
 * to the user before signing.
 *
 * @param fromTokenAddress The address of the input token.
 * @param toTokenAddress The address of the output token.
 * @param amount The amount of the input token to swap.
 * @returns A promise that resolves to the raw transaction data.
 */
export async function generateKameSwapCalldata(
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
): Promise<CalldataResult> {
  try {
    console.log('Generating swap calldata...');
    const account = privateKeyToAccount(privateKey as `0x{string}`);

    const fromTokenDecimals = await services.getERC20TokenInfo(fromTokenAddress as Address, 'sei');
    const toTokenDecimals = await services.getERC20TokenInfo(toTokenAddress as Address, 'sei')
    const fromToken = new Token(1329, fromTokenAddress, fromTokenDecimals.decimals);
    const toToken = new Token(1329, toTokenAddress, toTokenDecimals.decimals);
    const formatAmount = (parseUnits(amount, fromTokenDecimals.decimals)).toString();
    const originAddress = new KameAddress(account.address);

    const params: GetSwapParametersParams = {
      origin: originAddress,
      fromToken,
      amount: formatAmount,
      toToken,
    };

    const swapData = await aggregatorAPI.getSwap(params);
    if (!swapData || !swapData.tx) {
      throw new Error('Kame Aggregator could not generate valid swap calldata.');
    }

    console.log('Successfully generated calldata.');
    return {
      from: account.address,
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value.toString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Kame Generate Calldata Error]`, errorMessage);
    throw new Error(`Failed to generate calldata on Kame: ${errorMessage}`);
  }
}

/**
 * Retrieves a list of tokens from the Kame Aggregator.
 * Can fetch all tokens, specific tokens by ID, or search for tokens.
 *
 * @param params Optional parameters to filter or paginate the token list.
 * @returns A promise that resolves to the list of tokens.
 */
export async function getKameTokens(params?: GetTokenParametersParams): Promise<any> {
  try {
    const logParams = params ? JSON.stringify(params) : 'all tokens';
    console.log(`Fetching tokens from Kame with params: ${logParams}`);
    const tokens = await aggregatorAPI.getTokens(params);

    if (!tokens) {
      console.warn('Received no tokens from the Kame Aggregator.');
      return [];
    }

    console.log(`Successfully fetched tokens.`);
    return tokens;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Kame Get Tokens Error]`, errorMessage);
    throw new Error(`Failed to get tokens from Kame: ${errorMessage}`);
  }
}

/**
 * Retrieves token prices from the Kame Aggregator.
 * Can fetch all prices or prices for specific token IDs.
 *
 * @param params Optional parameters to specify which token prices to fetch.
 * @returns A promise that resolves to a dictionary of token prices.
 */
export async function getKamePrices(params?: GetPricesParametersParams): Promise<TokenPricesResponse> {
  try {
    const logParams = params ? JSON.stringify(params) : 'all prices';
    console.log(`Fetching token prices from Kame with params: ${logParams}`);
    const prices = await aggregatorAPI.getPrices(params);

    if (!prices) {
      console.warn('Received no price data from the Kame Aggregator.');
      return {
        priceById: {},
        nextCursor: 0
      };
    }

    console.log('Successfully fetched token prices.');
    return prices;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Kame Get Prices Error]`, errorMessage);
    throw new Error(`Failed to get prices from Kame: ${errorMessage}`);
  }
}