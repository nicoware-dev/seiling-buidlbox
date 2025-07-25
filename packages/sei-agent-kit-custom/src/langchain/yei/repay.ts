import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";

const SeiRepayYeiInputSchema = z.object({
  asset: z
    .string()
    .describe("The token to repay (e.g., 'USDC', 'USDT', 'WSEI')"),
  amount: z
    .string()
    .describe("The amount to repay in human-readable format (e.g., '100' for 100 USDC)"),
  interestRateMode: z
    .enum(["0", "1", "2"])
    .optional()
    .describe("Interest rate mode: 0=NONE, 1=STABLE, 2=VARIABLE. Defaults to 2 (VARIABLE)"),
});

/**
 * LangChain tool for repaying borrowed tokens to Yei Finance
 */
export class SeiRepayYeiTool extends StructuredTool<typeof SeiRepayYeiInputSchema> {
  name = "repay_yei";
  description = "Repays borrowed tokens to the Yei Finance protocol (Aave V3 fork). Supported tokens: USDC, USDT, WSEI.";
  schema = SeiRepayYeiInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ asset, amount, interestRateMode = "2" }: z.infer<typeof SeiRepayYeiInputSchema>): Promise<string> {
    try {
      const result = await this.seiKit.repayYei({ asset, amount, interestRateMode: parseInt(interestRateMode) });

      return JSON.stringify({
        status: "success",
        message: `Successfully repaid ${amount} ${asset} from Yei Finance. Transaction hash: ${result}`,
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