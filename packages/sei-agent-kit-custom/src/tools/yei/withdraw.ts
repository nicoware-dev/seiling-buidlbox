import { Address, parseUnits } from "viem";
import { SeiAgentKit } from "../../agent";
import { getYeiPoolContract } from "./abi/pool";
import { getTokenInfo } from "./tokenMap";
import { ATOKEN_ABI } from "./abi/atoken";

export interface WithdrawYeiParams {
  asset: string;
  amount: string;
}

export async function withdrawYei(
  agent: SeiAgentKit,
  params: WithdrawYeiParams
): Promise<string> {
  const { asset, amount } = params;
  const tokenInfo = getTokenInfo(asset);
  if (!tokenInfo) throw new Error(`Token not supported: ${asset}`);
  const amountWei = parseUnits(amount, tokenInfo.decimals);

  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  const aTokenABI = ATOKEN_ABI;

  const aTokenBalance = await agent.publicClient.readContract({
    address: tokenInfo.aTokenAddress as Address,
    abi: aTokenABI,
    functionName: 'balanceOf',
    args: [agent.wallet_address as Address],
  });

  if ((aTokenBalance as bigint) < amountWei) {
    throw new Error("Insufficient aToken balance");
  }

  const pool = getYeiPoolContract(agent.walletClient);
  const tx = await agent.walletClient.writeContract({
    address: pool.address as Address,
    abi: pool.abi,
    functionName: 'withdraw',
    args: [tokenInfo.address as Address, amountWei, agent.wallet_address as Address],
    account: agent.walletClient.account,
    chain: agent.walletClient.chain,
  });
  
  const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: tx });
  return receipt.transactionHash;
}
