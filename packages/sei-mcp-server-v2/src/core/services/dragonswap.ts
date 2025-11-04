import { type Address, formatUnits, parseUnits, encodePacked, getContract } from 'viem';
import { getPublicClient, getWalletClient } from './clients.js';
import { readContract, writeContract } from './contracts.js';
import * as services from './index.js';
import { getPrivateKeyAsHex } from '../config.js';
import { DEFAULT_NETWORK } from '../chains.js';
import { dragonSwapQuoterV2Abi } from './abi/dragonSwapQuoterV2.js';
import { dragonSwapPoolAbi } from './abi/dragonSwapPool.js';
import { dragonSwapRouterAbi } from './abi/dragonSwapRouter.js';
import { dragonSwapPositionManagerAbi } from './abi/dragonSwapPositionManager.js';
import { dragonSwapFactoryAbi } from './abi/dragonSwapFactory.js';

import { erc20Abi } from './abi/erc20.js';

import { COMMON_TOKENS, DRAGONSWAP_ADDRESSES } from './utils.js';

// Common fee tiers for DragonSwap
export const FEE_TIERS = {
  LOWEST: 100,   // 0.01%
  LOW: 500,      // 0.05%
  MEDIUM: 3000,  // 0.3%
  HIGH: 10000    // 1%
} as const;

/**
 * Check if an address is a valid contract
 */
async function isContract(address: Address, network = DEFAULT_NETWORK): Promise<boolean> {
  try {
    const client = getPublicClient(network);
    const bytecode = await client.getBytecode({ address });
    return bytecode !== undefined && bytecode !== '0x';
  } catch {
    return false;
  }
}

/**
 * Create a path for V3 swaps (includes fee tier)
 */
function encodePath(tokenA: Address, tokenB: Address, fee: number): `0x${string}` {
  return encodePacked(
    ['address', 'uint24', 'address'],
    [tokenA, fee, tokenB]
  );
}

/**
 * Convert sqrtPriceX96 to human-readable price
 */
function sqrtPriceX96ToPrice(sqrtPriceX96: bigint, decimals0: number, decimals1: number): string {
  const price = (Number(sqrtPriceX96) / (2 ** 96)) ** 2;
  const adjustedPrice = price * (10 ** decimals0) / (10 ** decimals1);
  return adjustedPrice.toString();
}

/**
 * Get token price from a DragonSwap V3 pool
 */
export async function getTokenPrice(
  poolAddress: string,
  tokenAddress: string,
  network = DEFAULT_NETWORK
): Promise<{
  price: string;
  sqrtPriceX96: string;
  tick: number;
  liquidity: string;
  tokens: {
    token0: Address;
    token1: Address;
  };
  fee: number;
}> {
  try {
    const validatedPoolAddress = services.helpers.validateAddress(poolAddress);
    const validatedTokenAddress = services.helpers.validateAddress(tokenAddress);

    console.log(`Fetching token price for ${tokenAddress} from pool ${poolAddress} on network ${network}`);

    // Check if the pool address is a valid contract
    const isValidContract = await isContract(validatedPoolAddress, network);
    if (!isValidContract) {
      throw new Error(`Address ${poolAddress} is not a valid contract on network ${network}`);
    }

    // Get pool information
    const [slot0, token0, token1, fee, liquidity] = await Promise.all([
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'slot0'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'token0'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'token1'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'fee'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'liquidity'
      }, network)
    ]);

    const [sqrtPriceX96, tick] = slot0 as [bigint, number, number, number, number, number, boolean];
    const token0Address = token0 as Address;
    const token1Address = token1 as Address;
    const feeAmount = fee as number;
    const liquidityAmount = liquidity as bigint;

    // Validate that the requested token is actually in this pool
    const isToken0 = validatedTokenAddress.toLowerCase() === token0Address.toLowerCase();
    const isToken1 = validatedTokenAddress.toLowerCase() === token1Address.toLowerCase();

    if (!isToken0 && !isToken1) {
      throw new Error(`Token ${tokenAddress} is not part of the pool ${poolAddress}. Pool contains: ${token0Address} and ${token1Address}`);
    }

    // Check for liquidity
    if (liquidityAmount === 0n) {
      throw new Error(`Pool ${poolAddress} has no liquidity`);
    }

    // Get actual token decimals
    const token0Contract = getContract({
      address: token0Address,
      abi: erc20Abi,
      client: getPublicClient(network),
    });
    const decimalsToken0 = await token0Contract.read.decimals();

    const token1Contract = getContract({
      address: token1Address,
      abi: erc20Abi,
      client: getPublicClient(network),
    });
    const decimalsToken1 = await token1Contract.read.decimals();

    // Calculate price (assuming 18 decimals for both tokens for simplicity)
    const price = sqrtPriceX96ToPrice(sqrtPriceX96, decimalsToken0, decimalsToken1);

    // If requesting token0 price in terms of token1, use price as is
    // If requesting token1 price in terms of token0, invert the price
    const finalPrice = isToken0 ? price : (1 / parseFloat(price)).toString();

    return {
      price: finalPrice,
      sqrtPriceX96: sqrtPriceX96.toString(),
      tick,
      liquidity: liquidityAmount.toString(),
      tokens: {
        token0: token0Address,
        token1: token1Address
      },
      fee: feeAmount
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
    throw new Error(`Failed to get token price: ${String(error)}`);
  }
}

