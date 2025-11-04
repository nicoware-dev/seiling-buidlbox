import { type Address, formatUnits, parseUnits, encodePacked, getContract } from 'viem';
import { getPublicClient, getWalletClient } from './clients.js';
import { readContract, writeContract } from './contracts.js';
import * as services from './index.js';
import { getPrivateKeyAsHex } from '../config.js';
import { DEFAULT_NETWORK } from '../chains.js';

import { erc20Abi } from './abi/erc20.js';
import { wrappedSeiAbi } from './abi/wrappedSEI.js';

/**
 * Wrap SEI to WSEI
 */
export async function wrapSeiDirectly(
  wrappedSeiAddress: string,
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedWrappedSeiAddress = services.helpers.validateAddress(wrappedSeiAddress);
    
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountWei = parseUnits(amount, 18);
    
    console.log(`Wrapping ${amount} SEI to WSEI`);
    
    const walletClient = getWalletClient(privateKey, network);
    
    // Using WSEI contract directly - deposit function
    const hash = await walletClient.writeContract({
      address: validatedWrappedSeiAddress,
      abi: wrappedSeiAbi,
      functionName: 'deposit',
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

/**
 * Unwrap WSEI to SEI
 */
export async function unwrapWseiDirectly(
  wrappedSeiAddress: string,
  amount: string,
  network = DEFAULT_NETWORK
): Promise<`0x${string}`> {
  try {
    const validatedWrappedSeiAddress = services.helpers.validateAddress(wrappedSeiAddress);
    
    const privateKey = getPrivateKeyAsHex();
    if (!privateKey) {
      throw new Error('Private key not available. Set the PRIVATE_KEY environment variable and restart the MCP server.');
    }

    const amountWei = parseUnits(amount, 18);
    
    console.log(`Unwrapping ${amount} WSEI to SEI`);
    
    const walletClient = getWalletClient(privateKey, network);
    
    // Using WSEI contract directly - withdraw function
    const hash = await walletClient.writeContract({
      address: validatedWrappedSeiAddress,
      abi: wrappedSeiAbi,
      functionName: 'withdraw',
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