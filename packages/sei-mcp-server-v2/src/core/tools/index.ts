import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNetworkTools } from "./network.js";
import { registerTokenTools } from "./token.js";
import { registerDragonSwapTools } from "./dragonswap.js";
import { registerCoinGeckoTools } from "./coingecko.js";
import { registerDexScreenerTools } from "./dexscreener.js";
import { registerSeiTraceTools } from "./seitrace.js";
import { registerDeployErc20Tools } from "./deployERC20.js";
import { registerDeployErc721Tools } from "./deployERC721.js";
import { registerYeiFinanceTools } from "./yeifinance.js";
import { registerSymphonyTools } from "./symphony.js";
import { registerDebridgeTools } from "./deBridge.js";
import { registerCitrexTools } from "./citrex.js";
import { registerLifiTools } from "./lifi.js";
import { registerKameTools } from "./kame_ag.js";
import { registerOpenSeaTools } from "./opensea.js";
import { registerHiveIntelligenceTools } from "./hive_intelligence.js";

/**
 * Register all tools with the MCP server by calling the registration functions
 * from each modularized tool file.
 *
 * @param server The MCP server instance
 */
export function registerAllTools(server: McpServer) {
  registerNetworkTools(server);
  registerTokenTools(server);
  registerDragonSwapTools(server);
  registerCoinGeckoTools(server);
  registerDexScreenerTools(server);
  registerSeiTraceTools(server);
  registerDeployErc20Tools(server);
  registerDeployErc721Tools(server);
  registerYeiFinanceTools(server);
  registerSymphonyTools(server);
  registerDebridgeTools(server);
  registerCitrexTools(server);
  registerLifiTools(server);
  registerKameTools(server);
  registerOpenSeaTools(server);
  registerHiveIntelligenceTools(server);
}

