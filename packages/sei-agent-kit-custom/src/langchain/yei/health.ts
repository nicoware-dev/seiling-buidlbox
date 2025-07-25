import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { SeiAgentKit } from "../../agent";
import { getYeiHealthFactor } from "../../tools/yei/user";

const getHealthFactorSchema = z.object({
  userAddress: z
    .string()
    .optional()
    .describe(
      "The user address to check health factor for (optional, defaults to connected wallet)"
    ),
});

/**
 * LangChain tool for getting Yei Finance health factor
 */
export class SeiGetYeiHealthFactorTool extends StructuredTool<typeof getHealthFactorSchema> {
  name = "get_yei_health_factor";
  description =
    "Gets the health factor and account data for a user in Yei Finance. Returns total collateral, total debt, available borrows, liquidation threshold, LTV, and health factor.";
  schema = getHealthFactorSchema;

  constructor(private readonly seiKit: SeiAgentKit) {
    super();
  }

  protected async _call({ userAddress }: z.infer<typeof getHealthFactorSchema>): Promise<string> {
    try {
      const result = await getYeiHealthFactor(
        this.seiKit,
        userAddress || this.seiKit.wallet_address
      );

      // Convert bigint values to readable format
      let healthFactorReadable: string;
      const maxUint256 = BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      );
      if (
        result.healthFactor === BigInt(0) ||
        result.totalDebtBase === BigInt(0) ||
        result.healthFactor > BigInt(1e30)
      ) {
        healthFactorReadable = "∞ (no liquidation risk, you have no debt)";
      } else {
        healthFactorReadable = (Number(result.healthFactor) / 1e18).toFixed(4);
      }

      return JSON.stringify({
        status: "success",
        message: `Health factor retrieved successfully for ${userAddress || this.seiKit.wallet_address}`,
        data: {
          totalCollateralBase: result.totalCollateralBase.toString(),
          totalDebtBase: result.totalDebtBase.toString(),
          availableBorrowsBase: result.availableBorrowsBase.toString(),
          currentLiquidationThreshold: result.currentLiquidationThreshold.toString(),
          ltv: result.ltv.toString(),
          healthFactor: result.healthFactor.toString(),
          healthFactorReadable: healthFactorReadable,
          note:
            result.totalDebtBase === BigInt(0)
              ? "Note: When debt is zero, the protocol returns a maximum value for the health factor."
              : undefined,
        },
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