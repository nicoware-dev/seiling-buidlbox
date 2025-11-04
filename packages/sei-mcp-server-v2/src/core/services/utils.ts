import {
    parseEther,
    type Address
} from 'viem';

/**
 * Utility functions for formatting and parsing values
 */
export const utils = {
    // Convert ether to wei
    parseEther,

    // Format an object to JSON with bigint handling
    formatJson: (obj: unknown): string => JSON.stringify(obj, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2),

    validateAddress: (address: string): Address => {
        // If it's already a valid Sei 0x address (0x followed by 40 hex chars), return it
        if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return address as Address;
        }

        throw new Error(`Invalid address: ${address}`);
    }
};

// Common token addresses on Sei EVM (override via env if needed)
// Defaults are zero addresses to ensure safe compilation when unknown.
export const COMMON_TOKENS: { WSEI: Address; USDC: Address } = {
    WSEI: (process.env.WSEI_ADDRESS as Address) || '0x0000000000000000000000000000000000000000',
    USDC: (process.env.USDC_ADDRESS as Address) || '0x0000000000000000000000000000000000000000',
};

// DragonSwap core contract addresses (override via env)
export const DRAGONSWAP_ADDRESSES: {
    quoter: Address;
    swapRouter: Address;
    positionManager: Address;
    factory: Address;
} = {
    quoter: (process.env.DRAGONSWAP_QUOTER as Address) || '0x0000000000000000000000000000000000000000',
    swapRouter: (process.env.DRAGONSWAP_SWAP_ROUTER as Address) || '0x0000000000000000000000000000000000000000',
    positionManager: (process.env.DRAGONSWAP_POSITION_MANAGER as Address) || '0x0000000000000000000000000000000000000000',
    factory: (process.env.DRAGONSWAP_FACTORY as Address) || '0x0000000000000000000000000000000000000000',
};

// Yei Finance contract addresses (override via env)
export const YEI_ADDRESSES: Record<string, Address> = {
    UiPoolDataProviderV3: (process.env.YEI_UIPOOL_DATA_PROVIDER_V3 as Address) || '0x0000000000000000000000000000000000000000',
    PoolAddressesProvider: (process.env.YEI_POOL_ADDRESSES_PROVIDER as Address) || '0x0000000000000000000000000000000000000000',
    Pool: (process.env.YEI_POOL as Address) || '0x0000000000000000000000000000000000000000',
    WrappedTokenGatewayV3: (process.env.YEI_WRAPPED_TOKEN_GATEWAY_V3 as Address) || '0x0000000000000000000000000000000000000000',
};

// Yei Finance common tokens
export const YEI_TOKENS: Record<string, Address> = {
    WSEI: (process.env.WSEI_ADDRESS as Address) || '0x0000000000000000000000000000000000000000',
};

// Block explorer verification API endpoints (Etherscan-compatible)
export const VERIFICATION_APIS: Record<string, { url: string; apiUrl: string; explorerUrl: string }> = {
    'sei': {
        url: process.env.SEI_EXPLORER_API_URL || 'https://seitrace.com/api',
        apiUrl: process.env.SEI_EXPLORER_API_URL || 'https://seitrace.com/api',
        explorerUrl: process.env.SEI_EXPLORER_URL || 'https://seitrace.com',
    },
    'sei-testnet': {
        url: process.env.SEI_TESTNET_EXPLORER_API_URL || 'https://seitrace.com/api',
        apiUrl: process.env.SEI_TESTNET_EXPLORER_API_URL || 'https://seitrace.com/api',
        explorerUrl: process.env.SEI_TESTNET_EXPLORER_URL || 'https://seitrace.com',
    },
    'sei-devnet': {
        url: process.env.SEI_DEVNET_EXPLORER_API_URL || 'https://seitrace.com/api',
        apiUrl: process.env.SEI_DEVNET_EXPLORER_API_URL || 'https://seitrace.com/api',
        explorerUrl: process.env.SEI_DEVNET_EXPLORER_URL || 'https://seitrace.com',
    },
};

// Minimal source code stubs for verification payloads (compile-time placeholders)
export const ERC20_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ERC20Contract {
    string public name; string public symbol; uint8 public decimals; uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf; mapping(address=>mapping(address=>uint256)) public allowance;
    event Transfer(address indexed from,address indexed to,uint256 value);
    event Approval(address indexed owner,address indexed spender,uint256 value);
    constructor(string memory _n,string memory _s,uint256 _supply,uint8 _d){name=_n;symbol=_s;decimals=_d;totalSupply=_supply;balanceOf[msg.sender]=_supply;emit Transfer(address(0),msg.sender,_supply);}    
    function transfer(address to,uint256 amount) external returns(bool){require(balanceOf[msg.sender]>=amount,"bal");balanceOf[msg.sender]-=amount;balanceOf[to]+=amount;emit Transfer(msg.sender,to,amount);return true;}
    function approve(address sp,uint256 amount) external returns(bool){allowance[msg.sender][sp]=amount;emit Approval(msg.sender,sp,amount);return true;}
    function transferFrom(address from,address to,uint256 amount) external returns(bool){uint256 a=allowance[from][msg.sender];require(a>=amount && balanceOf[from]>=amount,"allow");allowance[from][msg.sender]=a-amount;balanceOf[from]-=amount;balanceOf[to]+=amount;emit Transfer(from,to,amount);return true;}
}`;

export const ERC721_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BasicERC721 {
    string public name; string public symbol; string public baseURI; uint256 public nextId;
    mapping(uint256=>address) public ownerOf; mapping(address=>uint256) public balanceOf;
    event Transfer(address indexed from,address indexed to,uint256 indexed tokenId);
    constructor(string memory _n,string memory _s,string memory _b){name=_n;symbol=_s;baseURI=_b;}
    function mint(address to) external { uint256 id=++nextId; ownerOf[id]=to; balanceOf[to]+=1; emit Transfer(address(0),to,id);}    
    function mintBatch(address to,uint256 qty) external { for(uint256 i=0;i<qty;i++){ uint256 id=++nextId; ownerOf[id]=to; balanceOf[to]+=1; emit Transfer(address(0),to,id);} }
}`;