/**
 * Get swap quote from DragonSwap V3 QuoterV2
 */
export async function getSwapQuote(
  amountIn: string,
  tokenIn: string,
  tokenOut: string,
  fee: number = FEE_TIERS.MEDIUM,
  network = DEFAULT_NETWORK
): Promise<{
  amountOut: string;
  sqrtPriceX96After: string;
  initializedTicksCrossed: number;
  gasEstimate: string;
  path: string;
}> {
  try {
    const validatedTokenIn = services.helpers.validateAddress(tokenIn);
    const validatedTokenOut = services.helpers.validateAddress(tokenOut);

    console.log(`Getting swap quote from ${tokenIn} to ${tokenOut} with fee ${fee}`);

    // Validate amount input
    const amountInNumber = parseFloat(amountIn);
    if (isNaN(amountInNumber) || amountInNumber <= 0) {
      throw new Error(`Invalid amount: ${amountIn}`);
    }

    // Get actual input token decimals
    const tokenInContract = getContract({
      address: validatedTokenIn,
      abi: erc20Abi,
      client: getPublicClient(network),
    });
    const decimalsIn = await tokenInContract.read.decimals();
    const amountInWei = parseUnits(amountIn, decimalsIn);

    // Get actual output token decimals
    const tokenOutContract = getContract({
      address: validatedTokenOut,
      abi: erc20Abi,
      client: getPublicClient(network),
    });
    const decimalsOut = await tokenOutContract.read.decimals();

    // const amountInWei = parseUnits(amountIn, 18); // Assuming 18 decimals

    // Use quoteExactInputSingle for single-hop swaps
    const quoteParams = {
      tokenIn: validatedTokenIn,
      tokenOut: validatedTokenOut,
      amountIn: amountInWei,
      fee: fee,
      sqrtPriceLimitX96: 0n // No price limit
    };

    const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] = await readContract({
      address: DRAGONSWAP_ADDRESSES.quoter as Address,
      abi: dragonSwapQuoterV2Abi,
      functionName: 'quoteExactInputSingle',
      args: [quoteParams]
    }, network) as [bigint, bigint, number, bigint];

    const path = encodePath(validatedTokenIn, validatedTokenOut, fee);

    return {
      amountOut: formatUnits(amountOut, decimalsOut),
      sqrtPriceX96After: sqrtPriceX96After.toString(),
      initializedTicksCrossed,
      gasEstimate: gasEstimate.toString(),
      path
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
    throw new Error(`Failed to get swap quote: ${String(error)}`);
  }
}

/**
 * Get multi-hop swap quote using encoded path
 */
export async function getMultiHopSwapQuote(
  amountIn: string,
  path: `0x${string}`,
  network = DEFAULT_NETWORK
): Promise<{
  amountOut: string;
  sqrtPriceX96AfterList: string[];
  initializedTicksCrossedList: number[];
  gasEstimate: string;
}> {
  try {
    const amountInWei = parseUnits(amountIn, 18);

    const [amountOut, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate] = await readContract({
      address: DRAGONSWAP_ADDRESSES.quoter as Address,
      abi: dragonSwapQuoterV2Abi,
      functionName: 'quoteExactInput',
      args: [path, amountInWei]
    }, network) as [bigint, bigint[], number[], bigint];

    return {
      amountOut: formatUnits(amountOut, 18),
      sqrtPriceX96AfterList: sqrtPriceX96AfterList.map(x => x.toString()),
      initializedTicksCrossedList,
      gasEstimate: gasEstimate.toString()
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get multi-hop swap quote: ${error.message}`);
    }
    throw new Error(`Failed to get multi-hop swap quote: ${String(error)}`);
  }
}

export async function wrapSei(
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {

    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountWei = parseUnits(amount, 18);

    console.log(`Wrapping ${amount} SEI to WSEI`);

    const walletClient = getWalletClient(privateKey, network);

    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.swapRouter as Address,
      abi: dragonSwapRouterAbi,
      functionName: 'wrapSEI',
      args: [amountWei],
      value: amountWei,
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to wrap SEI: ${error.message}`);
    }
    throw new Error(`Failed to wrap SEI: ${String(error)}`);
  }
}

