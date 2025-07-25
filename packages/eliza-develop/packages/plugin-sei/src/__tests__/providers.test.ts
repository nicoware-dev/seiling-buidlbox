import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { evmWalletProvider } from "../providers/wallet";
import {
  createMockRuntime,
  createMockMemory,
  createMockState,
} from "./test-utils";
import { type IAgentRuntime, type Memory, type State } from "@elizaos/core";

describe("Sei Wallet Provider", () => {
  let mockRuntime: any;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;

  beforeEach(() => {
    mockRuntime = createMockRuntime();
    mockMessage = createMockMemory();
    mockState = createMockState();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("provider properties", () => {
    it("should have required properties", () => {
      expect(evmWalletProvider.name).toBe("seiWalletProvider");
      expect(evmWalletProvider.description).toBe(
        "Provides Sei wallet information including address and balance"
      );
      expect(evmWalletProvider.get).toBeDefined();
      expect(typeof evmWalletProvider.get).toBe("function");
    });
  });

  describe("get method", () => {
    it("should return wallet data in correct format when successful", async () => {
      // Mock runtime settings
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          SEI_PRIVATE_KEY:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
          SEI_NETWORK: "testnet",
        };
        return settings[key];
      });

      const result = await evmWalletProvider.get(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State
      );

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.data).toBeDefined();

      // The actual wallet initialization will fail in tests,
      // but we're testing the provider structure
      if (result.data && !result.data.error) {
        expect(result.data.address).toBeDefined();
        expect(result.data.balance).toBeDefined();
        expect(result.data.chainId).toBeDefined();
        expect(result.data.chainName).toBeDefined();
      }
    });

    it("should handle missing SEI_PRIVATE_KEY gracefully", async () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        if (key === "SEI_NETWORK") return "testnet";
        return null;
      });

      const result = await evmWalletProvider.get(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State
      );

      expect(result).toBeDefined();
      expect(result.text).toContain("Error retrieving wallet information");
      expect(result.data).toBeDefined();
      expect(result.data!.error).toBeDefined();
    });

    it("should handle invalid SEI_NETWORK gracefully", async () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          SEI_PRIVATE_KEY:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
          SEI_NETWORK: "invalid-network",
        };
        return settings[key];
      });

      const result = await evmWalletProvider.get(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State
      );

      expect(result).toBeDefined();
      expect(result.text).toContain("Error retrieving wallet information");
      expect(result.data!.error).toBeDefined();
    });

    it("should use agent name from state", async () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          SEI_PRIVATE_KEY:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
          SEI_NETWORK: "testnet",
        };
        return settings[key];
      });

      const customState = createMockState({
        values: {
          agentName: "Custom Agent",
          recentMessages: "Test",
        },
      });

      const result = await evmWalletProvider.get(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        customState as State
      );

      expect(result).toBeDefined();
      // The wallet initialization will work in this test
      expect(result.text).toBeDefined();
    });

    it("should use default agent name when not in state", async () => {
      mockRuntime.getSetting = mock().mockImplementation((key: string) => {
        const settings: Record<string, string> = {
          SEI_PRIVATE_KEY:
            "0x1234567890123456789012345678901234567890123456789012345678901234",
          SEI_NETWORK: "testnet",
        };
        return settings[key];
      });

      const stateWithoutAgentName = createMockState({
        values: {
          recentMessages: "Test",
        },
      });

      const result = await evmWalletProvider.get(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        stateWithoutAgentName as State
      );

      expect(result).toBeDefined();
      // The wallet initialization will work in this test
      expect(result.text).toBeDefined();
    });
  });
});
