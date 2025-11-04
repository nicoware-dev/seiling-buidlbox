import { type Address, formatUnits, parseUnits, getContract } from 'viem';
import { getPublicClient, getWalletClient } from './clients.js';
import { getPrivateKeyAsHex } from '../config.js';
import { DEFAULT_NETWORK } from '../chains.js';
import { UiPoolDataProviderAbi } from './abi/yeiUiPoolDataProvider.js';
import { PoolAbi } from './abi/yeiPool.js';
import { WrappedTokenGatewayAbi } from './abi/yeiWrappedTokenGateway.js';
import { aTokenAbi } from './abi/aToken.js';
import { DebtTokenAbi } from './abi/debtToken.js';
import { erc20Abi } from './abi/erc20.js';
import * as services from './index.js';
import { YEI_ADDRESSES, YEI_TOKENS } from './utils.js';

/** InterestRate options */
export enum InterestRate {
  None = 0,
  Stable = 1,
  Variable = 2,
}

/**
 * Helper to get token decimals
 * @param tokenAddress The address of the token
 * @param network The network to query
 * @returns The number of decimals for the token
 */
async function getTokenDecimals(tokenAddress: Address, network = DEFAULT_NETWORK): Promise<number> {
  const publicClient = getPublicClient(network);
  const tokenContract = getContract({ address: tokenAddress, abi: erc20Abi, client: publicClient });
  return await tokenContract.read.decimals();
}

/**
 * Get data for all reserves in the Yei Finance pool.
 * This is equivalent to getting market data for all available assets.
 * @param network The network to query
 * @returns The formatted reserves data
 */
export async function getFormattedReserves(network = DEFAULT_NETWORK) {
  try {
    const publicClient = getPublicClient(network);
    const dataProviderContract = getContract({
      address: YEI_ADDRESSES.UiPoolDataProviderV3 as Address,
      abi: UiPoolDataProviderAbi,
      client: publicClient,
    });

    const [reservesData, baseCurrencyInfo] = await dataProviderContract.read.getReservesData([
      YEI_ADDRESSES.PoolAddressesProvider as Address
    ]);

    return { reservesData, baseCurrencyInfo };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get Yei Finance reserves data: ${error.message}`);
    }
    throw new Error(`Failed to get Yei Finance reserves data: ${String(error)}`);
  }
}

/**
 * Get a user's account data, including health factor, collateral, and debt.
 * @param userAddress The address of the user
 * @param network The network to query
 * @returns The user account data
 */
export async function getUserAccountData(userAddress: string, network = DEFAULT_NETWORK) {
  try {
    const validatedUserAddress = services.helpers.validateAddress(userAddress);
    const publicClient = getPublicClient(network);
    const dataProviderContract = getContract({
      address: YEI_ADDRESSES.UiPoolDataProviderV3 as Address,
      abi: UiPoolDataProviderAbi,
      client: publicClient,
    });

    const userReserves = await dataProviderContract.read.getUserReservesData([
      YEI_ADDRESSES.PoolAddressesProvider as Address,
      validatedUserAddress,
    ]);

    return userReserves;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get user account data for ${userAddress}: ${error.message}`);
    }
    throw new Error(`Failed to get user account data: ${String(error)}`);
  }
}

/**
 * Approve the Yei Finance Pool contract to spend a specified amount of an ERC20 token.
 * This must be called before supplying or repaying with an ERC20 token.
 * @param tokenAddress The address of the token to approve
 * @param amount The amount to approve, in token units
 * @param network The network to query
 * @returns The transaction hash
 */
