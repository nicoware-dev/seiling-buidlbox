import { OpenSeaSDK, Chain, OrderV2, CollectionOffer, AssetWithTokenId, Order } from 'opensea-js';
import { BigNumberish, ethers, Overrides } from 'ethers';
import { getPrivateKeyAsHex, getOpenSeaApiKey } from '../config.js';
import { getRpcUrl } from '../chains.js';

// --- Helper Functions ---

/**
 * Initializes and returns an OpenSeaSDK instance.
 * This is called by each service function that needs to interact with the SDK.
 * @returns An instance of OpenSeaSDK
 */
const getOpenSeaSDK = (): OpenSeaSDK => {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
        throw new Error('Private key not available. Ensure it is set in your environment or config.');
    }

    const rpcUrl = getRpcUrl('sei');
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const signer = new ethers.Wallet(privateKey, provider);
    (signer as any).signTypedData = async (domain: any, types: any, value: any) => {
        return signer.signTypedData(domain, types, value);
    };

    return new OpenSeaSDK(signer as any, {
        chain: Chain.Sei,
        apiKey: getOpenSeaApiKey(),
    });
};

/**
 * Initializes and returns an ethers.js Wallet instance for direct contract interactions.
 * @returns An instance of ethers.Wallet
 */
const getSigner = (): ethers.Wallet => {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');
    const rpcUrl = getRpcUrl('sei');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Wallet(privateKey, provider);
}

// --- SDK-based Service Functions ---

/**
 * Create and submit a listing for an asset on OpenSea.
 * @param params Parameters for creating the listing.
 * @param params.asset The asset to list (tokenAddress and tokenId).
 * @param params.accountAddress The seller's wallet address.
 * @param params.startAmount The starting price for the listing.
 * @param params.endAmount The ending price for the listing (optional).
 * @param params.quantity The quantity of the asset to list (optional).
 * @param params.domain The domain for the listing (optional).
 * @param params.salt The salt for the listing (optional).
 * @param params.listingTime The listing time for the listing (optional).
 * @param params.expirationTime The expiration time for the listing (optional).
 * @param params.paymentTokenAddress The payment token address for the listing (optional).
 * @param params.buyerAddress The buyer's wallet address for the listing (optional).
 * @param params.englishAuction Whether the listing is an English auction (optional).
 * @param params.excludeOptionalCreatorFees Whether to exclude optional creator fees (optional).
 * @param params.zone The zone for the listing (optional).
 * @returns The created OrderV2 object from the SDK.
 */
export async function createListing(params: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    endAmount?: BigNumberish;
    quantity?: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    listingTime?: number;
    expirationTime?: number;
    paymentTokenAddress?: string;
    buyerAddress?: string;
    englishAuction?: boolean;
    excludeOptionalCreatorFees?: boolean;
    zone?: string;
}): Promise<OrderV2> {
    try {
        console.log(`Creating listing for asset ${params.asset.tokenAddress}/${params.asset.tokenId}`);
        const sdk = getOpenSeaSDK();
        const { startAmount, endAmount, quantity, salt, ...rest } = params;

        return await sdk.createListing({
            ...rest,
            startAmount: startAmount.toString(),
            endAmount: endAmount?.toString(),
            quantity: quantity?.toString(),
            salt: salt?.toString(),
            paymentTokenAddress: params.paymentTokenAddress || ethers.ZeroAddress,
            zone: params.zone || ethers.ZeroAddress,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create OpenSea listing: ${message}`);
    }
}

/**
 * Create and submit an offer on an asset.
 * @param params Parameters for creating the offer.
 * @param params.asset The asset to make an offer on.
 * @param params.accountAddress The buyer's wallet address.
 * @param params.startAmount The offer price.
 * @param params.domain The domain for the offer (optional).
 * @param params.salt The salt for the offer (optional).
 * @param params.expirationTime The expiration time for the offer (optional).
 * @param params.paymentTokenAddress The payment token address for the offer (optional).
 * @param params.quantity The quantity of the asset to offer (optional).
 * @param params.excludeOptionalCreatorFees Whether to exclude optional creator fees (optional).
 * @param params.zone The zone for the offer (optional).
 * @returns The created OrderV2 object from the SDK.
 */
export async function createOffer(params: {
    asset: AssetWithTokenId;
    accountAddress: string;
    startAmount: BigNumberish;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: BigNumberish;
    paymentTokenAddress?: string;
    quantity?: BigNumberish;
    excludeOptionalCreatorFees?: boolean;
    zone?: string;
}): Promise<OrderV2> {
    try {
        console.log(`Creating offer for asset ${params.asset.tokenAddress}/${params.asset.tokenId}`);
        const sdk = getOpenSeaSDK();
        const { startAmount, expirationTime, quantity, salt, ...rest } = params;

        return await sdk.createOffer({
            ...rest,
            startAmount: startAmount.toString(),
            expirationTime: expirationTime?.toString(),
            quantity: quantity?.toString(),
            salt: salt?.toString(),
            paymentTokenAddress: params.paymentTokenAddress || ethers.ZeroAddress,
            zone: params.zone || ethers.ZeroAddress,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create OpenSea offer: ${message}`);
    }
}

/**
 * Fulfill an order for an asset (either a listing or an offer).
 * @param params Parameters for fulfilling the order.
 * @param params.order The order object from the SDK or API.
 * @param params.accountAddress The address of the account fulfilling the order.
 * @param params.domain The domain for the fulfillment (optional).
 * @param params.recipientAddress The recipient address for the fulfillment (optional).
 * @param params.overrides The overrides for the fulfillment (optional).
 * @returns Transaction hash of the fulfillment transaction.
 */
export async function fulfillOrder(params: {
    order: OrderV2 | Order;
    accountAddress: string;
    domain?: string;
    recipientAddress?: string;
    overrides?: Overrides;
}): Promise<string> {
    try {
        console.log(`Fulfilling order by ${params.accountAddress}`);
        const sdk = getOpenSeaSDK();
        return await sdk.fulfillOrder(params);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fulfill OpenSea order: ${message}`);
    }
}

/**
 * Create and submit a collection offer.
 * @param params Parameters for creating the collection offer.
 * @returns The CollectionOffer that was created.
 */
export async function createCollectionOffer(params: {
    collectionSlug: string;
    accountAddress: string;
    amount: BigNumberish;
    quantity: number;
    domain?: string;
    salt?: BigNumberish;
    expirationTime?: number | string;
    paymentTokenAddress: string;
    excludeOptionalCreatorFees?: boolean;
    offerProtectionEnabled?: boolean;
    traitType?: string;
    traitValue?: string;
}): Promise<CollectionOffer | null> {
    try {
        console.log(`Creating collection offer for ${params.collectionSlug}`);
        const sdk = getOpenSeaSDK();
        const { amount, salt, ...rest } = params;

        return await sdk.createCollectionOffer({
            ...rest,
            amount: amount.toString(),
            salt: salt?.toString(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to create OpenSea collection offer: ${message}`);
    }
}

