import { Address, parseUnits, Account } from 'viem';
import { SeiAgentKit } from '../../agent';
import { getTokenInfo } from './tokenMap';

export interface WrapSeiParams {
  amount: string; 
}

export async function wrapSei(agent: SeiAgentKit, params: WrapSeiParams): Promise<string> {
  const { amount } = params;
  const tokenInfo = getTokenInfo('WSEI');
  if (!tokenInfo) throw new Error('WSEI token not found in tokenMap');
  const amountWei = parseUnits(amount, 18); // SEI has 18 decimals

  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  try {
    const seiBalance = await agent.publicClient.getBalance({
      address: agent.wallet_address,
    });
    
    console.log(`SEI balance: ${seiBalance.toString()}, Required: ${amountWei.toString()}`);
    
    if (seiBalance < amountWei) {
      throw new Error(`Insufficient SEI balance. Required: ${amount}, Available: ${seiBalance.toString()}`);
    }
  } catch (error) {
    throw new Error(`Failed to check SEI balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // The WSEI contract has a deposit() payable function
  try {
    console.log(`Starting wrap process for ${amount} SEI to WSEI`);
    console.log(`WSEI contract address: ${tokenInfo.address}`);
    console.log(`Amount in wei: ${amountWei.toString()}`);

    const txHash = await agent.walletClient.writeContract({
      address: tokenInfo.address as Address,
      abi: [
        {
          "inputs": [],
          "name": "deposit",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ],
      functionName: 'deposit',
      args: [],
      value: amountWei,
      account: agent.walletClient.account as Account,
      chain: agent.walletClient.chain,
    });

    console.log(`Wrap transaction submitted: ${txHash}`);
    const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: txHash });
    
    if (receipt.status !== 'success') {
      throw new Error(`Wrap transaction failed. Hash: ${txHash}`);
    }
    
    console.log(`Wrap successful! Hash: ${txHash}`);
    return txHash;
  } catch (error) {
    console.error(`Wrap failed: ${error}`);
    throw new Error(`Failed to wrap SEI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 