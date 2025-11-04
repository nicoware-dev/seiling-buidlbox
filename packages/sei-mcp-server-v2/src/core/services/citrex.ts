import CitrexSDK from 'citrex-sdk';
import { Config, TickerReturnType, ProductReturnType, HexString, ServerTimeReturnType, OrderBookReturnType, KlinesReturnType, KlineOptionalArgs, ProductSymbol, TradeHistoryReturnType, AccountHealthReturnType, BalancesReturnType, OpenOrdersReturnType, CalculateMarginRequirementReturnType, OrderArgs, PlaceOrderReturnType, CancelOrderReturnType, ReplacementOrderArgs, CancelOrdersReturnType } from 'citrex-sdk/types';
import { Environment, OrderType, TimeInForce } from 'citrex-sdk/enums';
import { getPrivateKeyAsHex } from '../config.js';
import * as services from './index.js';
import { formatUnits } from 'viem';

// --- Client Initialization ---

const privateKey = getPrivateKeyAsHex();
if (!privateKey) {
    throw new Error('SEI_PRIVATE_KEY is not set in the environment variables.');
}

// Configuration for the Citrex SDK.
let CONFIG = {
    debug: false,
    environment: 'mainnet' as Environment,
    rpc: 'https://evm-rpc.sei-apis.com',
    subAccountId: 0,
};

let Client: CitrexSDK;
try {
    Client = new CitrexSDK(privateKey as `0x${string}`, CONFIG as Config);
    console.log('Citrex SDK initialized successfully.');
} catch (error) {
    console.error('Failed to initialize Citrex SDK:', error);
    throw new Error('Citrex SDK initialization failed.');
}


// --- Type Definitions ---

export interface Product {
    active: boolean;
    baseAsset: string;
    baseAssetAddress: HexString;
    increment: bigint;
    id: number;
    initialLongWeight: bigint;
    initialShortWeight: bigint;
    isMakerRebate: boolean;
    makerFee: bigint;
    maintenanceLongWeight: bigint;
    maintenanceShortWeight: bigint;
    markPrice: number;
    maxQuantity: bigint;
    minQuantity: bigint;
    quoteAsset: string;
    quoteAssetAddress: HexString;
    symbol: string;
    takerFee: bigint;
    type: string;
}

export interface productParsed {
    products: Product[]
}


// --- Service Functions ---

/**
 * Retrieves the configuration currently used by the Citrex SDK instance.
 * @returns {Config} The current SDK configuration object.
 */
export function citrexGetConfig(): Config {
    try {
        console.log('Fetching Citrex SDK configuration...');
        return CONFIG;
    } catch (error) {
        console.error('[Citrex getConfig Error]', error);
        throw new Error('Failed to get config from Citrex service.');
    }
}

/**
 * Updates the configuration and re-initializes the Citrex SDK instance.
 * @param {boolean} debug - Whether to enable debug mode.
 * @param {Environment} environment - The environment to use (mainnet or testnet).
 * @param {string} rpc - The RPC URL to use for the Citrex SDK.
 * @param {number} subAccountId - The sub-account ID to use for the Citrex SDK.
 */
export function citrexUpdateConfig(debug: boolean, environment: Environment, rpc: string, subAccountId: number) {
    try {
        console.log('Updating Citrex SDK configuration...');
        CONFIG = { debug: debug, environment: environment, rpc: rpc, subAccountId: subAccountId };
        Client = new CitrexSDK(privateKey as `0x${string}`, CONFIG as Config);
        console.log('Citrex SDK re-initialized successfully with new config:', CONFIG);
    } catch (error) {
        console.error('[Citrex updateConfig Error]', error);
        throw new Error('Failed to update config and re-initialize Citrex SDK.');
    }
}

/**
 * Fetches the current server time from the Citrex exchange.
 * @returns {Promise<ServerTimeReturnType | undefined>} A promise that resolves to the server time.
 */
export async function citrexGetServerTime(): Promise<ServerTimeReturnType | undefined> {
    try {
        console.log('Fetching server time from Citrex...');
        const result = await Client.getServerTime();
        console.log('Successfully fetched server time:', result);
        return result;
    } catch (error) {
        console.error('[Citrex getServerTime Error]', error);
        return undefined;
    }
}

/**
 * Fetches ticker information for one or all markets.
 * @param {`${string}perp`} [symbol] - Optional. The specific market symbol to fetch the ticker for (e.g., 'seiperp').
 * @returns {Promise<any | undefined>} A promise that resolves to the ticker data. The type is 'any' to accommodate both single and multiple tickers.
 */
