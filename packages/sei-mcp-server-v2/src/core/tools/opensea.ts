import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as services from "../services/index.js";

/**
 * Registers tools related to the OpenSea NFT marketplace.
 * @param server The MCP server instance
 */
export function registerOpenSeaTools(server: McpServer) {
    // Get an OpenSea Account Profile
    server.tool(
        "get_opensea_account",
        "Get an OpenSea Account Profile.",
        {
            addressOrUsername: z.string().describe("The address or username of the account to fetch."),
        },
        async ({ addressOrUsername }) => {
            try {
                const accountProfile = await services.getAccount(addressOrUsername);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(accountProfile, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching OpenSea account: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a list of OpenSea collections for the Sei chain
    server.tool(
        "get_opensea_collections",
        "Get a list of OpenSea collections for the Sei chain.",
        {},
        async () => {
            try {
                const collections = await services.getCollections();
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(collections, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching OpenSea collections: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get stats for a single collection
    server.tool(
        "get_opensea_collection_stats",
        "Get stats for a single collection.",
        {
            collectionSlug: z.string().describe("Unique string to identify a collection on OpenSea."),
        },
        async ({ collectionSlug }) => {
            try {
                const stats = await services.getCollectionStats(collectionSlug);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(stats, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching collection stats: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a single NFT's metadata, traits, and ownership information
    server.tool(
        "get_opensea_nft",
        "Get a single NFT's metadata, traits, and ownership information from OpenSea.",
        {
            address: z.string().describe("The NFT contract address."),
            identifier: z.string().describe("The token ID of the NFT."),
        },
        async ({ address, identifier }) => {
            try {
                const nftDetails = await services.getNFT(address, identifier);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(nftDetails, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching NFT from OpenSea: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get NFTs owned by a given account address on the Sei chain
    server.tool(
        "get_opensea_nfts_by_account",
        "Get NFTs owned by a given account address on the Sei chain.",
        {
            address: z.string().describe("The account address to get NFTs for."),
        },
        async ({ address }) => {
            try {
                const nfts = await services.getNFTsByAccount(address);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(nfts, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching NFTs by account: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get multiple NFTs for a collection
    server.tool(
        "get_opensea_nfts_by_collection",
        "Get multiple NFTs for a collection.",
        {
            collectionSlug: z.string().describe("The slug of the collection. e.g.: sei-nft-collection"),
        },
        async ({ collectionSlug }) => {
            try {
                const nfts = await services.getNFTsByCollection(collectionSlug);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(nfts, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching NFTs by collection: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a list of events for an account
    server.tool(
        "get_opensea_events_by_account",
        "Get a list of events for an account.",
        {
            address: z.string().describe("The account address."),
            options: z.object({
                after: z.number().optional().describe("The start timestamp for the event search."),
                before: z.number().optional().describe("The end timestamp for the event search.")
            }).optional().describe("Optional parameters for filtering events by time.")
        },
        async ({ address, options }) => {
            try {
                const events = await services.getEventsByAccount(address, options as { after?: number, before?: number });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(events, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching events by account: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a list of events for a collection
    server.tool(
        "get_opensea_events_by_collection",
        "Get a list of events for a collection.",
        {
            collectionSlug: z.string().describe("The collection slug. e.g.: sei-nft-collection"),
        },
        async ({ collectionSlug }) => {
            try {
                const events = await services.getEventsByCollection(collectionSlug);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(events, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching events by collection: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a list of events for a single NFT
    server.tool(
        "get_opensea_events_by_nft",
        "Get a list of events for a single NFT.",
        {
            address: z.string().describe("The NFT contract address."),
            identifier: z.string().describe("The token ID of the NFT."),
        },
        async ({ address, identifier }) => {
            try {
                const events = await services.getEventsByNFT(address, identifier);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(events, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching events by NFT: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get the cheapest priced active, valid listings on a single collection
    server.tool(
        "get_opensea_best_listings_by_collection",
        "Get the cheapest priced active, valid listings on a single collection.",
        {
            collectionSlug: z.string().describe("Unique string to identify a collection on OpenSea. e.g.: sei-nft-collection"),
        },
        async ({ collectionSlug }) => {
            try {
                const listings = await services.getBestListingsByCollection(collectionSlug);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(listings, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching best listings for collection: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get the best (lowest priced) listing for a single NFT
    server.tool(
        "get_opensea_best_listing_for_nft",
        "Get the best (lowest priced) listing for a single NFT.",
        {
            collectionSlug: z.string().describe("The collection slug of the NFT. e.g.: sei-nft-collection"),
            identifier: z.string().describe("The token ID of the NFT."),
        },
        async ({ collectionSlug, identifier }) => {
            try {
                const listing = await services.getBestListingForNFT(collectionSlug, identifier);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(listing, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching best listing for NFT: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Create and submit a listing for an asset on OpenSea
    server.tool(
        "create_opensea_listing",
        "Create and submit a listing for an asset on OpenSea.",
        {
            params: z.object({
                asset: z.object({
                    tokenAddress: z.string(),
                    tokenId: z.string()
                }).describe("The asset to list, including its contract address and token ID."),
                accountAddress: z.string().describe("The address of the account creating the listing."),
                startAmount: z.string().describe("The starting price for the listing."),
                endAmount: z.string().optional().describe("The ending price for the listing (for dutch auctions)."),
                quantity: z.string().optional().describe("The number of items to list."),
                domain: z.string().optional().describe("The domain of the order, defaults to 'opensea.io'."),
                salt: z.string().optional().describe("An optional random salt for the order."),
                listingTime: z.number().optional().describe("The Unix timestamp (in seconds) for when the listing should start."),
                expirationTime: z.number().optional().describe("The Unix timestamp (in seconds) for when the listing should expire."),
                paymentTokenAddress: z.string().optional().describe("The address of the ERC20 token to accept for payment. Defaults to the native token."),
                buyerAddress: z.string().optional().describe("The address of the buyer who is allowed to fulfill the order. If not specified, any buyer can fulfill."),
                englishAuction: z.boolean().optional().describe("Whether this is an English auction."),
                excludeOptionalCreatorFees: z.boolean().optional().describe("Whether to exclude optional creator fees from the listing."),
                zone: z.string().optional().describe("The zone for the order. Defaults to the null address."),
            })
        },
        async ({ params }) => {
            try {
                const listingParams = {
                    ...params,
                    startAmount: params.startAmount,
                    endAmount: params.endAmount,
                    quantity: params.quantity,
                    salt: params.salt,
                };
                const order = await services.createListing(listingParams);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(order, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating OpenSea listing: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Create and submit an offer for an asset on OpenSea
    server.tool(
        "create_opensea_offer",
        "Create and submit an offer for an asset on OpenSea.",
        {
            asset: z.object({
                tokenAddress: z.string(),
                tokenId: z.string(),
            }).describe("The asset to make an offer on, including its contract address and token ID."),
            accountAddress: z.string().describe("The address of the account creating the offer."),
            startAmount: z.string().describe("The price for the offer."),
            domain: z.string().optional().describe("The domain of the order, defaults to 'opensea.io'."),
            salt: z.string().optional().describe("An optional random salt for the order."),
            expirationTime: z.string().optional().describe("The Unix timestamp (in seconds) for when the offer should expire."),
            paymentTokenAddress: z.string().optional().describe("The address of the ERC20 token to use for payment. Defaults to the native token."),
            quantity: z.string().optional().describe("The number of items to offer for."),
            excludeOptionalCreatorFees: z.boolean().optional().describe("Whether to exclude optional creator fees from the offer."),
            zone: z.string().optional().describe("The zone for the order. Defaults to the null address."),
        },
        async ({ asset, accountAddress, startAmount, domain, salt, expirationTime, paymentTokenAddress, quantity, excludeOptionalCreatorFees, zone }) => {
            try {
                const order = await services.createOffer({ asset, accountAddress, startAmount, domain, salt, expirationTime, paymentTokenAddress, quantity, excludeOptionalCreatorFees, zone });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(order, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating OpenSea offer: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Fulfill an order for an asset (either a listing or an offer)
    server.tool(
        "fulfill_opensea_order",
        "Fulfill an order for an asset (either a listing or an offer).",
        {
            order: z.any().describe("The order object from the SDK or API."),
            accountAddress: z.string().describe("The address of the account fulfilling the order."),
            domain: z.string().optional().describe("The domain of the order, defaults to 'opensea.io'."),
            recipientAddress: z.string().optional().describe("The address of the recipient if different from the fulfiller."),
            overrides: z.any().optional().describe("Optional transaction overrides."),
        },
        async ({ order, accountAddress, domain, recipientAddress, overrides }) => {
            try {
                const transactionHash = await services.fulfillOrder({ order, accountAddress, domain, recipientAddress, overrides });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ success: true, transactionHash }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fulfilling OpenSea order: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Create and submit a collection offer
    server.tool(
        "create_opensea_collection_offer",
        "Create and submit a collection offer.",
        {
            collectionSlug: z.string().describe("The slug of the collection to offer on. e.g.: sei-nft-collection"),
            accountAddress: z.string().describe("The address of the account creating the offer."),
            amount: z.string().describe("The amount of the offer in the payment token."),
            quantity: z.number().describe("The number of items to offer for."),
            domain: z.string().optional().describe("The domain of the order, defaults to 'opensea.io'."),
            salt: z.string().optional().describe("An optional random salt for the order."),
            expirationTime: z.union([z.number(), z.string()]).optional().describe("The Unix timestamp (in seconds) or ISO date string for when the offer should expire."),
            paymentTokenAddress: z.string().describe("The address of the ERC20 token to use for payment."),
            excludeOptionalCreatorFees: z.boolean().optional().describe("Whether to exclude optional creator fees from the offer."),
            offerProtectionEnabled: z.boolean().optional().describe("Whether to enable offer protection."),
            traitType: z.string().optional().describe("The type of trait to filter by."),
            traitValue: z.string().optional().describe("The value of the trait to filter by."),
        },
        async (params) => {
            try {
                const collectionOffer = await services.createCollectionOffer(params);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(collectionOffer, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error creating OpenSea collection offer: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Buys an NFT by first fetching its best listing and then fulfilling the order
    server.tool(
        "buy_opensea_nft",
        "Buys an NFT by first fetching its best listing from the API and then fulfilling the order using the SDK.",
        {
            collectionSlug: z.string().describe("The collection slug of the NFT to buy. e.g.: sei-nft-collection"),
            identifier: z.string().describe("The token ID of the NFT to buy."),
            accountAddress: z.string().describe("The wallet address of the buyer."),
        },
        async ({ collectionSlug, identifier, accountAddress }) => {
            try {
                const transactionHash = await services.buyNFT(collectionSlug, identifier, accountAddress);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ success: true, transactionHash }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error buying NFT: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancel an order onchain
    server.tool(
        "cancel_opensea_order",
        "Cancel an order onchain, preventing it from ever being fulfilled.",
        {
            order: z.any().describe("The order object to cancel."),
            accountAddress: z.string().describe("The address of the account cancelling the order."),
            domain: z.string().optional().describe("The domain of the order, defaults to 'opensea.io'."),
        },
        async ({ order, accountAddress, domain }) => {
            try {
                await services.cancelOrder({ order, accountAddress, domain });
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({ success: true, message: "Order cancelled successfully." }, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error cancelling OpenSea order: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );

    // Get a smart contract for a given address on the Sei chain
    server.tool(
        "get_opensea_contract",
        "Get a smart contract for a given address on the Sei chain.",
        {
            address: z.string().describe("The contract address."),
        },
        async ({ address }) => {
            try {
                const contractDetails = await services.getContract(address);
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(contractDetails, null, 2)
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error fetching OpenSea contract: ${error instanceof Error ? error.message : String(error)}`
                    }],
                    isError: true
                };
            }
        }
    );
}