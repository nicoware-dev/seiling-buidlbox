/**
 * ABI Loader utility
 * Loads ABIs from sei-agent-kit-custom tools
 */

// In-memory ABI cache
const abiCache: Map<string, any> = new Map();

/**
 * Loads an ABI from sei-agent-kit-custom tools
 * @param path - Path to ABI (e.g., 'yei/abi/pool', 'takara/abi/mint/t_Tokenabi')
 * @returns ABI array or null if not found
 */
export function loadABI(path: string): any[] | null {
  // Check cache first
  if (abiCache.has(path)) {
    return abiCache.get(path);
  }

  try {
    // Try to load from sei-agent-kit-custom
    const abiModule = require(`@sei-agent-kit-custom/tools/${path}`);
    
    // Handle different export patterns
    let abi: any = null;
    if (abiModule.default) {
      abi = abiModule.default;
    } else if (abiModule.abi) {
      abi = abiModule.abi;
    } else if (Array.isArray(abiModule)) {
      abi = abiModule;
    } else if (typeof abiModule === 'object' && !Array.isArray(abiModule)) {
      // Try to find ABI in object
      abi = abiModule.ABI || abiModule[Object.keys(abiModule)[0]];
    }

    if (abi && Array.isArray(abi)) {
      abiCache.set(path, abi);
      return abi;
    }

    return null;
  } catch (error) {
    console.warn(`Failed to load ABI from ${path}: ${error}`);
    return null;
  }
}

/**
 * Loads Yei Finance pool ABI
 */
export function loadYeiPoolABI(): any[] | null {
  return loadABI('yei/abi/pool');
}

/**
 * Loads Yei Finance aToken ABI
 */
export function loadYeiATokenABI(): any[] | null {
  return loadABI('yei/abi/atoken');
}

/**
 * Loads Yei Finance ERC20 ABI
 */
export function loadYeiERC20ABI(): any[] | null {
  return loadABI('yei/abi/erc20');
}

/**
 * Loads Takara Protocol tToken ABI (for mint)
 */
export function loadTakaraTTokenABI(): any[] | null {
  return loadABI('takara/abi/mint/t_Tokenabi');
}

/**
 * Loads Takara Protocol controller ABI (for borrow)
 */
export function loadTakaraControllerABI(): any[] | null {
  return loadABI('takara/abi/borrow/controllerabi');
}

/**
 * Loads standard ERC20 ABI
 */
export function loadERC20ABI(): any[] | null {
  // Try to load from sei-agent-kit-custom first
  const abi = loadABI('yei/abi/erc20') || loadABI('sei-erc20');
  
  // Fallback to standard ERC20 ABI if not found
  if (!abi) {
    return [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
  }
  
  return abi;
}

/**
 * Loads standard ERC721 ABI
 */
export function loadERC721ABI(): any[] | null {
  // Try to load from sei-agent-kit-custom first
  const abi = loadABI('sei-erc721');
  
  // Fallback to standard ERC721 ABI if not found
  if (!abi) {
    return [
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { name: 'to', type: 'address' }, 
          { name: 'tokenId', type: 'uint256' }
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
  }
  
  return abi;
}