export async function citrexGetTickers(symbol?: `${string}perp`): Promise<TickerReturnType> {
    try {
        if (symbol) {
            console.log(`Fetching ticker for symbol: ${symbol}...`);
            const returnTicker = await Client.getTickers(symbol);
            console.log(`Successfully fetched ticker for ${symbol}.`);
            return returnTicker;
        } else {
            console.log('Fetching tickers for all markets...');
            const returnTickers = await Client.getTickers();
            console.log('Successfully fetched all tickers.');
            return returnTickers;
        }
    } catch (error) {
        console.error('[Citrex getTickers Error]', error);
        throw new Error('[Citrex getTickers Error] Failed to fetch ticker data');
    }
}

/**
 * Fetches product information by its identifier (ID or symbol).
 * @param {number | string} identifier - The ID or symbol of the product to fetch.
 * @returns {Promise<ProductReturnType | undefined>} A promise that resolves to the product data.
 */
export async function citrexGetProduct(identifier: number | string): Promise<ProductReturnType | undefined> {
    try {
        console.log(`Fetching product with identifier: ${identifier}...`);
        const result = await Client.getProduct(identifier);
        console.log('Successfully fetched product:', result);
        return result;
    } catch (error) {
        console.error('[Citrex getProduct Error]', error);
        throw new Error('[Citrex getProduct Error] Failed to fetch product data');
    }
}

/**
 * Fetches all products and parses their mark prices.
 * @returns {Promise<productParsed | undefined>} A promise that resolves to the parsed product data.
 */
export async function citrexGetProducts(): Promise<productParsed | undefined> {
    try {
        console.log('Fetching all products from Citrex...');
        const returnProducts = await Client.getProducts();
        const returnProductParsed: productParsed = {
            products: returnProducts.products.map((product: any) => ({
                ...product,
                markPrice: Number(formatUnits(product.markPrice.toString(), 18)),
            }))
        };
        console.log(`Successfully fetched and parsed ${returnProductParsed.products.length} products.`);
        return returnProductParsed;
    } catch (error) {
        console.error('[Citrex getProducts Error]', error);
        return undefined;
    }
}

/**
 * Fetches the order book for a specific market.
 * @param {string} symbol - The market symbol to fetch the order book for (e.g., 'seiperp').
 * @returns {Promise<OrderBookReturnType | undefined>} A promise that resolves to the order book data.
 */
export async function citrexGetOrderBook(symbol: `${string}perp`): Promise<OrderBookReturnType | undefined> {
    try {
        console.log(`Fetching order book for symbol: ${symbol}...`);
        const orderBook = await Client.getOrderBook(symbol);
        console.log(`Successfully fetched order book for ${symbol}.`);
        return orderBook;
    } catch (error) {
        console.error('[Citrex getOrderBook Error]', error);
        return undefined;
    }
}

/**
 * Fetches historical kline (candlestick) data for a product.
 * @param {ProductSymbol} productSymbol - The symbol of the product (e.g., 'seiperp').
 * @param {KlineOptionalArgs} [optionalArgs] - Optional arguments like startTime, endTime, and limit.
 * @returns {Promise<KlinesReturnType | undefined>} A promise that resolves to the kline data.
 */
export async function citrexGetKlines(
    productSymbol: ProductSymbol,
    optionalArgs?: KlineOptionalArgs
): Promise<KlinesReturnType | undefined> {
    try {
        console.log(`Fetching klines for ${productSymbol}...`, optionalArgs || '');
        const result = await Client.getKlines(productSymbol, optionalArgs);
        console.log(`Successfully fetched klines for ${productSymbol}.`);
        return result;
    } catch (error) {
        console.error('[Citrex getKlines Error]', error);
        return undefined;
    }
}

/**
 * Fetches the trade history for a specific product.
 * @param {ProductSymbol} productSymbol - The symbol of the product (e.g., 'seiperp').
 * @param {number} [quantity] - Optional. The number of trades to fetch.
 * @returns {Promise<TradeHistoryReturnType | undefined>} A promise that resolves to the trade history data.
 */
