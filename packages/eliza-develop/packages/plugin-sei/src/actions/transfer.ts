import { formatEther, parseEther } from "viem";
import type { Hex } from "viem";
import { elizaLogger, composePrompt, ModelType } from "@elizaos/core";
import type {
  Action,
  ActionExample,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { initWalletProvider } from "../providers/wallet";
import type { WalletProvider } from "../providers/wallet";

export interface TransferParams {
  amount: string;
  toAddress: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  data?: Hex;
}

const transferTemplate = `Extract transfer parameters from the user's message:

Recent message: {{recentMessages}}

Extract:
1. Amount to transfer (number + "SEI") 
2. Recipient address (starts with "0x")

Examples:
- "transfer 0.1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e" → amount: "0.1", toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
- "send 5 SEI to 0x123..." → amount: "5", toAddress: "0x123..."

Return JSON:
\`\`\`json
{
    "amount": "string",
    "toAddress": "string"
}
\`\`\``;

export class TransferAction {
  constructor(private walletProvider: WalletProvider) {}

  async transfer(params: TransferParams): Promise<Transaction> {
    const chain = this.walletProvider.getCurrentChain();
    elizaLogger.log(
      `Transferring ${params.amount} SEI to ${params.toAddress} on ${chain.name}`
    );
    elizaLogger.log("Transfer params received:", params);
    elizaLogger.log("Amount to parse:", typeof params.amount, params.amount);

    // Validate address format
    if (!params.toAddress.startsWith("0x") || params.toAddress.length !== 42) {
      throw new Error(`Invalid address format: ${params.toAddress}`);
    }

    const walletClient = this.walletProvider.getEvmWalletClient();
    if (!walletClient.account) {
      throw new Error("Wallet client account is undefined");
    }

    try {
      const hash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: params.toAddress as `0x${string}`,
        value: parseEther(params.amount),
      } as Parameters<typeof walletClient.sendTransaction>[0]);

      return {
        hash,
        from: walletClient.account.address,
        to: params.toAddress,
        value: parseEther(params.amount),
      };
    } catch (error) {
      throw new Error(`Transfer failed: ${(error as Error).message}`);
    }
  }
}

const extractTransferParams = async (
  state: State,
  message: Memory,
  runtime: IAgentRuntime
): Promise<TransferParams> => {
  // Use recentMessages if available, else fallback to message.content.text
  const messageText =
    state.recentMessages?.[0]?.content?.text || message?.content?.text || "";
  elizaLogger.log("[Transfer Extraction] Raw message:", messageText);
  // Regex: amount (with dot or comma), address (0x...), allow for extra words
  const amountMatch = messageText.match(/([0-9]+[.,]?[0-9]*)\s*SEI/i);
  // Accept 'to' or 'on' or nothing before the address
  const addressMatch = messageText.match(/(?:to|on)?\s*(0x[a-fA-F0-9]{40})/i);
  elizaLogger.log("[Transfer Extraction] Regex matches:", {
    amountMatch,
    addressMatch,
  });
  if (amountMatch && addressMatch) {
    // Normalize amount (replace comma with dot)
    const amount = amountMatch[1].replace(",", ".");
    elizaLogger.log(
      "[Transfer Extraction] Extracted amount:",
      amount,
      "address:",
      addressMatch[1]
    );
    return {
      amount,
      toAddress: addressMatch[1],
    };
  }
  elizaLogger.error(
    "[Transfer Extraction] Could not extract amount and address.",
    { messageText }
  );
  throw new Error(
    "Could not extract both amount and address from your message. Please specify both clearly, e.g. 'Transfer 0.5 SEI to 0x...' ."
  );
};

export const transferAction: Action = {
  name: "TRANSFER_SEI",
  description: "Transfer SEI tokens to another address on the network",
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State, // Make state optional to match Action Handler type
    _options: Record<string, unknown> = {},
    callback?: HandlerCallback
  ): Promise<void> => {
    elizaLogger.log("Transfer action handler started");
    let currentState = state;
    if (!currentState) {
      currentState = (await runtime.composeState(message)) as State;
    }
    try {
      const walletProvider = await initWalletProvider(runtime);
      const action = new TransferAction(walletProvider);
      const params = await extractTransferParams(
        currentState,
        message,
        runtime
      );
      elizaLogger.log("Extracted params:", params);
      if (!params.amount || !params.toAddress) {
        elizaLogger.error("Missing required parameters");
        if (callback) {
          callback({
            text: "I need both an amount and a recipient address. Please specify how much SEI to transfer and the 0x address.",
            content: { error: "Missing parameters" },
          });
        }
        return;
      }
      const result = await action.transfer(params);
      elizaLogger.log("Transfer successful:", result);
      if (callback) {
        callback({
          text: `✅ Successfully transferred ${params.amount} SEI to ${params.toAddress}\n\nTransaction: ${result.hash}`,
          content: {
            success: true,
            hash: result.hash,
            amount: params.amount,
            recipient: params.toAddress,
            chain: walletProvider.getCurrentChain().name,
          },
        });
      }
      return;
    } catch (error) {
      elizaLogger.error("Transfer failed:", error);
      if (callback) {
        callback({
          text: `❌ Transfer failed: ${(error as Error).message}`,
          content: { error: (error as Error).message },
        });
      }
      return;
    }
  },
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    elizaLogger.log("🔍 TRANSFER ACTION VALIDATION CALLED");
    elizaLogger.log("Message content:", message.content.text);

    const text = message.content.text?.toLowerCase() || "";
    elizaLogger.log("Lowercase text:", text);

    // Check for transfer keywords
    const hasTransferKeyword = /\b(transfer|send|execute|tx)\b/i.test(text);
    elizaLogger.log("Has transfer keyword:", hasTransferKeyword);

    // Check for SEI amount
    const hasAmount = /\d+(?:\.\d+)?\s*sei\b/i.test(text);
    elizaLogger.log("Has amount:", hasAmount);

    // Check for address
    const hasAddress = /0x[a-fA-F0-9]{40}/.test(text);
    elizaLogger.log("Has address:", hasAddress);

    const isValid = hasTransferKeyword && (hasAmount || hasAddress);
    elizaLogger.log("🎯 TRANSFER VALIDATION RESULT:", {
      hasTransferKeyword,
      hasAmount,
      hasAddress,
      isValid,
    });

    return isValid;
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        },
      },
      {
        name: "{{user2}}",
        content: {
          text: "I'll transfer 1 SEI to that address for you.",
          actions: ["TRANSFER_SEI"],
        },
      },
    ],
  ] as ActionExample[][],
  similes: [
    "TRANSFER_TOKENS",
    "SEND_SEI",
    "TRANSFER_SEI",
    "SEND_TOKENS",
    "EXECUTE_TRANSFER",
    "TRANSFER",
    "SEND",
    "MOVE_TOKENS",
    "EXECUTE_TX",
  ],
};
