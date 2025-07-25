import { WalletClient, PublicClient, Address } from "viem";

// Actual addresses for Yei Finance (use the proxy, not the implementation)
export const YEI_CONTRACTS = {
  // Main pool (PROXY, the one to use for supply/borrow)
  POOL_PROXY: "0x4a4d9abD36F923cBA0Af62A39C01dEC2944fb638",
  POOL_ADDRESSES_PROVIDER: "0x5C57266688A4aD1d3aB61209ebcb967B84227642",
  POOL_DATA_PROVIDER: "0x60c82A40C57736a9c692C42e87A8849Fb407F0d6",
  
  // Supported tokens
  TOKENS: {
    USDC: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1",
    USDT: "0xB75D0B03c06A926e488e2659DF1A861F860bD3d1", 
    WSEI: "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"
  },
  
  // ATokens
  ATOKENS: {
    USDC: "0xc1a6F27a4CcbABB1C2b1F8E98478e52d3D3cB935",
    USDT: "0x945C042a18A90Dd7adb88922387D12EfE32F4171",
    WSEI: "0x809FF4801aA5bDb33045d1fEC810D082490D63a4"
  },
  
  // Variable Debt Tokens
  VARIABLE_DEBT_TOKENS: {
    USDC: "0x5Bfc2d187e8c7F51BE6d547B43A1b3160D72a142",
    USDT: "0x25eA70DC3332b9960E1284D57ED2f6A90d4a8373", 
    WSEI: "0x648e683aaE7C18132564F8B48C625aE5038A9607"
  },
  
  // Stable Debt Tokens
  STABLE_DEBT_TOKENS: {
    USDC: "0xe8348837A3be3212E50F030DFf935Ae0A0eA4B54",
    USDT: "0x04Ba7e1387dcBE7e1fC43Dc8dE5dE8A73a77b1ee",
    WSEI: "0x4dE99D1f91A1d731966fa250b432fF17C9C234d9"
  }
};

// ABI for the Yei Pool (actual implementation, main functions)
export const YEI_POOL_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" },
      { "internalType": "uint16", "name": "referralCode", "type": "uint16" }
    ],
    "name": "supply",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // --- ADDED: borrow function ---
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRateMode", "type": "uint256" },
      { "internalType": "uint16", "name": "referralCode", "type": "uint16" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" }
    ],
    "name": "borrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // --- END ADDED ---
  // --- ADDED: repay function ---
  {
    "inputs": [
      { "internalType": "address", "name": "asset", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "interestRateMode", "type": "uint256" },
      { "internalType": "address", "name": "onBehalfOf", "type": "address" }
    ],
    "name": "repay",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // --- END ADDED ---
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserAccountData",
    "outputs": [
      { "internalType": "uint256", "name": "totalCollateralBase", "type": "uint256" },
      { "internalType": "uint256", "name": "totalDebtBase", "type": "uint256" },
      { "internalType": "uint256", "name": "availableBorrowsBase", "type": "uint256" },
      { "internalType": "uint256", "name": "currentLiquidationThreshold", "type": "uint256" },
      { "internalType": "uint256", "name": "ltv", "type": "uint256" },
      { "internalType": "uint256", "name": "healthFactor", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
  // You can add other main functions here if needed
];

/**
 * Helper to get an instance of the Yei Pool contract
 * @param signer - WalletClient from viem
 * @returns Pool contract instance
 */
export function getYeiPoolContract(signer: WalletClient) {
  return {
    address: YEI_CONTRACTS.POOL_PROXY as Address,
    abi: YEI_POOL_ABI,
  };
}

/**
 * Helper to get an instance of the Yei PoolDataProvider
 * @param provider - PublicClient from viem
 * @returns PoolDataProvider contract instance
 */
export function getYeiPoolDataProvider(provider: PublicClient) {
  const POOL_DATA_PROVIDER_ABI = [
    "function getReserveData(address asset) external view returns (tuple(uint256 configuration, uint256 liquidityIndex, uint256 variableBorrowIndex, uint256 currentLiquidityRate, uint256 currentVariableBorrowRate, uint256 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 decimals))",
    "function getUserReserveData(address asset, address user) external view returns (uint256 currentATokenBalance, uint256 currentStableDebt, uint256 currentVariableDebt, uint256 principalStableDebt, uint256 scaledVariableDebt, uint256 stableBorrowRate, uint256 liquidityRate, uint40 stableRateLastUpdated, bool usageAsCollateralEnabled)"
  ] as const;
  
  return {
    address: YEI_CONTRACTS.POOL_DATA_PROVIDER as Address,
    abi: POOL_DATA_PROVIDER_ABI,
  };
} 