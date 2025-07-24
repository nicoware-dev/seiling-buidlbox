import { Address, parseUnits, Account, formatUnits } from 'viem';
import { SeiAgentKit } from '../../agent';
import { getTokenInfo } from './tokenMap';
import { ERC20_DETAILED_ABI } from './abi/erc20';

export interface UnwrapSeiParams {
  amount: string; // en WSEI (ej: "1.0")
}

export async function unwrapSei(agent: SeiAgentKit, params: UnwrapSeiParams): Promise<string> {
  const { amount } = params;
  const tokenInfo = getTokenInfo('WSEI');
  if (!tokenInfo) throw new Error('WSEI token not found in tokenMap');
  const amountWei = parseUnits(amount, tokenInfo.decimals);

  // Verificar que el agente tiene los clientes necesarios
  if (!agent.publicClient || !agent.walletClient || !agent.walletClient.account) {
    throw new Error("Agent clients not properly initialized");
  }

  // Verificar balance de WSEI
  try {
    const wseiBalance = await agent.publicClient.readContract({
      address: tokenInfo.address as Address,
      abi: ERC20_DETAILED_ABI,
      functionName: 'balanceOf',
      args: [agent.wallet_address],
    });
    
    console.log(`WSEI balance: ${formatUnits(wseiBalance as bigint, tokenInfo.decimals)}, Required: ${amount}`);
    
    if ((wseiBalance as bigint) < amountWei) {
      throw new Error(`Insufficient WSEI balance. Required: ${amount}, Available: ${formatUnits(wseiBalance as bigint, tokenInfo.decimals)}`);
    }
  } catch (error) {
    throw new Error(`Failed to check WSEI balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // El contrato de WSEI tiene una función withdraw() para unwrap
  try {
    console.log(`Starting unwrap process for ${amount} WSEI to SEI`);
    console.log(`WSEI contract address: ${tokenInfo.address}`);
    console.log(`Amount in wei: ${amountWei.toString()}`);

    const txHash = await agent.walletClient.writeContract({
      address: tokenInfo.address as Address,
      abi: [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "withdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functionName: 'withdraw',
      args: [amountWei],
      account: agent.walletClient.account as Account,
      chain: agent.walletClient.chain,
    });

    console.log(`Unwrap transaction submitted: ${txHash}`);
    const receipt = await agent.publicClient.waitForTransactionReceipt({ hash: txHash });
    
    if (receipt.status !== 'success') {
      throw new Error(`Unwrap transaction failed. Hash: ${txHash}`);
    }
    
    console.log(`Unwrap successful! Hash: ${txHash}`);
    return txHash;
  } catch (error) {
    console.error(`Unwrap failed: ${error}`);
    throw new Error(`Failed to unwrap WSEI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 