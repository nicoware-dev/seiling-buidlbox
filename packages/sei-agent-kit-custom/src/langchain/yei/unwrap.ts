import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { unwrapSei } from "../../tools/yei/unwrap";

const unwrapSeiInputSchema = z.object({
  amount: z
    .string()
    .describe("The amount of WSEI to unwrap into SEI (e.g., '0.1', '1.0')"),
});

/**
 * LangChain tool for unwrapping WSEI into SEI
 */
export class SeiUnwrapSeiTool extends StructuredTool<typeof unwrapSeiInputSchema> {
  name = "unwrap_sei";
  description = "Unwraps WSEI (Wrapped SEI) tokens into native SEI tokens. This converts WSEI back to native SEI.";
  schema = unwrapSeiInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ amount }: z.infer<typeof unwrapSeiInputSchema>): Promise<string> {
    try {
      const result = await unwrapSei(this.seiKit, { amount });

      return JSON.stringify({
        status: "success",
        message: `Successfully unwrapped ${amount} WSEI into SEI. Transaction hash: ${result}`,
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