export async function unwrapSei(
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {

    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountWei = parseUnits(amount, 18);

    console.log(`Unwrapping ${amount} WSEI to SEI`);

    const walletClient = getWalletClient(privateKey, network);

    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.swapRouter as Address,
      abi: dragonSwapRouterAbi,
      functionName: 'unwrapWSEI',
      args: [amountWei],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to unwrap WSEI: ${error.message}`);
    }
    throw new Error(`Failed to unwrap WSEI: ${String(error)}`);
  }
}

/**
 * Execute a token swap on DragonSwap
 */
export async function executeSwap(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  amountOutMinimum: string,
  recipient: string,
  fee: number = FEE_TIERS.MEDIUM,
  deadline?: number,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedTokenIn = services.helpers.validateAddress(tokenIn);
    const validatedTokenOut = services.helpers.validateAddress(tokenOut);
    const validatedRecipient = services.helpers.validateAddress(recipient);

    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountInWei = parseUnits(amountIn, 18);
    const amountOutMinWei = parseUnits(amountOutMinimum, 18);
    const swapDeadline = deadline || Math.floor(Date.now() / 1000) + 300; // 5 minutes from now

    console.log(`Executing swap: ${amountIn} ${tokenIn} -> ${tokenOut} (min: ${amountOutMinimum})`);

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Create swap parameters
    const swapParams = {
      tokenIn: validatedTokenIn,
      tokenOut: validatedTokenOut,
      fee: fee,
      recipient: validatedRecipient,
      deadline: BigInt(swapDeadline),
      amountIn: amountInWei,
      amountOutMinimum: amountOutMinWei,
      sqrtPriceLimitX96: 0n // No price limit
    };

    // Execute the swap and return the transaction hash
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.swapRouter as Address,
      abi: dragonSwapRouterAbi,
      functionName: 'exactInputSingle',
      args: [swapParams],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
    throw new Error(`Failed to execute swap: ${String(error)}`);
  }
}

/**
 * Execute a multi-hop swap using encoded path
 */
export async function executeMultiHopSwap(
  path: `0x${string}`,
  amountIn: string,
  amountOutMinimum: string,
  recipient: string,
  deadline?: number,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedRecipient = services.helpers.validateAddress(recipient);

    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountInWei = parseUnits(amountIn, 18);
    const amountOutMinWei = parseUnits(amountOutMinimum, 18);
    const swapDeadline = deadline || Math.floor(Date.now() / 1000) + 300;

    console.log(`Executing multi-hop swap: ${amountIn} tokens through path ${path} (min: ${amountOutMinimum})`);

    const swapParams = {
      path: path,
      recipient: validatedRecipient,
      deadline: BigInt(swapDeadline),
      amountIn: amountInWei,
      amountOutMinimum: amountOutMinWei
    };

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Execute the swap with wallet client
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.swapRouter as Address,
      abi: dragonSwapRouterAbi,
      functionName: 'exactInput',
      args: [swapParams],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute multi-hop swap: ${error.message}`);
    }
    throw new Error(`Failed to execute multi-hop swap: ${String(error)}`);
  }
}

/**
 * Add liquidity to a DragonSwap V3 pool
 */
export async function addLiquidity(
  token0: string,
  token1: string,
  fee: number,
  tickLower: number,
  tickUpper: number,
  amount0Desired: string,
  amount1Desired: string,
  amount0Min: string,
  amount1Min: string,
  recipient: string,
  deadline?: number,
  network = DEFAULT_NETWORK
): Promise<{
  hash: string;
  amount0: string;
  amount1: string;
}> {
  try {
    const validatedToken0 = services.helpers.validateAddress(token0);
    const validatedToken1 = services.helpers.validateAddress(token1);
    const validatedRecipient = services.helpers.validateAddress(recipient);

    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amount0DesiredWei = parseUnits(amount0Desired, 18);
    const amount1DesiredWei = parseUnits(amount1Desired, 18);
    const amount0MinWei = parseUnits(amount0Min, 18);
    const amount1MinWei = parseUnits(amount1Min, 18);
    const liquidityDeadline = deadline || Math.floor(Date.now() / 1000) + 300;

    console.log(`Adding liquidity: ${amount0Desired} ${token0} + ${amount1Desired} ${token1}`);

    const mintParams = {
      token0: validatedToken0,
      token1: validatedToken1,
      fee: fee,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: amount0DesiredWei,
      amount1Desired: amount1DesiredWei,
      amount0Min: amount0MinWei,
      amount1Min: amount1MinWei,
      recipient: validatedRecipient,
      deadline: BigInt(liquidityDeadline)
    };

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Execute the transaction with wallet client
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.positionManager as Address,
      abi: dragonSwapPositionManagerAbi,
      functionName: 'mint',
      args: [mintParams],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    // Parse the result from logs or return values
    return {
      hash: hash,
      amount0: formatUnits(amount0DesiredWei, 18),
      amount1: formatUnits(amount1DesiredWei, 18)
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to add liquidity: ${error.message}`);
    }
    throw new Error(`Failed to add liquidity: ${String(error)}`);
  }
}

/**
 * Remove liquidity from a DragonSwap V3 position
 */
export async function removeLiquidity(
  tokenId: string,
  liquidity: string,
  amount0Min: string,
  amount1Min: string,
  deadline?: number,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const liquidityAmount = parseUnits(liquidity, 0); // Liquidity is not scaled
    const amount0MinWei = parseUnits(amount0Min, 18);
    const amount1MinWei = parseUnits(amount1Min, 18);
    const liquidityDeadline = deadline || Math.floor(Date.now() / 1000) + 300;

    console.log(`Removing liquidity: ${liquidity} from position ${tokenId}`);

    const decreaseParams = {
      tokenId: BigInt(tokenId),
      liquidity: liquidityAmount,
      amount0Min: amount0MinWei,
      amount1Min: amount1MinWei,
      deadline: BigInt(liquidityDeadline)
    };

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Execute the transaction with wallet client
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.positionManager as Address,
      abi: dragonSwapPositionManagerAbi,
      functionName: 'decreaseLiquidity',
      args: [decreaseParams],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to remove liquidity: ${error.message}`);
    }
    throw new Error(`Failed to remove liquidity: ${String(error)}`);
  }
}

