import { Address, parseUnits } from "viem";
import { SeiAgentKit } from "../../agent";
import { getYeiPoolContract } from "./abi/pool";
import { getTokenInfo } from "./tokenMap";

export interface BorrowYeiParams {
  asset: string;
  amount: string;
  interestRateMode: number;
}

export async function borrowYei(
  agent: SeiAgentKit,
  params: BorrowYeiParams
): Promise<string> {
  const { asset, amount, interestRateMode } = params;
  const tokenInfo = getTokenInfo(asset);
  if (!tokenInfo) throw new Error(`Token not supported: ${asset}`);
  const amountWei = parseUnits(amount, tokenInfo.decimals);

  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  const pool = getYeiPoolContract(agent.walletClient);
  const tx = await agent.walletClient.writeContract({
    address: pool.address as Address,
    abi: pool.abi,
    functionName: 'borrow',
    args: [tokenInfo.address as Address, amountWei, BigInt(interestRateMode), 0n, agent.wallet_address as Address],
    account: agent.walletClient.account,
    chain: agent.walletClient.chain,
  });
  
  const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: tx });
  return receipt.transactionHash;
}