export async function citrexGetTradeHistory(
    productSymbol: ProductSymbol,
    quantity?: number
): Promise<TradeHistoryReturnType | undefined> {
    try {
        console.log(`Fetching trade history for ${productSymbol}...`);
        const result = await Client.getTradeHistory(productSymbol, quantity);
        console.log(`Successfully fetched trade history for ${productSymbol}.`);
        return result;
    } catch (error) {
        console.error('[Citrex getTradeHistory Error]', error);
        return undefined;
    }
}

/**
 * Fetches the health of the user's account, including margin information.
 * @returns {Promise<AccountHealthReturnType | undefined>} A promise that resolves to the account health data.
 */
export async function citrexGetAccountHealth(): Promise<AccountHealthReturnType | undefined> {
    try {
        console.log("Fetching account health...");
        const returnAccountHealth = await Client.getAccountHealth();
        console.log("Successfully fetched account health:", returnAccountHealth);
        return returnAccountHealth;
    } catch (error) {
        console.error('[Citrex getAccountHealth Error]', error);
        return undefined;
    }
}

/**
 * Fetches a list of all asset balances for the user's account.
 * @returns {Promise<BalancesReturnType | undefined>} A promise that resolves to an object containing asset balances.
 */
export async function citrexListBalances(): Promise<BalancesReturnType | undefined> {
    try {
        console.log("Fetching account balances...");
        const result = await Client.listBalances();
        console.log("Successfully fetched account balances.");
        return result;
    } catch (error) {
        console.error('[Citrex listBalances Error]', error);
        return undefined;
    }
}

/**
 * Lists the user's open orders.
 * @param {ProductSymbol} [productSymbol] - Optional. Filter open orders by a specific market symbol.
 * @returns {Promise<OpenOrdersReturnType | undefined>} A promise that resolves to the open orders data.
 */
export async function citrexListOpenOrders(
    productSymbol?: ProductSymbol
): Promise<OpenOrdersReturnType | undefined> {
    try {
        console.log(`Fetching open orders... ${productSymbol ? `for ${productSymbol}` : ''}`);
        const result = await Client.listOpenOrders(productSymbol);
        console.log('Successfully fetched open orders.');
        return result;
    } catch (error) {
        console.error('[Citrex listOpenOrders Error]', error);
        return undefined;
    }
}

/**
 * Calculates the margin requirement for a potential trade.
 * @param {boolean} isBuy - Whether the trade is a buy or sell.
 * @param {number} price - The price of the trade.
 * @param {number} productId - The ID of the product being traded.
 * @param {number} quantity - The quantity of the trade.
 * @returns {Promise<CalculateMarginRequirementReturnType | undefined>} A promise that resolves to the margin requirement.
 */
export async function citrexCalculateMarginRequirement(
    isBuy: boolean,
    price: number,
    productId: number,
    quantity: number
): Promise<CalculateMarginRequirementReturnType | undefined> {
    try {
        console.log(`Calculating margin requirement for productId: ${productId}...`);
        const result = await Client.calculateMarginRequirement(isBuy, price, productId, quantity);
        console.log('Successfully calculated margin requirement:', result);
        return result;
    } catch (error) {
        console.error('[Citrex calculateMarginRequirement Error]', error);
        return undefined;
    }
}

/**
 * Deposits funds into the user's Citrex account.
 * @param {string} amount - The amount to deposit.
 * @returns {Promise<string>} A promise that resolves to a success or failure message.
 */
export async function citrexDeposit(amount: string): Promise<string> {
    try {
        console.log(`Attempting to deposit ${amount}...`);
        const { success, transactionHash } = await Client.deposit(Number(amount));
        if (success) {
            const message = `Deposit successful, transaction hash: ${transactionHash}`;
            console.log(message);
            return message;
        } else {
            console.error("Deposit failed.");
            return "Deposit failed";
        }
    } catch (error) {
        console.error('Error during deposit:', error);
        throw error;
    }
}

/**
 * Withdraws funds from the user's Citrex account.
 * @param {string} amount - The amount to withdraw.
 * @returns {Promise<string>} A promise that resolves to a success or failure message.
 */
export async function citrexWithdraw(amount: string): Promise<string> {
    try {
        console.log(`Attempting to withdraw ${amount}...`);
        const { success } = await Client.withdraw(Number(amount));
        if (success) {
            console.log("Withdrawal successful.");
            return "Withdrawal successful";
        } else {
            console.error("Withdrawal failed.");
            return "Withdrawal failed";
        }
    } catch (error) {
        console.error('Error during withdraw:', error);
        throw error;
    }
}

