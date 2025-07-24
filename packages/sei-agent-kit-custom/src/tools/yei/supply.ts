import {
  parseUnits,
  formatUnits,
  Address,
  Account,
} from 'viem';
import { SeiAgentKit } from '../../agent';
import { getYeiPoolContract } from './abi/pool';
import { getTokenInfo } from './tokenMap';
import { ERC20_DETAILED_ABI } from './abi/erc20';

export interface SupplyYeiParams {
  asset: string;
  amount: string;
}

async function findWorkingABI(
  agent: SeiAgentKit,
  tokenAddress: Address,
  abis: any[]
): Promise<any> {
  for (const abi of abis) {
    try {
      await agent.publicClient.readContract({
        address: tokenAddress,
        abi,
        functionName: 'balanceOf',
        args: [agent.wallet_address],
      });
      return abi;
    } catch (error) {
      continue;
    }
  }
  throw new Error('No working ABI found for token');
}

export async function supplyYei(
  agent: SeiAgentKit,
  params: SupplyYeiParams
): Promise<string> {
  const { asset, amount } = params;
  const tokenInfo = getTokenInfo(asset);
  if (!tokenInfo) throw new Error(`Token not supported: ${asset}`);
  const amountWei = parseUnits(amount, tokenInfo.decimals);

  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  const abiToUse = ERC20_DETAILED_ABI;

  try {
    const tokenBalance = await agent.publicClient.readContract({
      address: tokenInfo.address as Address,
      abi: abiToUse,
      functionName: 'balanceOf',
      args: [agent.wallet_address],
    });
    if ((tokenBalance as bigint) < amountWei) {
      throw new Error(`Insufficient token balance. Required: ${amount}`);
    }
  } catch (error) {
    throw new Error(`Failed to check token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const poolContract = getYeiPoolContract(agent.walletClient);
  try {
    const approvalHash = await agent.walletClient.writeContract({
      address: tokenInfo.address as Address,
      abi: abiToUse,
      functionName: 'approve',
      args: [poolContract.address as Address, amountWei],
      account: agent.walletClient.account as Account,
      chain: agent.walletClient.chain,
    });
    await agent.publicClient.waitForTransactionReceipt({ hash: approvalHash });
  } catch (error) {
    throw new Error(`Failed to approve token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    const supplyHash = await agent.walletClient.writeContract({
      address: poolContract.address as Address,
      abi: poolContract.abi,
      functionName: 'supply',
      args: [tokenInfo.address as Address, amountWei, agent.wallet_address, 0],
      account: agent.walletClient.account as Account,
      chain: agent.walletClient.chain,
    });
    const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: supplyHash });
    if (receipt.status !== 'success') {
      throw new Error(`Supply transaction failed. Hash: ${supplyHash}`);
    }
    return supplyHash;
  } catch (error) {
    throw new Error(`Failed to supply token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
