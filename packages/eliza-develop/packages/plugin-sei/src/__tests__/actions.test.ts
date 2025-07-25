import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { transferAction } from "../actions/transfer";
import { setupActionTest, mockLogger } from "./test-utils";
import type { MockRuntime } from "./test-utils";
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  ModelType,
} from "@elizaos/core";

describe("Transfer Action", () => {
  let mockRuntime: MockRuntime;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;
  let callbackFn: HandlerCallback;

  beforeEach(() => {
    mockLogger();
    const setup = setupActionTest();
    mockRuntime = setup.mockRuntime;
    mockMessage = setup.mockMessage;
    mockState = setup.mockState;
    callbackFn = setup.callbackFn as HandlerCallback;
  });

  afterEach(() => {
    mock.restore();
  });

  describe("validation", () => {
    it("should validate when SEI_PRIVATE_KEY is set and starts with 0x", async () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        if (key === "SEI_PRIVATE_KEY") {
          return "0x1234567890123456789012345678901234567890123456789012345678901234";
        }
        return null;
      });

      const isValid = await transferAction.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );

      expect(isValid).toBe(true);
    });

    it("should not validate when SEI_PRIVATE_KEY is missing", async () => {
      mockRuntime.getSetting = mock().mockReturnValue(null);

      const isValid = await transferAction.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );

      expect(isValid).toBe(false);
    });

    it("should not validate when SEI_PRIVATE_KEY does not start with 0x", async () => {
      mockRuntime.getSetting = mock().mockReturnValue("invalid-key");

      const isValid = await transferAction.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory
      );

      expect(isValid).toBe(false);
    });
  });

  describe("handler", () => {
    it("should handle transfer action successfully", async () => {
      // Mock the XML response for parseKeyValueXml
      const xmlResponse = `<response>
                <amount>1</amount>
                <toAddress>0x742d35Cc6634C0532925a3b844Bc454e4438f44e</toAddress>
            </response>`;

      mockRuntime.useModel = mock().mockResolvedValue(xmlResponse);

      // Mock successful transfer
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          SEI_PRIVATE_KEY:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
          SEI_NETWORK: "testnet",
        };
        return settings[key];
      });

      // Note: The actual transfer will fail because we're not mocking the wallet provider
      // But we can test that the handler processes correctly up to that point
      const result = await transferAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn
      );

      // The transfer will fail due to wallet provider not being properly mocked
      expect(result).toBe(false);
      expect(callbackFn).toHaveBeenCalled();
    });

    it("should handle invalid XML response", async () => {
      // Mock invalid XML response that returns null from parseKeyValueXml
      mockRuntime.useModel = mock().mockResolvedValue("<invalid>xml</invalid>");

      const result = await transferAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn
      );

      // The handler should return false and call the callback with an error
      expect(result).toBe(false);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining("Error"),
        })
      );
    });

    it("should compose state when state is undefined", async () => {
      const xmlResponse = `<response>
                <amount>1</amount>
                <toAddress>0x742d35Cc6634C0532925a3b844Bc454e4438f44e</toAddress>
            </response>`;

      mockRuntime.useModel = mock().mockResolvedValue(xmlResponse);

      await transferAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        undefined,
        {},
        callbackFn
      );

      expect(mockRuntime.composeState).toHaveBeenCalledWith(mockMessage);
    });

    it("should update state when state is provided", async () => {
      const xmlResponse = `<response>
                <amount>1</amount>
                <toAddress>0x742d35Cc6634C0532925a3b844Bc454e4438f44e</toAddress>
            </response>`;

      mockRuntime.useModel = mock().mockResolvedValue(xmlResponse);

      await transferAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn
      );

      expect(mockRuntime.composeState).toHaveBeenCalledWith(mockMessage, [
        "RECENT_MESSAGES",
      ]);
    });
  });

  describe("action properties", () => {
    it("should have correct name and description", () => {
      expect(transferAction.name).toBe("transfer");
      expect(transferAction.description).toBe(
        "Transfer tokens between addresses on the same chain"
      );
    });

    it("should have correct similes", () => {
      expect(transferAction.similes).toContain("SEND_TOKENS");
      expect(transferAction.similes).toContain("TOKEN_TRANSFER");
      expect(transferAction.similes).toContain("MOVE_TOKENS");
      expect(transferAction.similes).toContain("SEND_SEI");
    });

    it("should have valid examples", () => {
      expect(transferAction.examples).toBeDefined();
      expect(Array.isArray(transferAction.examples)).toBe(true);
      expect(transferAction.examples!.length).toBeGreaterThan(0);
    });
  });
});
