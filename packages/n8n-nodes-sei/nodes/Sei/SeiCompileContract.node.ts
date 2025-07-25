import { IExecuteFunctions, INodeType, INodeExecutionData, INodeTypeDescription } from 'n8n-workflow';
import * as solc from 'solc';
import { NodeOperationError } from 'n8n-workflow';

export class SeiCompileContract implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei: Compile Contract',
    name: 'seiCompileContract',
    icon: 'file:SeiCompileContract.svg',
    group: ['transform', 'output'],
    version: 1,
    description: 'Compile Solidity source code to bytecode and ABI',
    defaults: {
      name: 'Compile Contract',
    },
    inputs: ['main'] as any,
    outputs: ['main'] as any,
    credentials: [],
    properties: [
      {
        displayName: 'Solidity Source Code',
        name: 'sourceCode',
        type: 'string',
        typeOptions: {
          rows: 20,
        },
        default: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    string public name;
    
    constructor(string memory _name) {
        name = _name;
    }
    
    function setName(string memory _name) public {
        name = _name;
    }
}`,
        description: 'Solidity source code to compile',
      },
      {
        displayName: 'Contract Name',
        name: 'contractName',
        type: 'string',
        default: 'MyContract',
        description: 'Name of the contract to compile (if multiple contracts in source)',
      },
      {
        displayName: 'Compiler Version',
        name: 'compilerVersion',
        type: 'options',
        options: [
          { name: '0.8.19', value: '0.8.19' },
          { name: '0.8.20', value: '0.8.20' },
          { name: '0.8.21', value: '0.8.21' },
          { name: '0.8.22', value: '0.8.22' },
          { name: '0.8.23', value: '0.8.23' },
          { name: '0.8.24', value: '0.8.24' },
        ],
        default: '0.8.19',
        description: 'Solidity compiler version to use',
      },
      {
        displayName: 'Enable Optimization',
        name: 'optimization',
        type: 'boolean',
        default: true,
        description: 'Whether to enable compiler optimization',
      },
      {
        displayName: 'Optimization Runs',
        name: 'optimizationRuns',
        type: 'number',
        default: 200,
        description: 'Number of optimization runs',
        displayOptions: {
          show: {
            optimization: [true],
          },
        },
      },
      {
        displayName: 'Include Templates',
        name: 'includeTemplates',
        type: 'boolean',
        default: false,
        description: 'Whether to load and use contract templates',
      },
      {
        displayName: 'Template Type',
        name: 'templateType',
        type: 'options',
        options: [
          { name: 'ERC-20 Token', value: 'ERC20' },
          { name: 'ERC-721 NFT', value: 'ERC721' },
        ],
        default: 'ERC20',
        description: 'Contract template to use',
        displayOptions: {
          show: {
            includeTemplates: [true],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Local function to get contract templates
    const getTemplate = (templateType: string): string => {
      if (templateType === 'ERC20') {
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 initialSupply_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = initialSupply_ * 10**decimals_;
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function name() public view returns (string memory) { return _name; }
    function symbol() public view returns (string memory) { return _symbol; }
    function decimals() public view returns (uint8) { return _decimals; }
    function totalSupply() public view returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view returns (uint256) { return _balances[account]; }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        _transfer(from, to, amount);
        _approve(from, msg.sender, currentAllowance - amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0) && to != address(0), "ERC20: zero address");
        require(_balances[from] >= amount, "ERC20: insufficient balance");
        _balances[from] -= amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0) && spender != address(0), "ERC20: zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}`;
      }

      if (templateType === 'ERC721') {
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicERC721 {
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    string private _name;
    string private _symbol;
    uint256 private _currentTokenId = 1;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view returns (string memory) { return _name; }
    function symbol() public view returns (string memory) { return _symbol; }
    function balanceOf(address owner) public view returns (uint256) { return _balances[owner]; }
    function ownerOf(uint256 tokenId) public view returns (address) { return _owners[tokenId]; }

    function mint(address to) public returns (uint256) {
        uint256 tokenId = _currentTokenId++;
        _owners[tokenId] = to;
        _balances[to]++;
        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "Not owner");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(msg.sender == from || _tokenApprovals[tokenId] == msg.sender, "Not authorized");
        _owners[tokenId] = to;
        _balances[from]--;
        _balances[to]++;
        delete _tokenApprovals[tokenId];
        emit Transfer(from, to, tokenId);
    }
}`;
      }

      throw new NodeOperationError(this.getNode(), `Unknown template type: ${templateType}`);
    };

    for (let i = 0; i < items.length; i++) {
      let sourceCode = this.getNodeParameter('sourceCode', i) as string;
      const contractName = this.getNodeParameter('contractName', i) as string;
      const compilerVersion = this.getNodeParameter('compilerVersion', i) as string;
      const optimization = this.getNodeParameter('optimization', i) as boolean;
      const optimizationRuns = this.getNodeParameter('optimizationRuns', i, 200) as number;
      const includeTemplates = this.getNodeParameter('includeTemplates', i) as boolean;
      const templateType = this.getNodeParameter('templateType', i, 'ERC20') as string;

      try {
        // Load template if requested
        if (includeTemplates) {
          sourceCode = getTemplate(templateType);
        }

        // Prepare compilation input
        const input = {
          language: 'Solidity',
          sources: {
            'contract.sol': {
              content: sourceCode,
            },
          },
          settings: {
            outputSelection: {
              '*': {
                '*': ['abi', 'evm.bytecode'],
              },
            },
            optimizer: {
              enabled: optimization,
              runs: optimizationRuns,
            },
          },
        };

        // Compile the contract
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // Check for compilation errors
        if (output.errors) {
          const errors = output.errors.filter((error: any) => error.severity === 'error');
          const warnings = output.errors.filter((error: any) => error.severity === 'warning');
          
          if (errors.length > 0) {
            returnData.push({
              json: {
                success: false,
                errors: errors.map((error: any) => error.formattedMessage),
                warnings: warnings.map((warning: any) => warning.formattedMessage),
                contractName,
                compilerVersion,
                timestamp: new Date().toISOString(),
              },
            } as INodeExecutionData);
            continue;
          }
        }

        // Extract compiled contract
        const contracts = output.contracts['contract.sol'];
        if (!contracts || !contracts[contractName]) {
          returnData.push({
            json: {
              success: false,
              error: `Contract '${contractName}' not found in compiled output`,
              availableContracts: Object.keys(contracts || {}),
              contractName,
              compilerVersion,
              timestamp: new Date().toISOString(),
            },
          } as INodeExecutionData);
          continue;
        }

        const contract = contracts[contractName];
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;

        // Extract constructor ABI
        const constructorAbi = abi.find((item: any) => item.type === 'constructor');

        returnData.push({
          json: {
            success: true,
            contractName,
            bytecode: bytecode.startsWith('0x') ? bytecode : '0x' + bytecode,
            abi,
            constructorAbi,
            metadata: {
              compilerVersion,
              optimization,
              optimizationRuns,
              sourceCode: includeTemplates ? `Template: ${templateType}` : 'Custom',
            },
            warnings: output.errors ? output.errors
              .filter((error: any) => error.severity === 'warning')
              .map((warning: any) => warning.formattedMessage) : [],
            timestamp: new Date().toISOString(),
          },
        } as INodeExecutionData);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
        returnData.push({
          json: {
            success: false,
            error: errorMessage,
            contractName,
            compilerVersion,
            timestamp: new Date().toISOString(),
          },
        } as INodeExecutionData);
      }
    }

    return [returnData];
  }
} 