/**
 * Collect fees from a DragonSwap V3 position
 */
export async function collectFees(
  tokenId: string,
  recipient: string,
  amount0Max?: string,
  amount1Max?: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedRecipient = services.helpers.validateAddress(recipient);

    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amount0MaxWei = amount0Max ? parseUnits(amount0Max, 18) : parseUnits('999999999', 18);
    const amount1MaxWei = amount1Max ? parseUnits(amount1Max, 18) : parseUnits('999999999', 18);

    console.log(`Collecting fees from position ${tokenId} to ${recipient}`);

    const collectParams = {
      tokenId: BigInt(tokenId),
      recipient: validatedRecipient,
      amount0Max: amount0MaxWei,
      amount1Max: amount1MaxWei
    };

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Execute the transaction with wallet client
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.positionManager as Address,
      abi: dragonSwapPositionManagerAbi,
      functionName: 'collect',
      args: [collectParams],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to collect fees: ${error.message}`);
    }
    throw new Error(`Failed to collect fees: ${String(error)}`);
  }
}

/**
 * Get position information
 */
export async function getPositionInfo(
  tokenId: string,
  network = DEFAULT_NETWORK
): Promise<{
  nonce: string;
  operator: Address;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  tokensOwed0: string;
  tokensOwed1: string;
}> {
  try {
    const position = await readContract({
      address: DRAGONSWAP_ADDRESSES.positionManager as Address,
      abi: dragonSwapPositionManagerAbi,
      functionName: 'positions',
      args: [BigInt(tokenId)]
    }, network);

    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1
    ] = position as [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];

    return {
      nonce: nonce.toString(),
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity: liquidity.toString(),
      feeGrowthInside0LastX128: feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: feeGrowthInside1LastX128.toString(),
      tokensOwed0: tokensOwed0.toString(),
      tokensOwed1: tokensOwed1.toString()
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get position info: ${error.message}`);
    }
    throw new Error(`Failed to get position info: ${String(error)}`);
  }
}

/**
 * Get or create a pool
 */
export async function getOrCreatePool(
  tokenA: string,
  tokenB: string,
  fee: number,
  network = DEFAULT_NETWORK
): Promise<{
  poolAddress: Address;
  isNewPool: boolean;
}> {
  try {
    const validatedTokenA = services.helpers.validateAddress(tokenA);
    const validatedTokenB = services.helpers.validateAddress(tokenB);

    // Try to get existing pool
    const existingPool = await readContract({
      address: DRAGONSWAP_ADDRESSES.factory as Address,
      abi: dragonSwapFactoryAbi,
      functionName: 'getPool',
      args: [validatedTokenA, validatedTokenB, fee]
    }, network) as Address;

    if (existingPool && existingPool !== '0x0000000000000000000000000000000000000000') {
      return {
        poolAddress: existingPool,
        isNewPool: false
      };
    }

    // Create new pool
    const result = await writeContract({
      address: DRAGONSWAP_ADDRESSES.factory as Address,
      abi: dragonSwapFactoryAbi,
      functionName: 'createPool',
      args: [validatedTokenA, validatedTokenB, fee]
    }, network);

    return {
      poolAddress: result as Address,
      isNewPool: true
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get or create pool: ${error.message}`);
    }
    throw new Error(`Failed to get or create pool: ${String(error)}`);
  }
}

/**
 * Get pool address for token pair and fee tier
 */
export async function getPoolAddress(
  tokenA: string,
  tokenB: string,
  fee: number,
  network = DEFAULT_NETWORK
): Promise<Address> {
  const validatedTokenA = services.helpers.validateAddress(tokenA);
  const validatedTokenB = services.helpers.validateAddress(tokenB);

  const poolAddress = await readContract({
    address: DRAGONSWAP_ADDRESSES.factory as Address,
    abi: dragonSwapFactoryAbi,
    functionName: 'getPool',
    args: [validatedTokenA, validatedTokenB, fee]
  }, network) as Address;

  if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Pool does not exist');
  }

  return poolAddress;
}

/**
 * Create new pool for token pair and fee tier
 */
export async function createPool(
  tokenA: string,
  tokenB: string,
  fee: number,
  network = DEFAULT_NETWORK
): Promise<Address> {
  try {
    const validatedTokenA = services.helpers.validateAddress(tokenA);
    const validatedTokenB = services.helpers.validateAddress(tokenB);

    // Get private key from environment
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    console.log(`Creating pool for ${tokenA}/${tokenB} with fee tier ${fee}`);

    // Create wallet client for sending the transaction
    const walletClient = getWalletClient(privateKey, network);

    // Execute the transaction with wallet client
    const hash = await walletClient.writeContract({
      address: DRAGONSWAP_ADDRESSES.factory as Address,
      abi: dragonSwapFactoryAbi,
      functionName: 'createPool',
      args: [validatedTokenA, validatedTokenB, fee],
      account: walletClient.account!,
      chain: walletClient.chain
    });

    // Note: The function returns a transaction hash, not the pool address
    // To get the pool address, you'd need to parse the transaction receipt or call getPool()
    return hash as Address;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create pool: ${error.message}`);
    }
    throw new Error(`Failed to create pool: ${String(error)}`);
  }
}

