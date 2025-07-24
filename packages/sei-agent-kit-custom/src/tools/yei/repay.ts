import { Address, parseUnits } from "viem";
import { SeiAgentKit } from "../../agent";
import { getYeiPoolContract } from "./abi/pool";
import { getTokenInfo } from "./tokenMap";
import { DEBT_TOKEN_ABI } from "./abi/atoken";
import { ERC20_DETAILED_ABI } from "./abi/erc20";

export interface RepayYeiParams {
  asset: string;
  amount: string;
  interestRateMode: number;
}

export async function repayYei(
  agent: SeiAgentKit,
  params: RepayYeiParams
): Promise<string> {
  const { asset, amount, interestRateMode } = params;
  const tokenInfo = getTokenInfo(asset);
  if (!tokenInfo) throw new Error(`Token not supported: ${asset}`);
  const amountWei = parseUnits(amount, tokenInfo.decimals);

  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  const debtTokenAddress = interestRateMode === 1
    ? tokenInfo.stableDebtTokenAddress
    : tokenInfo.variableDebtTokenAddress;

  const debtBalance = await agent.publicClient.readContract({
    address: debtTokenAddress as Address,
    abi: DEBT_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [agent.wallet_address as Address],
  });

  if ((debtBalance as bigint) === 0n) {
    throw new Error("No debt to repay");
  }

  const poolContract = getYeiPoolContract(agent.walletClient);
  const allowance = await agent.publicClient.readContract({
    address: tokenInfo.address as Address,
    abi: ERC20_DETAILED_ABI,
    functionName: 'allowance',
    args: [agent.wallet_address as Address, poolContract.address as Address],
  });

  if ((allowance as bigint) < amountWei) {
    const approveTx = await agent.walletClient.writeContract({
      address: tokenInfo.address as Address,
      abi: ERC20_DETAILED_ABI,
      functionName: 'approve',
      args: [poolContract.address as Address, amountWei],
      account: agent.walletClient.account,
      chain: agent.walletClient.chain,
    });
    await agent.publicClient.waitForTransactionReceipt({ hash: approveTx });
  }

  const pool = getYeiPoolContract(agent.walletClient);
  const tx = await agent.walletClient.writeContract({
    address: pool.address as Address,
    abi: pool.abi,
    functionName: 'repay',
    args: [tokenInfo.address as Address, amountWei, BigInt(interestRateMode), agent.wallet_address as Address],
    account: agent.walletClient.account,
    chain: agent.walletClient.chain,
  });
  
  const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: tx });
  return receipt.transactionHash;
}
