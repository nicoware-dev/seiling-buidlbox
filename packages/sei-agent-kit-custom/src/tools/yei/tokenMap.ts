import { YEI_CONTRACTS } from "./abi/pool";

/**
 * Mapping of tokens supported by Yei Finance
 * Actual addresses of the Yei protocol
 */
export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  aTokenAddress: string;
  variableDebtTokenAddress: string;
  stableDebtTokenAddress: string;
}

export const YEI_TOKEN_MAP: Record<string, TokenInfo> = {
  "USDC": {
    symbol: "USDC",
    address: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1",
    decimals: 6,
    name: "USD Coin",
    aTokenAddress: "0xc1a6F27a4CcbABB1C2b1F8E98478e52d3D3cB935",
    variableDebtTokenAddress: "0x5Bfc2d187e8c7F51BE6d547B43A1b3160D72a142",
    stableDebtTokenAddress: "0xe8348837A3be3212e50f030dff935ae0a0ea4b54"
  },
  "USDT": {
    symbol: "USDT",
    address: "0xB75D0B03c06A926e488e2659DF1A861F860bD3d1",
    decimals: 6,
    name: "Tether USD",
    aTokenAddress: "0x945C042a18A90Dd7adb88922387D12EfE32F4171",
    variableDebtTokenAddress: "0x25eA70DC3332b9960E1284D57ED2f6A90d4a8373",
    stableDebtTokenAddress: "0x04Ba7e1387dcBE7e1fC43Dc8dE5dE8A73a77b1ee"
  },
  "ISEI": {
    symbol: "ISEI",
    address: "0x5cf6826140c1c56ff49c808a1a75407cd1df9423",
    decimals: 6,
    name: "Interest SEI",
    aTokenAddress: "0x160345fc359604fc6e70e3c5facbde5f7a9342d8",
    variableDebtTokenAddress: "0x43edd7f3831b08fe70b7555ddd373c8bf65a9050",
    stableDebtTokenAddress: "0x43edd7f3831b08fe70b7555ddd373c8bf65a9050"
  },
  "WSEI": {
    symbol: "WSEI",
    address: "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7",
    decimals: 18,
    name: "Wrapped SEI",
    aTokenAddress: "0x809FF4801aA5bDb33045d1fEC810D082490D63a4",
    variableDebtTokenAddress: "0x648e683aaE7C18132564F8B48C625aE5038A9607",
    stableDebtTokenAddress: "0x4dE99D1f91A1d731966fa250b432fF17C9C234d9"
  },
  "WETH": {
    symbol: "WETH",
    address: "0x160345fc359604fc6e70e3c5facbde5f7a9342d8",
    decimals: 18,
    name: "Wrapped Ether",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "WBTC": {
    symbol: "WBTC",
    address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c",
    decimals: 8,
    name: "Wrapped Bitcoin",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "wstETH": {
    symbol: "wstETH",
    address: "0xbe574b6219c6d985d08712e90c21a88fd55f1",
    decimals: 18,
    name: "Wrapped stETH",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "fastUSD": {
    symbol: "fastUSD",
    address: "0x37a4dd9ced2b19cfe8fac251cd727b5787e45269",
    decimals: 18,
    name: "Fast USD",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "sfastUSD": {
    symbol: "sfastUSD",
    address: "0xdf77686d99667ae56bc18f539b777dbc2bbe3e9f",
    decimals: 18,
    name: "Staked Fast USD",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "sfrxETH": {
    symbol: "sfrxETH",
    address: "0x3ec3849c33291a9ef4c5db86de593eb4a37fde45",
    decimals: 18,
    name: "Staked frxETH",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "frxUSD": {
    symbol: "frxUSD",
    address: "0x80eede496655fb9047dd39d9f418d5483ed600df",
    decimals: 18,
    name: "Frax USD",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "sfrxUSD": {
    symbol: "sfrxUSD",
    address: "0x5bff88ca1442c2496f7e475e9e7786383bc070c0",
    decimals: 18,
    name: "Staked frxUSD",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  },
  "frxETH": {
    symbol: "frxETH",
    address: "0x43edd7f3831b08fe70b7555ddd373c8bf65a9050",
    decimals: 18,
    name: "Frax ETH",
    aTokenAddress: "",
    variableDebtTokenAddress: "",
    stableDebtTokenAddress: ""
  }
};

/**
 * Get token information by symbol
 * @param symbol - Token symbol (e.g., "USDC", "WSEI")
 * @returns Token information or undefined if it does not exist
 */
export function getTokenInfo(symbol: string): TokenInfo | undefined {
  return YEI_TOKEN_MAP[symbol.toUpperCase()];
}

/**
 * Get token information by address
 * @param address - Token address
 * @returns Token information or undefined if it does not exist
 */
export function getTokenInfoByAddress(address: string): TokenInfo | undefined {
  return Object.values(YEI_TOKEN_MAP).find(
    token => token.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * List of supported token symbols
 */
export const SUPPORTED_TOKENS = Object.keys(YEI_TOKEN_MAP);

/**
 * Get the aToken address for a base token
 * @param symbol - Base token symbol
 * @returns aToken address or undefined if it does not exist
 */
export function getATokenAddress(symbol: string): string | undefined {
  const tokenInfo = getTokenInfo(symbol);
  return tokenInfo?.aTokenAddress;
}

/**
 * Get the variable debt token address for a base token
 * @param symbol - Base token symbol
 * @returns Variable debt token address or undefined if it does not exist
 */
export function getVariableDebtTokenAddress(symbol: string): string | undefined {
  const tokenInfo = getTokenInfo(symbol);
  return tokenInfo?.variableDebtTokenAddress;
}

/**
 * Get the stable debt token address for a base token
 * @param symbol - Base token symbol
 * @returns Stable debt token address or undefined if it does not exist
 */
export function getStableDebtTokenAddress(symbol: string): string | undefined {
  const tokenInfo = getTokenInfo(symbol);
  return tokenInfo?.stableDebtTokenAddress;
}