/**
 * Get comprehensive pool information
 */
export async function getPoolInfo(
  poolAddress: string,
  network = DEFAULT_NETWORK
): Promise<{
  address: Address;
  token0: Address;
  token1: Address;
  fee: number;
  tickSpacing: number;
  liquidity: string;
  sqrtPriceX96: string;
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
  token0Info?: {
    symbol: string;
    decimals: number;
    balance: string;
  };
  token1Info?: {
    symbol: string;
    decimals: number;
    balance: string;
  };
}> {
  try {
    const validatedPoolAddress = services.helpers.validateAddress(poolAddress);

    // Check if pool exists
    const isValidContract = await isContract(validatedPoolAddress, network);
    if (!isValidContract) {
      throw new Error(`Pool address ${poolAddress} is not a valid contract`);
    }

    // Get all pool data
    const [slot0, token0, token1, fee, liquidity] = await Promise.all([
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'slot0'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'token0'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'token1'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'fee'
      }, network),
      readContract({
        address: validatedPoolAddress,
        abi: dragonSwapPoolAbi,
        functionName: 'liquidity'
      }, network)
    ]);

    const [
      sqrtPriceX96,
      tick,
      observationIndex,
      observationCardinality,
      observationCardinalityNext,
      feeProtocol,
      unlocked
    ] = slot0 as [bigint, number, number, number, number, number, boolean];

    const token0Address = token0 as Address;
    const token1Address = token1 as Address;
    const feeAmount = fee as number;
    const liquidityAmount = liquidity as bigint;

    // Get tick spacing based on fee tier
    const tickSpacing = getTickSpacing(feeAmount);

    const poolInfo = {
      address: validatedPoolAddress,
      token0: token0Address,
      token1: token1Address,
      fee: feeAmount,
      tickSpacing,
      liquidity: liquidityAmount.toString(),
      sqrtPriceX96: sqrtPriceX96.toString(),
      tick,
      observationIndex,
      observationCardinality,
      observationCardinalityNext,
      feeProtocol,
      unlocked
    };

    return poolInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get pool info: ${error.message}`);
    }
    throw new Error(`Failed to get pool info: ${String(error)}`);
  }
}

/**
 * Check token allowance
 */
export async function checkTokenAllowance(
  tokenAddress: string,
  owner: string,
  spender: string,
  network = DEFAULT_NETWORK
): Promise<{
  allowance: string;
  hasEnoughAllowance: boolean;
  tokenInfo: {
    address: Address;
    decimals: number;
  };
}> {
  try {
    const validatedToken = services.helpers.validateAddress(tokenAddress);
    const validatedOwner = services.helpers.validateAddress(owner);
    const validatedSpender = services.helpers.validateAddress(spender);

    const [allowance, decimals] = await Promise.all([
      readContract({
        address: validatedToken,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [validatedOwner, validatedSpender]
      }, network),
      readContract({
        address: validatedToken,
        abi: erc20Abi,
        functionName: 'decimals'
      }, network)
    ]);

    const allowanceAmount = allowance as bigint;
    const tokenDecimals = decimals as number;

    return {
      allowance: formatUnits(allowanceAmount, tokenDecimals),
      hasEnoughAllowance: allowanceAmount > 0n,
      tokenInfo: {
        address: validatedToken,
        decimals: tokenDecimals
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to check token allowance: ${error.message}`);
    }
    throw new Error(`Failed to check token allowance: ${String(error)}`);
  }
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  account: string,
  network = DEFAULT_NETWORK
): Promise<{
  balance: string;
  balanceWei: string;
  tokenInfo: {
    address: Address;
    decimals: number;
  };
}> {
  try {
    const validatedToken = services.helpers.validateAddress(tokenAddress);
    const validatedAccount = services.helpers.validateAddress(account);

    const [balance, decimals] = await Promise.all([
      readContract({
        address: validatedToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [validatedAccount]
      }, network),
      readContract({
        address: validatedToken,
        abi: erc20Abi,
        functionName: 'decimals'
      }, network)
    ]);

    const balanceAmount = balance as bigint;
    const tokenDecimals = decimals as number;

    return {
      balance: formatUnits(balanceAmount, tokenDecimals),
      balanceWei: balanceAmount.toString(),
      tokenInfo: {
        address: validatedToken,
        decimals: tokenDecimals
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
    throw new Error(`Failed to get token balance: ${String(error)}`);
  }
}

/**
 * Calculate optimal tick range for liquidity provision
 */
export function calculateTickRange(
  currentTick: number,
  fee: number,
  rangeWidth: number = 20
): {
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
} {
  const tickSpacing = getTickSpacing(fee);
  const tickRadius = Math.floor(rangeWidth / 2);

  // Calculate ticks and ensure they're aligned to tick spacing
  const tickLower = Math.floor((currentTick - tickRadius) / tickSpacing) * tickSpacing;
  const tickUpper = Math.ceil((currentTick + tickRadius) / tickSpacing) * tickSpacing;

  return {
    tickLower,
    tickUpper,
    tickSpacing
  };
}

/**
 * Calculate minimum amounts with slippage protection
 */
export function calculateSlippage(
  amount: string,
  slippageTolerance: number = 0.5 // 0.5% default
): {
  originalAmount: string;
  minAmount: string;
  maxAmount: string;
  slippagePercent: number;
} {
  const originalAmount = parseFloat(amount);
  const slippageMultiplier = slippageTolerance / 100;

  const minAmount = originalAmount * (1 - slippageMultiplier);
  const maxAmount = originalAmount * (1 + slippageMultiplier);

  return {
    originalAmount: amount,
    minAmount: minAmount.toString(),
    maxAmount: maxAmount.toString(),
    slippagePercent: slippageTolerance
  };
}

/**
 * Create encoded path for multi-hop swaps
 */
export function createMultiHopPath(
  tokens: Address[],
  fees: number[]
): `0x${string}` {
  if (tokens.length < 2) {
    throw new Error('At least 2 tokens required for a path');
  }

  if (tokens.length - 1 !== fees.length) {
    throw new Error('Number of fees must be one less than number of tokens');
  }

  let path = tokens[0];

  for (let i = 0; i < fees.length; i++) {
    // Encode fee as 3-byte hex
    const feeHex = fees[i].toString(16).padStart(6, '0');
    path += feeHex + tokens[i + 1].slice(2); // Remove '0x' prefix from subsequent tokens
  }

  return path as `0x${string}`;
}

/**
 * Convert tick to price
 */
export function tickToPrice(
  tick: number,
  decimals0: number = 18,
  decimals1: number = 18
): string {
  const price = Math.pow(1.0001, tick);
  const adjustedPrice = price * Math.pow(10, decimals0 - decimals1);
  return adjustedPrice.toString();
}

/**
 * Convert price to tick
 */
export function priceToTick(
  price: string,
  decimals0: number = 18,
  decimals1: number = 18
): number {
  const priceNum = parseFloat(price);
  const adjustedPrice = priceNum * Math.pow(10, decimals1 - decimals0);
  const tick = Math.log(adjustedPrice) / Math.log(1.0001);
  return Math.round(tick);
}

/**
 * Sort tokens for V3 compatibility (token0 < token1)
 */
export function sortTokens(
  tokenA: Address,
  tokenB: Address
): {
  token0: Address;
  token1: Address;
  isReversed: boolean;
} {
  const isReversed = tokenA.toLowerCase() > tokenB.toLowerCase();

  return {
    token0: isReversed ? tokenB : tokenA,
    token1: isReversed ? tokenA : tokenB,
    isReversed
  };
}

/**
 * Get tick spacing for fee tiers
 */
export function getTickSpacing(fee: number): number {
  switch (fee) {
    case FEE_TIERS.LOWEST: // 0.01%
      return 1;
    case FEE_TIERS.LOW: // 0.05%
      return 10;
    case FEE_TIERS.MEDIUM: // 0.3%
      return 60;
    case FEE_TIERS.HIGH: // 1%
      return 200;
    default:
      throw new Error(`Unknown fee tier: ${fee}`);
  }
}

/**
 * Batch multiple operations in one transaction using multicall
 */
export async function batchOperations(  
  operations: {
    functionName: string;
    args: any[];
  }[],
  deadline?: number,
  network = DEFAULT_NETWORK
): Promise<{
  hash: string;
  results: string[];
}> {
  try {
    const batchDeadline = deadline || Math.floor(Date.now() / 1000) + 300;

    // Encode each operation
    const encodedCalls: `0x${string}`[] = operations.map(op => {
      // This is a simplified encoding - in practice, you'd use proper ABI encoding
      return encodePacked(['string'], [JSON.stringify(op)]);
    });

    const result = await writeContract({
      address: DRAGONSWAP_ADDRESSES.swapRouter as Address,
      abi: dragonSwapRouterAbi,
      functionName: 'multicall',
      args: [BigInt(batchDeadline), encodedCalls]
    }, network);

    return {
      hash: result as string,
      results: [] // Results would be decoded from transaction receipt
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to batch operations: ${error.message}`);
    }
    throw new Error(`Failed to batch operations: ${String(error)}`);
  }
}

/**
 * Get optimal swap route for better pricing
 */
export async function getOptimalSwapRoute(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  network = DEFAULT_NETWORK
): Promise<{
  bestRoute: {
    type: 'direct' | 'multi-hop';
    amountOut: string;
    path: `0x${string}`;
    gasEstimate: string;
    fees: number[];
    route: string[];
  };
  allRoutes: any[];
}> {
  try {
    const validatedTokenIn = services.helpers.validateAddress(tokenIn);
    const validatedTokenOut = services.helpers.validateAddress(tokenOut);
    const allFeeTiers = [FEE_TIERS.LOWEST, FEE_TIERS.LOW, FEE_TIERS.MEDIUM, FEE_TIERS.HIGH];

    let bestRoute: any = { amountOut: '0' };
    const allRoutesConsidered = [];

    // 1. Find best direct route
    const directRoutesPromises = allFeeTiers.map(fee =>
      getSwapQuote(amountIn, tokenIn, tokenOut, fee, network)
        .then(result => ({ ...result, fee }))
        .catch(() => null)
    );
    const directRoutesResults = await Promise.all(directRoutesPromises);

    directRoutesResults.forEach(result => {
      if (result && parseFloat(result.amountOut) > parseFloat(bestRoute.amountOut)) {
        bestRoute = {
          type: 'direct',
          amountOut: result.amountOut,
          path: result.path,
          gasEstimate: result.gasEstimate,
          fees: [result.fee],
          route: [tokenIn, tokenOut]
        };
      }
      if(result) allRoutesConsidered.push({type: 'direct', ...result});
    });

    // 2. Find best multi-hop routes via common tokens (WSEI, USDC)
    const intermediateTokens = [COMMON_TOKENS.WSEI, COMMON_TOKENS.USDC];

    for (const intermediateToken of intermediateTokens) {
      if (validatedTokenIn.toLowerCase() === intermediateToken.toLowerCase() || 
          validatedTokenOut.toLowerCase() === intermediateToken.toLowerCase()) {
        continue;
      }
      
      // Find best fee for first hop: tokenIn -> intermediateToken
      const firstHopPromises = allFeeTiers.map(fee =>
        getSwapQuote(amountIn, tokenIn, intermediateToken, fee, network)
          .then(result => ({ ...result, fee }))
          .catch(() => null)
      );
      const firstHopResults = await Promise.all(firstHopPromises);
      const bestFirstHop = firstHopResults.reduce((best, current) => 
        (current && parseFloat(current.amountOut) > parseFloat(best?.amountOut ?? '0')) ? current : best, null
      );

      if (!bestFirstHop) continue; // No path for first hop

      // Find best fee for second hop: intermediateToken -> tokenOut
      const secondHopPromises = allFeeTiers.map(fee =>
        getSwapQuote(bestFirstHop.amountOut, intermediateToken, tokenOut, fee, network)
          .then(result => ({ ...result, fee }))
          .catch(() => null)
      );
      const secondHopResults = await Promise.all(secondHopPromises);
      const bestSecondHop = secondHopResults.reduce((best, current) => 
        (current && parseFloat(current.amountOut) > parseFloat(best?.amountOut ?? '0')) ? current : best, null
      );
      
      if (!bestSecondHop) continue; // No path for second hop

      const multiHopPath = createMultiHopPath(
        [validatedTokenIn, services.helpers.validateAddress(intermediateToken), validatedTokenOut],
        [bestFirstHop.fee, bestSecondHop.fee]
      );
      
      const multiHopQuote = await getMultiHopSwapQuote(amountIn, multiHopPath, network);
      allRoutesConsidered.push({
        type: 'multi-hop', 
        ...multiHopQuote, 
        route: [tokenIn, intermediateToken, tokenOut],
        fees: [bestFirstHop.fee, bestSecondHop.fee]
      });

      if (parseFloat(multiHopQuote.amountOut) > parseFloat(bestRoute.amountOut)) {
        bestRoute = {
          type: 'multi-hop',
          amountOut: multiHopQuote.amountOut,
          path: multiHopPath,
          gasEstimate: multiHopQuote.gasEstimate,
          fees: [bestFirstHop.fee, bestSecondHop.fee],
          route: [tokenIn, intermediateToken, tokenOut]
        };
      }
    }
    
    if (bestRoute.amountOut === '0') {
        throw new Error('No valid swap route found for the given tokens.');
    }

    return {
      bestRoute,
      allRoutes: allRoutesConsidered
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get optimal swap route: ${error.message}`);
    }
    throw new Error(`Failed to get optimal swap route: ${String(error)}`);
  }
}

/**
 * Calculate liquidity amounts for a given price range
 */
export function calculateLiquidityAmounts(
  amount0: string,
  amount1: string,
  currentPrice: string,
  tickLower: number,
  tickUpper: number,
  decimals0: number = 18,
  decimals1: number = 18
): {
  liquidity: string;
  amount0Used: string;
  amount1Used: string;
  ratio: string;
} {
  const amount0Wei = parseUnits(amount0, decimals0);
  const amount1Wei = parseUnits(amount1, decimals1);

  const priceLower = parseFloat(tickToPrice(tickLower, decimals0, decimals1));
  const priceUpper = parseFloat(tickToPrice(tickUpper, decimals0, decimals1));
  const currentPriceNum = parseFloat(currentPrice);

  // Simplified liquidity calculation
  // In practice, you'd use the full V3 math
  let liquidity0 = 0;
  let liquidity1 = 0;

  if (currentPriceNum <= priceLower) {
    // All amount0
    liquidity0 = Number(formatUnits(amount0Wei, decimals0));
  } else if (currentPriceNum >= priceUpper) {
    // All amount1
    liquidity1 = Number(formatUnits(amount1Wei, decimals1));
  } else {
    // Mixed amounts
    const ratio = (currentPriceNum - priceLower) / (priceUpper - priceLower);
    liquidity0 = Number(formatUnits(amount0Wei, decimals0)) * (1 - ratio);
    liquidity1 = Number(formatUnits(amount1Wei, decimals1)) * ratio;
  }

  return {
    liquidity: Math.max(liquidity0, liquidity1).toString(),
    amount0Used: liquidity0.toString(),
    amount1Used: liquidity1.toString(),
    ratio: (liquidity1 / (liquidity0 + liquidity1)).toString()
  };
}

/**
 * Monitor pool events and price changes
 */
export async function monitorPool(
  poolAddress: string,
  callback: (event: {
    type: 'swap' | 'mint' | 'burn';
    data: any;
    timestamp: number;
  }) => void,
  network = DEFAULT_NETWORK
): Promise<() => void> {
  try {
    const validatedPool = services.helpers.validateAddress(poolAddress);
    const client = getPublicClient(network);

    // Set up event listeners
    const unwatch = client.watchContractEvent({
      address: validatedPool,
      abi: dragonSwapPoolAbi,
      eventName: 'Swap',
      onLogs: (logs) => {
        logs.forEach(log => {
          callback({
            type: 'swap',
            data: log,
            timestamp: Date.now()
          });
        });
      }
    });

    return unwatch;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to monitor pool: ${error.message}`);
    }
    throw new Error(`Failed to monitor pool: ${String(error)}`);
  }
}

/**
 * Get historical pool data
 */
export async function getPoolHistoricalData(
  poolAddress: string,
  fromBlock: number,
  toBlock: number | 'latest' = 'latest',
  network = DEFAULT_NETWORK
): Promise<{
  swaps: any[];
  mints: any[];
  burns: any[];
  priceHistory: {
    timestamp: number;
    price: string;
    sqrtPriceX96: string;
  }[];
}> {
  try {
    const validatedPool = services.helpers.validateAddress(poolAddress);
    const client = getPublicClient(network);

    // Define event signatures for Uniswap V3 style pools
    const SWAP_EVENT_SIGNATURE = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'; // Swap event
    const MINT_EVENT_SIGNATURE = '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde'; // Mint event  
    const BURN_EVENT_SIGNATURE = '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c'; // Burn event

    // Get all logs first, then filter by event signature
    const allLogs = await client.getLogs({
      address: validatedPool,
      fromBlock: BigInt(fromBlock),
      toBlock: toBlock === 'latest' ? 'latest' : BigInt(toBlock)
    });

    // Filter logs by event signature
    const swapLogs = allLogs.filter(log => log.topics[0] === SWAP_EVENT_SIGNATURE);
    const mintLogs = allLogs.filter(log => log.topics[0] === MINT_EVENT_SIGNATURE);
    const burnLogs = allLogs.filter(log => log.topics[0] === BURN_EVENT_SIGNATURE);

    // Convert BigInt values to strings for serialization
    const processLogs = (logs: any[]) => {
      return logs.map(log => ({
        ...log,
        blockNumber: log.blockNumber.toString(),
        transactionIndex: log.transactionIndex.toString(),
        logIndex: log.logIndex.toString(),
        // Convert any other BigInt fields as needed
      }));
    };

    const processedSwapLogs = processLogs(swapLogs);
    const processedMintLogs = processLogs(mintLogs);
    const processedBurnLogs = processLogs(burnLogs);

    // Extract price history from swap events (simplified)
    const priceHistory = processedSwapLogs.map((log, index) => ({
      timestamp: Date.now() - (processedSwapLogs.length - index) * 60000, // Mock timestamps
      price: "0", // You'll need to decode the actual price from log data
      sqrtPriceX96: "0" // You'll need to decode this from log data
    }));

    return {
      swaps: processedSwapLogs,
      mints: processedMintLogs,
      burns: processedBurnLogs,
      priceHistory: priceHistory
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get pool historical data: ${error.message}`);
    }
    throw new Error(`Failed to get pool historical data: ${String(error)}`);
  }
}