export async function approveYeiFinance(
  tokenAddress: string,
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedTokenAddress = services.helpers.validateAddress(tokenAddress);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(validatedTokenAddress, network);
    const amountWei = parseUnits(amount, decimals);

    console.log(`Approving ${amount} of ${tokenAddress} for the Yei Finance Pool`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: validatedTokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [YEI_ADDRESSES.Pool as Address, amountWei],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to approve token: ${error.message}`);
    }
    throw new Error(`Failed to approve token: ${String(error)}`);
  }
}

/**
 * Supply (deposit) an ERC20 token into the lending pool.
 * @param reserveAddress The address of the reserve token
 * @param amount The amount to supply, in token units
 * @param onBehalfOf The address to receive the aTokens
 * @param network The network to query
 * @returns The transaction hash
 */
export async function supply(
  reserveAddress: string,
  amount: string,
  onBehalfOf: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReserve = services.helpers.validateAddress(reserveAddress);
    const validatedOnBehalfOf = services.helpers.validateAddress(onBehalfOf);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(validatedReserve, network);
    const amountWei = parseUnits(amount, decimals);

    const publicClient = getPublicClient(network);
    const approvalTx = await services.approveYeiFinance(validatedReserve, amount, network);
    await publicClient.waitForTransactionReceipt({ hash: approvalTx });
    console.log(`Approval transaction hash: ${approvalTx}`);

    console.log(`Supplying ${amount} of ${reserveAddress}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'supply',
      args: [validatedReserve, amountWei, validatedOnBehalfOf, 0],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to supply asset: ${error.message}`);
    }
    throw new Error(`Failed to supply asset: ${String(error)}`);
  }
}

/**
 * Supply (deposit) the native asset (SEI) into the lending pool via the gateway.
 * @param amount The amount to supply, in SEI units
 * @param onBehalfOf The address to receive the aTokens
 * @param network The network to query
 * @returns The transaction hash
 */
export async function supplyNativeAsset(
  amount: string,
  onBehalfOf: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedOnBehalfOf = services.helpers.validateAddress(onBehalfOf);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const amountWei = parseUnits(amount, 18); // Native asset has 18 decimals basically Wrapped SEI

    console.log(`Supplying ${amount} SEI`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.WrappedTokenGatewayV3 as Address,
      abi: WrappedTokenGatewayAbi,
      functionName: 'depositETH',
      args: [YEI_ADDRESSES.Pool as Address, validatedOnBehalfOf, 0],
      value: amountWei,
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to supply native asset: ${error.message}`);
    }
    throw new Error(`Failed to supply native asset: ${String(error)}`);
  }
}


/**
 * Borrow an asset from the lending pool.
 * The user must have sufficient collateral already supplied.
 * @param reserveAddress The address of the reserve token
 * @param amount The amount to borrow, in token units
 * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
 * @param onBehalfOf The address to receive the borrowed asset
 * @param network The network to query
 * @returns The transaction hash
 */
export async function borrow(
  reserveAddress: string,
  amount: string,
  interestRateMode: string,
  onBehalfOf: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReserve = services.helpers.validateAddress(reserveAddress);
    const validatedOnBehalfOf = services.helpers.validateAddress(onBehalfOf);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(validatedReserve, network);
    const amountWei = parseUnits(amount, decimals);
    const interestRateModeEnum = InterestRate[interestRateMode as keyof typeof InterestRate];

    const publicClient = getPublicClient(network);
    const approvalTx = await services.approveYeiFinance(validatedReserve, amount, network);
    await publicClient.waitForTransactionReceipt({ hash: approvalTx });
    console.log(`Approval transaction hash: ${approvalTx}`);

    console.log(`Borrowing ${amount} of ${reserveAddress}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'borrow',
      args: [validatedReserve, amountWei, BigInt(interestRateModeEnum), 0, validatedOnBehalfOf],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to borrow asset: ${error.message}`);
    }
    throw new Error(`Failed to borrow asset: ${String(error)}`);
  }
}

/**
 * Repay a borrowed asset to the lending pool.
 * @param reserveAddress The address of the reserve token
 * @param amount The amount to repay, in token units
 * @param interestRateMode The interest rate mode (1 for stable, 2 for variable)
 * @param onBehalfOf The address to repay the borrowed asset on behalf of
 * @param network The network to query
 * @returns The transaction hash
 */
export async function repay(
  reserveAddress: string,
  amount: string,
  interestRateMode: string,
  onBehalfOf: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReserve = services.helpers.validateAddress(reserveAddress);
    const validatedOnBehalfOf = services.helpers.validateAddress(onBehalfOf);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(validatedReserve, network);
    // MAX_UINT for repaying the full amount
    const amountWei = amount === '-1' ? 2n ** 256n - 1n : parseUnits(amount, decimals);
    const interestRateModeEnum = InterestRate[interestRateMode as keyof typeof InterestRate];

    const publicClient = getPublicClient(network);
    const approvalTx = await services.approveYeiFinance(validatedReserve, amount, network);
    await publicClient.waitForTransactionReceipt({ hash: approvalTx });
    console.log(`Approval transaction hash: ${approvalTx}`);

    console.log(`Repaying ${amount} of ${reserveAddress}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'repay',
      args: [validatedReserve, amountWei, BigInt(interestRateModeEnum), validatedOnBehalfOf],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to repay asset: ${error.message}`);
    }
    throw new Error(`Failed to repay asset: ${String(error)}`);
  }
}


/**
 * Withdraw a supplied asset from the lending pool.
 * @param reserveAddress The address of the reserve token
 * @param amount The amount to withdraw, in token units
 * @param toAddress The address to receive the withdrawn asset
 * @param network The network to query
 * @returns The transaction hash
 */
