import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";
import { Environment, OrderType, TimeInForce } from "citrex-sdk/enums";

/**
 * Registers tools related to the Citrex protocol.
 * @param server The MCP server instance
 */
export function registerCitrexTools(server: McpServer) {
    // Fetches ticker information for one or all markets.
    server.tool(
        "citrex_get_tickers",
        "Fetches ticker information for one or all markets from the Citrex protocol.",
        {
            symbol: z.string().optional().describe("Optional. The specific market symbol to fetch the ticker for (e.g., 'BTCperp')."),
        },
        async ({ symbol }) => {
            try {
                const formattedSymbol = symbol ? `${symbol.replace(/perp$/, '')}perp` as `${string}perp` : undefined;

                console.log(`Calling citrexGetTickers with symbol: ${formattedSymbol}`);
                const tickers = await services.citrexGetTickers(formattedSymbol);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(tickers, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex tickers: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches product information by its identifier (ID or symbol).
    server.tool(
        "citrex_get_product",
        "Fetches product information by its identifier (ID or symbol).",
        {
            identifier: z.union([
                z.number().int().positive().describe("Numeric product ID (must be a positive integer) (e.g., 1004)"),
                z.string().min(1).describe("String product symbol (e.g., 'seiprep')")
            ]).describe("Product identifier: either a numeric ID or a symbol string."),
        },
        async ({ identifier }) => {
            try {
                console.log(`Calling citrexGetProduct with identifier: ${identifier}`);
                const product = await services.citrexGetProduct(identifier);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(product, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex product: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches all products and parses their mark prices.
    server.tool(
        "citrex_get_products",
        "Fetches all products and parses their mark prices.",
        {},
        async () => {
            try {
                console.log('Calling citrexGetProducts...');
                const products = await services.citrexGetProducts();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(products, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex products: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches the current server time from the Citrex exchange.
    server.tool(
        "citrex_get_server_time",
        "Fetches the current server time from the Citrex exchange.",
        {},
        async () => {
            try {
                console.log('Calling citrexGetServerTime...');
                const serverTime = await services.citrexGetServerTime();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(serverTime, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex server time: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Retrieves the configuration currently used by the Citrex SDK instance.
    server.tool(
        "citrex_get_config",
        "Retrieves the configuration currently used by the Citrex SDK instance.",
        {},
        async () => {
            try {
                console.log('Calling citrexGetConfig...');
                const config = services.citrexGetConfig();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(config, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex config: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches the order book for a specific market.
    server.tool(
        "citrex_get_order_book",
        "Fetches the order book for a specific market.",
        {
            symbol: z.string().describe("The market symbol to fetch the order book for (e.g., 'seiperp', 'ethperp', 'btcperp')."),
        },
        async ({ symbol }) => {
            try {
                const formattedSymbol = `${symbol.replace(/perp$/, '')}perp` as `${string}perp`;
                console.log(`Calling citrexGetOrderBook with symbol: ${formattedSymbol}`);
                const orderBook = await services.citrexGetOrderBook(formattedSymbol);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(orderBook, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex order book: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches historical kline (candlestick) data for a product.
    server.tool(
        "citrex_get_klines",
        "Fetches historical kline (candlestick) data for a product.",
        {
            productSymbol: z.string().describe("The symbol of the product (e.g., 'seiperp', 'ethperp', 'btcperp')."),
            optionalArgs: z.object({
                startTime: z.number().optional(),
                endTime: z.number().optional(),
                limit: z.number().optional(),
            }).optional().describe("Optional arguments like startTime, endTime, and limit."),
        },
        async ({ productSymbol, optionalArgs }) => {
            try {
                const formattedSymbol = `${productSymbol.replace(/perp$/, '')}perp` as `${string}perp`;
                console.log(`Calling citrexGetKlines with symbol: ${productSymbol}`);
                const klines = await services.citrexGetKlines(formattedSymbol, optionalArgs);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(klines, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex klines: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches the trade history for a specific product.
    server.tool(
        "citrex_get_trade_history",
        "Fetches the trade history for a specific product.",
        {
            productSymbol: z.string().describe("The symbol of the product (e.g., 'seiperp', 'ethperp', 'btcperp')."),
            quantity: z.number().optional().describe("Optional. The number of trades to fetch."),
        },
        async ({ productSymbol, quantity = 10 }) => {
            try {
                const formattedSymbol = `${productSymbol.replace(/perp$/, '')}perp` as `${string}perp`;
                console.log(`Calling citrexGetTradeHistory with symbol: ${formattedSymbol}`);
                const tradeHistory = await services.citrexGetTradeHistory(formattedSymbol, quantity);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(tradeHistory, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex trade history: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches the health of the user's account, including margin information.
    server.tool(
        "citrex_get_account_health",
        "Fetches the health of the user's account, including margin information.",
        {},
        async () => {
            try {
                console.log('Calling citrexGetAccountHealth...');
                const accountHealth = await services.citrexGetAccountHealth();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(accountHealth, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex account health: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fetches a list of all asset balances for the user's account.
    server.tool(
        "citrex_list_balances",
        "Fetches a list of all asset balances for the user's account.",
        {},
        async () => {
            try {
                console.log('Calling citrexListBalances...');
                const balances = await services.citrexListBalances();

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(balances, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex balances: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Lists the user's open orders.
    server.tool(
        "citrex_list_open_orders",
        "Lists the user's open orders.",
        {
            productSymbol: z.string().optional().describe("Optional. Filter open orders by a specific market symbol."),
        },
        async ({ productSymbol }) => {
            try {
                const formattedSymbol = productSymbol ? `${productSymbol.replace(/perp$/, '')}perp` as `${string}perp` : undefined;
                console.log(`Calling citrexListOpenOrders... ${formattedSymbol ? `for ${formattedSymbol}` : ''}`);
                const openOrders = await services.citrexListOpenOrders(formattedSymbol);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(openOrders, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching Citrex open orders: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Calculates the margin requirement for a potential trade.
    server.tool(
        "citrex_calculate_margin_requirement",
        "Calculates the margin requirement for a potential trade.",
        {
            isBuy: z.boolean().describe("Whether the trade is a buy or sell."),
            price: z.number().describe("The price of the trade."),
            productId: z.number().describe("The ID of the product being traded."),
            quantity: z.number().describe("The quantity of the trade."),
        },
        async ({ isBuy, price, productId, quantity }) => {
            try {
                console.log(`Calling citrexCalculateMarginRequirement for productId: ${productId}`);
                const marginRequirement = await services.citrexCalculateMarginRequirement(isBuy, price, productId, quantity);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(marginRequirement, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error calculating Citrex margin requirement: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Deposits funds into the user's Citrex account.
    server.tool(
        "citrex_deposit",
        "Deposits funds into the user's Citrex account.",
        {
            amount: z.string().describe("The amount to deposit."),
        },
        async ({ amount }) => {
            try {
                console.log(`Calling citrexDeposit with amount: ${amount}`);
                const result = await services.citrexDeposit(amount);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ message: result }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error during Citrex deposit: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Withdraws funds from the user's Citrex account.
    server.tool(
        "citrex_withdraw",
        "Withdraws funds from the user's Citrex account.",
        {
            amount: z.string().describe("The amount to withdraw."),
        },
        async ({ amount }) => {
            try {
                console.log(`Calling citrexWithdraw with amount: ${amount}`);
                const result = await services.citrexWithdraw(amount);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ message: result }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error during Citrex withdrawal: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Places a new order on the Citrex exchange.
    server.tool(
        "citrex_place_order",
        "Places a new order on the Citrex exchange.",
        {
            orderArgs: z.object({
                isBuy: z.boolean().describe("Whether to buy (true) or sell (false)"),
                price: z.number().positive().describe("The price of the asset you intend to order."),
                productId: z.number().int().positive().describe("The product ID of asset"),
                quantity: z.number().positive().describe("The amount of the asset you intend to order ex. 1, 2"),
                orderType: z.nativeEnum(OrderType).optional().describe("The type of order (default: MARKET)"),
                timeInForce: z.nativeEnum(TimeInForce).optional().describe("The time in force for the order (default: FOK)"),
                expiration: z.number().optional().describe("The expiration time of the order in milliseconds (default: now + 30 days)"),
                nonce: z.number().optional().describe("A unique identifier for the order (default: current unix timestamp in nano seconds)"),
                priceIncrement: z.number().optional().describe("The price precision for the product (required for MARKET orders) find it in the product info under the 'increment' key. in wei ex. (10000000000000)"),
                slippage: z.number().optional().describe("The percentage by which to adjust the price when orderType is MARKET (default: 2.5%)"),
            })
        },
        async ({ orderArgs }) => {
            try {
                console.log('Calling citrexPlaceOrder...');
                const result = await services.citrexPlaceOrder(orderArgs as any);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error placing Citrex order: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Places multiple new orders on the Citrex exchange in a single transaction.
    server.tool(
        "citrex_place_orders",
        "Places multiple new orders on the Citrex exchange in a single transaction.",
        {
            ordersArgs: z.array(z.record(z.any())).describe("An array of objects containing the details for each order."),
        },
        async ({ ordersArgs }) => {
            try {
                console.log(`Calling citrexPlaceOrders with ${ordersArgs.length} orders...`);
                const result = await services.citrexPlaceOrders(ordersArgs as any[]);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error placing multiple Citrex orders: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancels an existing open order.
    server.tool(
        "citrex_cancel_order",
        "Cancels an existing open order.",
        {
            orderId: z.string().describe("The ID of the order to be canceled."),
            productId: z.number().describe("The ID of the product associated with the order."),
        },
        async ({ orderId, productId }) => {
            try {
                console.log(`Calling citrexCancelOrder for orderId: ${orderId}`);
                const result = await services.citrexCancelOrder(orderId as `0x${string}`, productId);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error canceling Citrex order: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancels multiple existing open orders in a single transaction.
    server.tool(
        "citrex_cancel_orders",
        "Cancels multiple existing open orders in a single transaction.",
        {
            ordersArgs: z.array(z.tuple([z.string(), z.number()])).describe("An array of tuples, each containing an orderId and productId."),
        },
        async ({ ordersArgs }) => {
            try {
                console.log(`Calling citrexCancelOrders with ${ordersArgs.length} orders...`);
                const result = await services.citrexCancelOrders(ordersArgs as [`0x${string}`, number][]);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error canceling multiple Citrex orders: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancels an existing order and replaces it with a new one in a single transaction.
    server.tool(
        "citrex_cancel_and_replace_order",
        "Cancels an existing order and replaces it with a new one in a single transaction.",
        {
            orderId: z.string().describe("The ID of the order to be canceled."),
            orderArgs: z.object({
                orderId: z.string().startsWith("0x").describe("The ID of the order to replace"),
                isBuy: z.boolean().describe("Whether to buy (true) or sell (false)"),
                price: z.number().positive().describe("The price of the asset you intend to order"),
                productId: z.number().int().positive().describe("The product ID of asset"),
                quantity: z.number().positive().describe("The amount of the asset you intend to order"),
                expiration: z.number().optional().describe("The expiration time of the order in milliseconds (default: now + 30 days)"),
                nonce: z.number().optional().describe("A unique identifier for the order (default: current unix timestamp in nano seconds)"),
            }),
        },
        async ({ orderId, orderArgs }) => {
            try {
                console.log(`Calling citrexCancelAndReplaceOrder for orderId: ${orderId}`);
                const result = await services.citrexCancelAndReplaceOrder(orderId as `0x${string}`, orderArgs as any);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error canceling and replacing Citrex order: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancels all open orders for a specific product.
    server.tool(
        "citrex_cancel_open_orders_for_product",
        "Cancels all open orders for a specific product.",
        {
            productId: z.number().describe("The ID of the product for which to cancel all open orders."),
        },
        async ({ productId }) => {
            try {
                console.log(`Calling citrexCancelOpenOrdersForProduct for productId: ${productId}`);
                const result = await services.citrexCancelOpenOrdersForProduct(productId);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(result, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error canceling open orders for product: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Updates the configuration and re-initializes the Citrex SDK instance.
    server.tool(
        "citrex_update_config",
        "Updates the configuration and re-initializes the Citrex SDK instance.",
        {
            debug: z.boolean().optional().describe("Whether to enable debug mode."),
            environment: z.enum(['mainnet', 'testnet']).optional().describe("The environment to use (mainnet or testnet)."),
            rpc: z.string().optional().describe("The RPC URL to use for the Citrex SDK."),
            subAccountId: z.number().optional().describe("The sub-account ID to use for the Citrex SDK."),
        },
        async ({ debug = false, environment = 'mainnet', rpc = 'https://evm-rpc.sei-apis.com', subAccountId = 0 }) => {
            try {
                console.log('Calling citrexUpdateConfig...');
                services.citrexUpdateConfig(debug, environment as Environment, rpc, subAccountId);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ success: true, message: "Citrex config updated successfully." }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error updating Citrex config: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );
}