/**
 * Cancel an order onchain, preventing it from ever being fulfilled.
 * @param params Parameters for cancelling the order.
 * @param params.order The order to cancel.
 * @param params.accountAddress The address of the account cancelling the order.
 * @param params.domain The domain for the cancellation (optional).
 */
export async function cancelOrder(params: {
    order: OrderV2;
    accountAddress: string;
    domain?: string;
}): Promise<void> {
    try {
        console.log(`Cancelling order for account ${params.accountAddress}`);
        const sdk = getOpenSeaSDK();
        await sdk.cancelOrder(params);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to cancel OpenSea order: ${message}`);
    }
}

// --- API-based Service Functions ---

const OPENSEA_API_BASE_URL = 'https://api.opensea.io/api/v2';
const chain = 'sei';

/**
 * A generic fetch handler for interacting with the OpenSea REST API.
 * @param endpoint The API endpoint to request (e.g., '/collections').
 * @returns The JSON response from the API.
 */
async function fetchOpenSeaAPI(endpoint: string) {
    const apiKey = getOpenSeaApiKey() || '';
    if (!apiKey) {
        console.warn('Warning: OPENSEA_API_KEY environment variable not set. API calls may be rate-limited.');
    }

    const response = await fetch(`${OPENSEA_API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'X-API-KEY': apiKey }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenSea API error! Status: ${response.status}, Body: ${errorBody}`);
    }
    return response.json();
}

/**
 * Get an OpenSea Account Profile.
 * @param addressOrUsername The address or username of the account to fetch.
 * @returns Promise with the account profile data.
 */
export async function getAccount(addressOrUsername: string): Promise<any> {
    try {
        console.log(`Fetching account profile for: ${addressOrUsername}`);
        const endpoint = `/accounts/${addressOrUsername}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get OpenSea account: ${message}`);
    }
}

/**
 * Get a smart contract for a given address on the Sei chain.
 * @param address The contract address.
 * @returns Promise with the contract details.
 */
export async function getContract(address: string): Promise<any> {
    try {
        console.log(`Fetching contract: ${chain}/${address}`);
        const endpoint = `/chain/${chain}/contract/${address}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get OpenSea contract: ${message}`);
    }
}

/**
 * Get a list of OpenSea collections for the Sei chain.
 * @returns Promise with the collections data.
 */
export async function getCollections(): Promise<any> {
    try {
        console.log(`Fetching collections for chain: ${chain}`);
        const endpoint = `/collections?chain=${chain}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get OpenSea collections: ${message}`);
    }
}

/**
 * Get stats for a single collection.
 * @param collectionSlug Unique string to identify a collection on OpenSea.
 * @returns Promise with the collection stats data.
 */
export async function getCollectionStats(collectionSlug: string): Promise<any> {
    try {
        console.log(`Fetching stats for collection: ${collectionSlug}`);
        const endpoint = `/collections/${collectionSlug}/stats`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get collection stats: ${message}`);
    }
}