export async function withdraw(
  reserveAddress: string,
  amount: string,
  toAddress: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReserve = services.helpers.validateAddress(reserveAddress);
    const validatedTo = services.helpers.validateAddress(toAddress);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(validatedReserve, network);
    // MAX_UINT for withdrawing the full amount
    const amountWei = amount === '-1' ? 2n ** 256n - 1n : parseUnits(amount, decimals);

    console.log(`Withdrawing ${amount} of ${reserveAddress}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'withdraw',
      args: [validatedReserve, amountWei, validatedTo],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to withdraw asset: ${error.message}`);
    }
    throw new Error(`Failed to withdraw asset: ${String(error)}`);
  }
}

/**
 * Enable or disable a supplied asset to be used as collateral.
 * @param reserveAddress The address of the reserve token
 * @param useAsCollateral Whether to enable or disable the asset as collateral
 * @param network The network to query
 * @returns The transaction hash
 */
export async function setUseReserveAsCollateral(
  reserveAddress: string,
  useAsCollateral: boolean,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReserve = services.helpers.validateAddress(reserveAddress);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    console.log(`${useAsCollateral ? 'Enabling' : 'Disabling'} ${reserveAddress} as collateral.`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'setUserUseReserveAsCollateral',
      args: [validatedReserve, useAsCollateral],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to set collateral status: ${error.message}`);
    }
    throw new Error(`Failed to set collateral status: ${String(error)}`);
  }
}

/**
 * Withdraw the native asset (SEI) from the lending pool via the gateway.
 * @param amount The amount to withdraw, in token units
 * @param toAddress The address to receive the withdrawn asset
 * @param network The network to query
 * @returns The transaction hash
 */
export async function withdrawNativeAsset(
  amount: string,
  toAddress: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedTo = services.helpers.validateAddress(toAddress);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const amountWei = amount === '-1' ? 2n ** 256n - 1n : parseUnits(amount, 18);

    const publicClient = getPublicClient(network);
    const approvalTx = await services.approveERC20(YEI_TOKENS.WSEI, YEI_ADDRESSES.WrappedTokenGatewayV3, amount, network);
    await publicClient.waitForTransactionReceipt({ hash: approvalTx.txHash });
    console.log(`Approval transaction hash: ${approvalTx}`);

    console.log(`Withdrawing ${amount} SEI`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.WrappedTokenGatewayV3 as Address,
      abi: WrappedTokenGatewayAbi,
      functionName: 'withdrawETH',
      args: [YEI_ADDRESSES.Pool as Address, amountWei, validatedTo],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to withdraw native asset: ${error.message}`);
    }
    throw new Error(`Failed to withdraw native asset: ${String(error)}`);
  }
}

/**
 * Executes a flash loan.
 * This is an advanced function that requires a receiver contract that can handle the loan and repay it.
 * @param receiverAddress The address of the receiver contract
 * @param assets The addresses of the assets to loan
 * @param amounts The amounts to loan, in token units
 * @param onBehalfOf The address to receive the loaned assets
 * @param params Custom data to be passed to the receiver contract
 * @param network The network to query
 * @returns The transaction hash
 */
export async function flashLoan(
  receiverAddress: string,
  assets: Address[],
  amounts: string[],
  onBehalfOf: string,
  params: `0x${string}`, // Custom data to be passed to the receiver contract
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReceiver = services.helpers.validateAddress(receiverAddress);
    const validatedOnBehalfOf = services.helpers.validateAddress(onBehalfOf);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    // For flash loans, interest rate mode is 0 (no debt token).
    // We create an array of 0s with the same length as the assets array.
    const interestRateModes = assets.map(() => 0n);

    // convert string amounts to bigints using token decimals
    const amountBigInts = await Promise.all(
      amounts.map(async (amount, index) => {
        const assetAddress = assets[index] as Address;
        const decimals = await getTokenDecimals(assetAddress, network);
        return parseUnits(amount, decimals);
      })
    );

    console.log(`Executing flash loan for receiver ${receiverAddress}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'flashLoan',
      // structured arguments matching the ABI
      args: [
        validatedReceiver,
        assets,
        amountBigInts,
        interestRateModes,
        validatedOnBehalfOf,
        params,
        0
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute flash loan: ${error.message}`);
    }
    throw new Error(`Failed to execute flash loan: ${String(error)}`);
  }
}

/**
 * Executes a simple flash loan for a single asset.
 * This is cheaper and simpler than the multi-asset flashLoan.
 * @param receiverAddress The address of the receiver contract
 * @param asset The address of the asset to loan
 * @param amount The amount to loan, in token units
 * @param params Custom data to be passed to the receiver contract
 * @param network The network to query
 * @returns The transaction hash
 */