/**
 * Calculate impermanent loss for a liquidity position
 */
export function calculateImpermanentLoss(
  initialPrice: string,
  currentPrice: string,
  initialAmount0: string,
  initialAmount1: string
): {
  impermanentLoss: string;
  currentValue: string;
  hodlValue: string;
  lossPercentage: string;
} {
  const initialPriceNum = parseFloat(initialPrice);
  const currentPriceNum = parseFloat(currentPrice);
  const priceRatio = currentPriceNum / initialPriceNum;

  const initialAmount0Num = parseFloat(initialAmount0);
  const initialAmount1Num = parseFloat(initialAmount1);

  // Calculate current LP position value
  const currentAmount0 = initialAmount0Num / Math.sqrt(priceRatio);
  const currentAmount1 = initialAmount1Num * Math.sqrt(priceRatio);
  const currentValue = currentAmount0 * currentPriceNum + currentAmount1;

  // Calculate HODL value
  const hodlValue = initialAmount0Num * currentPriceNum + initialAmount1Num;

  // Calculate impermanent loss
  const impermanentLoss = hodlValue - currentValue;
  const lossPercentage = (impermanentLoss / hodlValue) * 100;

  return {
    impermanentLoss: impermanentLoss.toString(),
    currentValue: currentValue.toString(),
    hodlValue: hodlValue.toString(),
    lossPercentage: lossPercentage.toString()
  };
}