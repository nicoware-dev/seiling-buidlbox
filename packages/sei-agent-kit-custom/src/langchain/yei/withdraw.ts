import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";

const SeiWithdrawYeiInputSchema = z.object({
  asset: z
    .string()
    .describe("The token to withdraw (e.g., 'USDC', 'USDT', 'WSEI')"),
  amount: z
    .string()
    .describe("The amount to withdraw in human-readable format (e.g., '100' for 100 USDC)"),
});

/**
 * LangChain tool for withdrawing supplied tokens from Yei Finance
 */
export class SeiWithdrawYeiTool extends StructuredTool<typeof SeiWithdrawYeiInputSchema> {
  name = "withdraw_yei";
  description = "Withdraws supplied tokens from the Yei Finance protocol (Aave V3 fork). Supported tokens: USDC, USDT, WSEI.";
  schema = SeiWithdrawYeiInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ asset, amount }: z.infer<typeof SeiWithdrawYeiInputSchema>): Promise<string> {
    try {
      const result = await this.seiKit.withdrawYei({ asset, amount });

      return JSON.stringify({
        status: "success",
        message: `Successfully withdrew ${amount} ${asset} from Yei Finance. Transaction hash: ${result}`,
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