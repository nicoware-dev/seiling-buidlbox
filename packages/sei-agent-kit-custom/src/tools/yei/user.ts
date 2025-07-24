import { getYeiPoolContract } from './abi/pool';
import { SeiAgentKit } from '../../agent';

export interface UserAccountData {
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
  availableBorrowsBase: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

export async function getYeiHealthFactor(agent: SeiAgentKit, userAddress: string): Promise<UserAccountData> {
  // Verificar que el agente tiene los clientes necesarios
  if (!agent.publicClient || !agent.walletClient) {
    throw new Error("Agent clients not properly initialized");
  }

  try {
    console.log(`Getting health factor for user: ${userAddress}`);
    
    const pool = getYeiPoolContract(agent.walletClient);
    console.log(`Pool contract address: ${pool.address}`);
    
    const result = await agent.publicClient.readContract({
      address: pool.address as any,
      abi: pool.abi,
      functionName: 'getUserAccountData',
      args: [userAddress as any],
    }) as [bigint, bigint, bigint, bigint, bigint, bigint];
    
    const [
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor
    ] = result;
    
    console.log(`Health factor retrieved successfully: ${healthFactor.toString()}`);
    
    return {
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor,
    };
  } catch (error) {
    console.error(`Failed to get health factor: ${error}`);
    throw new Error(`Failed to get health factor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 