export async function flashLoanSimple(
  receiverAddress: string,
  asset: Address,
  amount: string,
  params: `0x${string}` = '0x', // Custom data passed to the receiver contract
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedReceiver = services.helpers.validateAddress(receiverAddress);
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    const decimals = await getTokenDecimals(asset, network);
    const amountBigInt = parseUnits(amount, decimals);

    console.log(`Executing simple flash loan for ${amount} ${asset}`);

    const walletClient = getWalletClient(privateKey, network);

    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'flashLoanSimple',
      args: [
        validatedReceiver,
        asset,
        amountBigInt,
        params,
        0
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    return hash;
  } catch (error) {
    throw new Error(
      `Failed to execute simple flash loan: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Sets the user's E-Mode category.
 * @param categoryId - The E-Mode category ID to set.
 * @param network - The network to use.
 * @returns The transaction hash.
 */
export async function setUserEMode(
  categoryId: number,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) throw new Error('Private key not available.');

    console.log(`Setting E-Mode category to ${categoryId}`);

    const walletClient = getWalletClient(privateKey, network);
    const hash = await walletClient.writeContract({
      address: YEI_ADDRESSES.Pool as Address,
      abi: PoolAbi,
      functionName: 'setUserEMode',
      args: [categoryId],
      account: walletClient.account!,
      chain: walletClient.chain,
    });
    return hash;
  } catch (error) {
    throw new Error(`Failed to set E-Mode: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Approves credit delegation by specifying the underlying asset and interest rate mode.
 *
 * @param underlyingAssetAddress - The address of the underlying asset (e.g., USDC, WSEI).
 * @param delegateeAddress - The address of the account being delegated borrowing power.
 * @param amount - The amount of the underlying asset to approve (e.g., "100.50").
 * @param interestRateMode - The type of debt: 'stable' or 'variable'.
 * @param network - The network to perform the transaction on. Defaults to DEFAULT_NETWORK.
 * @returns A promise that resolves to the transaction hash.
 */
export async function approveCreditDelegation(
  underlyingAssetAddress: string,
  delegateeAddress: string,
  amount: string,
  interestRateMode: 'stable' | 'variable',
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  const validatedUnderlyingAddress = services.helpers.validateAddress(underlyingAssetAddress);
  const validatedDelegateeAddress = services.helpers.validateAddress(delegateeAddress);

  const privateKey = getPrivateKeyAsHex();
  if (!privateKey) throw new Error('Private key not available.');

  const publicClient = getPublicClient(network);
  const walletClient = getWalletClient(privateKey, network);

  const reserveData = await publicClient.readContract({
    address: YEI_ADDRESSES.Pool as Address,
    abi: PoolAbi,
    functionName: 'getReserveData',
    args: [validatedUnderlyingAddress],
  });

  const debtTokenAddress = interestRateMode === 'stable'
    ? reserveData.stableDebtTokenAddress
    : reserveData.variableDebtTokenAddress;

  const decimals = await getTokenDecimals(validatedUnderlyingAddress, network);
  const amountInSmallestUnit = parseUnits(amount, decimals);

  const hash = await walletClient.writeContract({
    address: debtTokenAddress,
    abi: DebtTokenAbi,
    functionName: 'approveDelegation',
    args: [validatedDelegateeAddress, amountInSmallestUnit],
    account: walletClient.account!,
    chain: walletClient.chain,
  });

  return hash;
}

/**
 * Approves credit delegation for a specific debt token through debt token address.
 *
 * @param debtTokenAddress - The address of the Yei Finance debt token contract.
 * @param delegateeAddress - The address of the account being delegated borrowing power.
 * @param amount - The amount of the underlying asset to approve (e.g., "100.50").
 * @param network - The network to perform the transaction on. Defaults to DEFAULT_NETWORK.
 * @returns A promise that resolves to the transaction hash.
 */
export async function approveCreditDelegationByDebtToken(
  debtTokenAddress: string,
  delegateeAddress: string,
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  const validatedDebtTokenAddress = services.helpers.validateAddress(debtTokenAddress);
  const validatedDelegateeAddress = services.helpers.validateAddress(delegateeAddress);

  const privateKey = getPrivateKeyAsHex();
  if (!privateKey) throw new Error('Private key not available.');

  const publicClient = getPublicClient(network);

  const underlyingAssetAddress = await publicClient.readContract({
    address: validatedDebtTokenAddress,
    abi: aTokenAbi,
    functionName: 'UNDERLYING_ASSET_ADDRESS',
  });

  const decimals = await getTokenDecimals(underlyingAssetAddress, network);
  const amountInSmallestUnit = parseUnits(amount, decimals);

  const walletClient = getWalletClient(privateKey, network);

  // Execute the 'approveDelegation' transaction on the debt token contract.
  const hash = await walletClient.writeContract({
    address: validatedDebtTokenAddress,
    abi: DebtTokenAbi,
    functionName: 'approveDelegation',
    args: [validatedDelegateeAddress, amountInSmallestUnit],
    account: walletClient.account!,
    chain: walletClient.chain,
  });

  return hash;
}
