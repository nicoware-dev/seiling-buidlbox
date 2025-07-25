import { describe, expect, it } from "bun:test";
import seiPlugin from "../index";
import { transferAction } from "../actions/transfer";
import { evmWalletProvider } from "../providers/wallet";

describe("Sei Plugin", () => {
  it("should export a valid plugin object", () => {
    expect(seiPlugin).toBeDefined();
    expect(seiPlugin.name).toBe("sei");
    expect(seiPlugin.description).toBe("Sei Plugin for Eliza");
  });

  it("should include transfer action", () => {
    expect(seiPlugin.actions).toBeDefined();
    expect(Array.isArray(seiPlugin.actions)).toBe(true);
    expect(seiPlugin.actions).toContain(transferAction);
    expect(seiPlugin.actions!.length).toBe(1);
  });

  it("should include wallet provider", () => {
    expect(seiPlugin.providers).toBeDefined();
    expect(Array.isArray(seiPlugin.providers)).toBe(true);
    expect(seiPlugin.providers).toContain(evmWalletProvider);
    expect(seiPlugin.providers!.length).toBe(1);
  });

  it("should have empty evaluators array", () => {
    expect(seiPlugin.evaluators).toBeDefined();
    expect(Array.isArray(seiPlugin.evaluators)).toBe(true);
    expect(seiPlugin.evaluators!.length).toBe(0);
  });

  it("should not have services", () => {
    // Services are optional in plugins
    expect(seiPlugin.services).toBeUndefined();
  });

  it("should export the correct plugin structure", () => {
    const expectedKeys = [
      "name",
      "description",
      "actions",
      "evaluators",
      "providers",
    ];
    const actualKeys = Object.keys(seiPlugin);

    expectedKeys.forEach((key) => {
      expect(actualKeys).toContain(key);
    });
  });
});
