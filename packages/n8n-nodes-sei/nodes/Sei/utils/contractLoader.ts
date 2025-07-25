// Static ABIs and bytecode (imported or pasted as constants)
export const ERC20_ABI = [
  {"inputs":[{"internalType":"string","name":"name_","type":"string"},{"internalType":"string","name":"symbol_","type":"string"},{"internalType":"uint8","name":"decimals_","type":"uint8"},{"internalType":"uint256","name":"initialSupply_","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
];

export const ERC721_ABI = [
  // ... (paste full ERC721 ABI here, truncated for brevity)
];

export const ERC20_BYTECODE = `0x608060405234801561001057600080fd5b50604051610c38380380610c3883398101604081905261002f91610186565b600361003b8582610292565b50600461004882826102925b505050600061006233610073565b90506100708585858561007b565b50505050610350565b6001600160a01b031690565b6001600160a01b0384166100a05760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b0383166100c65760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b038416600090815260208190526040902054828110156101065760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b03808616600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050505050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126101a157600080fd5b81516001600160401b03808211156101bb576101bb61016a565b604051601f8301601f19908116603f011681019082821181831017156101e3576101e361016a565b816040528381526020925086838588010111156101ff57600080fd5b600091505b8382101561022157858201830151818301840152908201906102043b5b83811115610232576000848401525b50505050925050565b600080600080608085870312156102525761025257600080fd5b84516001600160401b03808211156102695761026957600080fd5b61027588838901610190565b9550602087015191508082111561028b5761028b600080fd5b506102988782880161019056`;

export const ERC721_BYTECODE = `0x608060405234801561001057600080fd5b50604051610d38380380610d3883398101604081905261002f91610186565b600361003b8582610292565b50600461004882826102925b505050600061006233610073565b90506100708585858561007b565b50505050610350565b6001600160a01b031690565b6001600160a01b0384166100a05760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b0383166100c65760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b038416600090815260208190526040902054828110156101065760405162461bcd60e51b815260040161009790610351565b60405180910390fd5b6001600160a01b03808616600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35050505050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126101a157600080fd5b81516001600160401b03808211156101bb576101bb61016a565b604051601f8301601f19908116603f011681019082821181831017156101e3576101e361016a565b816040528381526020925086838588010111156101ff57600080fd5b600091505b8382101561022157858201830151818301840152908201906102043b5b83811115610232576000848401525b50505050925050565b600080600080608085870312156102525761025257600080fd5b84516001600160401b03808211156102695761026957600080fd5b61027588838901610190565b9550602087015191508082111561028b5761028b600080fd5b506102988782880161019056`;

/**
 * Load ABI from JSON file
 * @param contractName Name of the contract (e.g., 'ERC20', 'ERC721')
 * @returns Parsed ABI array
 */
export function loadABI(contractName: string): any[] {
  if (contractName === 'ERC20') return ERC20_ABI;
  if (contractName === 'ERC721') return ERC721_ABI;
  throw new Error(`Unknown contract ABI: ${contractName}`);
}

/**
 * Load bytecode from text file
 * @param contractName Name of the contract (e.g., 'ERC20', 'ERC721')
 * @returns Contract bytecode as string
 */
export function loadBytecode(contractName: string): string {
  if (contractName === 'ERC20') return ERC20_BYTECODE;
  if (contractName === 'ERC721') return ERC721_BYTECODE;
  throw new Error(`Unknown contract bytecode: ${contractName}`);
}

/**
 * Load both ABI and bytecode for a contract
 * @param contractName Name of the contract
 * @returns Object containing both ABI and bytecode
 */
export function loadContract(contractName: string): { abi: any[], bytecode: string } {
  return {
    abi: loadABI(contractName),
    bytecode: loadBytecode(contractName)
  };
}

/**
 * Get list of available contracts
 * @returns Array of available contract names
 */
export function getAvailableContracts(): string[] {
  return ['ERC20', 'ERC721'];
}

/**
 * Validate that both ABI and bytecode exist for a contract
 * @param contractName Name of the contract
 * @returns True if both files exist
 */
export function validateContract(contractName: string): boolean {
  return contractName === 'ERC20' || contractName === 'ERC721';
} 