/**
 * Get a single NFT's metadata, traits, and ownership information.
 * @param address The NFT contract address.
 * @param identifier The token ID of the NFT.
 * @returns The NFT details from the API.
 */
export async function getNFT(address: string, identifier: string): Promise<any> {
    try {
        console.log(`Fetching NFT: ${chain}/${address}/${identifier}`);
        const endpoint = `/chain/${chain}/contract/${address}/nfts/${identifier}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get NFT: ${message}`);
    }
}

/**
 * Get NFTs owned by a given account address on the Sei chain.
 * @param address The account address to get NFTs for.
 * @returns Promise with the account's NFTs.
 */
export async function getNFTsByAccount(address: string): Promise<any> {
    try {
        console.log(`Fetching NFTs for account: ${address} on chain: ${chain}`);
        const endpoint = `/chain/${chain}/account/${address}/nfts`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get NFTs by account: ${message}`);
    }
}

/**
 * Get multiple NFTs for a collection.
 * @param collectionSlug The slug of the collection.
 * @returns Promise with the collection's NFTs.
 */
export async function getNFTsByCollection(collectionSlug: string): Promise<any> {
    try {
        console.log(`Fetching NFTs for collection: ${collectionSlug}`);
        const endpoint = `/collection/${collectionSlug}/nfts`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get NFTs by collection: ${message}`);
    }
}

/**
 * Get a list of events for an account.
 * @param address The account address.
 * @param options Optional parameters (after, before timestamps).
 * @returns Promise with the account's events.
 */
export async function getEventsByAccount(address: string, options?: { after?: number; before?: number }): Promise<any> {
    try {
        let endpoint = `/events/accounts/${address}`;

        if (options) {
            const params = new URLSearchParams();
            if (options.after) params.append('after', options.after.toString());
            if (options.before) params.append('before', options.before.toString());
            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }
        }

        console.log(`Fetching events for account: ${address}`);
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get events by account: ${message}`);
    }
}

/**
 * Get a list of events for a collection.
 * @param collectionSlug The collection slug.
 * @returns Promise with the collection's events.
 */
export async function getEventsByCollection(collectionSlug: string): Promise<any> {
    try {
        console.log(`Fetching events for collection: ${collectionSlug}`);
        const endpoint = `/events/collection/${collectionSlug}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get events by collection: ${message}`);
    }
}

/**
 * Get a list of events for a single NFT.
 * @param address The NFT contract address.
 * @param identifier The token ID of the NFT.
 * @returns Promise with the NFT's events.
 */
export async function getEventsByNFT(address: string, identifier: string): Promise<any> {
    try {
        console.log(`Fetching events for NFT: ${chain}/${address}/${identifier}`);
        const endpoint = `/events/chain/${chain}/contract/${address}/nfts/${identifier}`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get events by NFT: ${message}`);
    }
}

/**
 * Get the cheapest priced active, valid listings on a single collection.
 * @param collectionSlug Unique string to identify a collection on OpenSea.
 * @returns Promise with the best listings data.
 */
export async function getBestListingsByCollection(collectionSlug: string): Promise<any> {
    try {
        console.log(`Fetching best listings for collection: ${collectionSlug}`);
        const endpoint = `/listings/collection/${collectionSlug}/best`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get best listings for collection: ${message}`);
    }
}

/**
 * Get the best (lowest priced) listing for a single NFT.
 * @param collectionSlug The collection slug of the NFT.
 * @param identifier The token ID of the NFT.
 * @returns The best listing details from the API.
 */
export async function getBestListingForNFT(collectionSlug: string, identifier: string): Promise<any> {
    try {
        console.log(`Fetching best listing for: ${collectionSlug}/${identifier}`);
        const endpoint = `/listings/collection/${collectionSlug}/nfts/${identifier}/best`;
        return await fetchOpenSeaAPI(endpoint);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get best listing for NFT: ${message}`);
    }
}

/**
 * Buys an NFT by first fetching its best listing from the API and then fulfilling the order using the SDK.
 * @param collectionSlug The collection slug of the NFT to buy.
 * @param identifier The token ID of the NFT to buy.
 * @param accountAddress The wallet address of the buyer.
 * @returns The transaction hash of the purchase.
 */
export async function buyNFT(
    collectionSlug: string,
    identifier: string,
    accountAddress: string
): Promise<string> {
    try {
        console.log(`Initiating purchase of NFT ${collectionSlug}/${identifier} for ${accountAddress}`);

        const listing = await getBestListingForNFT(collectionSlug, identifier);
        if (!listing || !listing.protocol_data) {
            throw new Error('No valid listing was found for this NFT.');
        }
        const order: Order = {
            protocol_address: listing.protocol_address,
            protocol_data: listing.protocol_data,
            order_hash: listing.order_hash,
            price: listing.price,
            chain: Chain.Sei
        };

        const txHash = await fulfillOrder({ order, accountAddress });

        console.log(`✅ Successfully purchased NFT. Transaction hash: ${txHash}`);
        return txHash;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to buy NFT: ${message}`);
    }
}
