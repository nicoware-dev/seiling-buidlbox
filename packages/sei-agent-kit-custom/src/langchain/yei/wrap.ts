import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { wrapSei } from "../../tools/yei/wrap";

const wrapSeiInputSchema = z.object({
  amount: z
    .string()
    .describe("The amount of SEI to wrap into WSEI (e.g., '0.1', '1.0')"),
});

/**
 * LangChain tool for wrapping SEI into WSEI
 */
export class SeiWrapSeiTool extends StructuredTool<typeof wrapSeiInputSchema> {
  name = "wrap_sei";
  description = "Wraps SEI tokens into WSEI (Wrapped SEI) tokens. This converts native SEI to WSEI which can then be supplied to Yei Finance.";
  schema = wrapSeiInputSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ amount }: z.infer<typeof wrapSeiInputSchema>): Promise<string> {
    try {
      const result = await wrapSei(this.seiKit, { amount });

      return JSON.stringify({
        status: "success",
        message: `Successfully wrapped ${amount} SEI into WSEI. Transaction hash: ${result}`,
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