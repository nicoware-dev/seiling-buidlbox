import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";

const SeiSupplyYeiInputSchema = z.object({
  asset: z
    .string()
    .describe("The token to supply (e.g., 'USDC', 'USDT', 'WSEI')"),
  amount: z
    .string()
    .describe("The amount to supply in human-readable format (e.g., '100' for 100 USDC)"),
});

/**
 * LangChain tool for supplying tokens to Yei Finance
 */
export class SeiSupplyYeiTool extends StructuredTool<typeof SeiSupplyYeiInputSchema> {
  name = "supply_yei";
  description = "Supplies tokens to the Yei Finance protocol (Aave V3 fork). Supported tokens: USDC, USDT, WSEI, ISEI, WETH, WBTC, wstETH, fastUSD, sfastUSD, sfrxETH, frxUSD, sfrxUSD, frxETH, etc. (see tokenMap.ts for full list).";
  schema = SeiSupplyYeiInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ asset, amount }: z.infer<typeof SeiSupplyYeiInputSchema>): Promise<string> {
    try {
      const result = await this.seiKit.supplyYei({ asset, amount });

      return JSON.stringify({
        status: "success",
        message: `Successfully supplied ${amount} ${asset} to Yei Finance. Transaction hash: ${result}`,
        txHash: result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
} 