/**
 * Places a new order on the Citrex exchange.
 * @param {OrderArgs} orderArgs - An object containing the details of the order to be placed.
 * @returns {Promise<PlaceOrderReturnType | undefined>} A promise that resolves to the result of the order placement.
 */
export async function citrexPlaceOrder(
    orderArgs: OrderArgs
): Promise<PlaceOrderReturnType | undefined> {
    try {
        console.log(`Placing order...`, orderArgs);
        const result = await Client.placeOrder(orderArgs);
        console.log('Successfully placed order:', result);
        return result;
    } catch (error) {
        console.error('[Citrex placeOrder Error]', error);
        return undefined;
    }
}

/**
 * Places multiple new orders on the Citrex exchange in a single transaction.
 * @param {OrderArgs[]} ordersArgs - An array of objects containing the details for each order.
 * @returns {Promise<PlaceOrderReturnType[] | undefined>} A promise that resolves to an array of placement results.
 */
export async function citrexPlaceOrders(
    ordersArgs: OrderArgs[]
): Promise<PlaceOrderReturnType[] | undefined> {
    try {
        console.log(`Placing ${ordersArgs.length} orders...`);
        const result = await Client.placeOrders(ordersArgs);
        console.log('Successfully placed orders:', result);
        return result;
    } catch (error) {
        console.error('[Citrex placeOrders Error]', error);
        return undefined;
    }
}

/**
 * Cancels an existing open order.
 * @param {`0x${string}`} orderId - The ID of the order to be canceled.
 * @param {number} productId - The ID of the product associated with the order.
 * @returns {Promise<CancelOrderReturnType | undefined>} A promise that resolves to the cancellation confirmation.
 */
export async function citrexCancelOrder(
    orderId: `0x${string}`,
    productId: number
): Promise<CancelOrderReturnType | undefined> {
    try {
        console.log(`Canceling order ${orderId} for productId ${productId}...`);
        const result = await Client.cancelOrder(orderId, productId);
        console.log('Successfully canceled order:', result);
        return result;
    } catch (error) {
        console.error('[Citrex cancelOrder Error]', error);
        return undefined;
    }
}

/**
 * Cancels multiple existing open orders in a single transaction.
 * @param {[`0x${string}`, number][]} ordersArgs - An array of tuples, each containing an orderId and productId.
 * @returns {Promise<CancelOrderReturnType[] | undefined>} A promise that resolves to an array of cancellation confirmations.
 */
export async function citrexCancelOrders(
    ordersArgs: [`0x${string}`, number][]
): Promise<CancelOrderReturnType[] | undefined> {
    try {
        console.log(`Canceling ${ordersArgs.length} orders...`);
        const result = await Client.cancelOrders(ordersArgs);
        console.log('Successfully canceled orders:', result);
        return result;
    } catch (error) {
        console.error('[Citrex cancelOrders Error]', error);
        return undefined;
    }
}

/**
 * Cancels an existing order and replaces it with a new one in a single transaction.
 * @param {`0x${string}`} orderId - The ID of the order to be canceled.
 * @param {ReplacementOrderArgs} orderArgs - The arguments for the new replacement order.
 * @returns {Promise<PlaceOrderReturnType | undefined>} A promise that resolves to the placement result of the new order.
 */
export async function citrexCancelAndReplaceOrder(
    orderId: `0x${string}`,
    orderArgs: ReplacementOrderArgs
): Promise<PlaceOrderReturnType | undefined> {
    try {
        console.log(`Canceling and replacing order ${orderId}...`);
        const result = await Client.cancelAndReplaceOrder(orderId, orderArgs);
        console.log('Successfully canceled and replaced order:', result);
        return result;
    } catch (error) {
        console.error('[Citrex cancelAndReplaceOrder Error]', error);
        return undefined;
    }
}

/**
 * Cancels all open orders for a specific product.
 * @param {number} productId - The ID of the product for which to cancel all open orders.
 * @returns {Promise<CancelOrdersReturnType | undefined>} A promise that resolves to the cancellation result.
 */
export async function citrexCancelOpenOrdersForProduct(
    productId: number
): Promise<CancelOrdersReturnType | undefined> {
    try {
        console.log(`Canceling all open orders for product ID: ${productId}...`);
        const result = await Client.cancelOpenOrdersForProduct(productId);
        console.log(`Successfully canceled all open orders for product ID: ${productId}.`);
        return result;
    } catch (error) {
        console.error('[Citrex cancelOpenOrdersForProduct Error]', error);
        return undefined;
    }
}

