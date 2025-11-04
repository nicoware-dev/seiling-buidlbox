// ERC20 ABI for token operations
export const erc20Abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string"
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "_totalSupply",
        type: "uint256"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256"
      }
    ],
    name: "ERC20InsufficientAllowance",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256"
      }
    ],
    name: "ERC20InsufficientBalance",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address"
      }
    ],
    name: "ERC20InvalidApprover",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address"
      }
    ],
    name: "ERC20InvalidReceiver",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address"
      }
    ],
    name: "ERC20InvalidSender",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "ERC20InvalidSpender",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

// ERC20 ABI for Token Deployment
export const erc20DeployAbi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "decimalsValue",
				"type": "uint8"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const

export const ERC20_BYTECODE =
  "0x60a06040523480156200001157600080fd5b50604051620010e9380380620010e9833981016040819052620000349162000354565b338484600362000045838262000470565b50600462000054828262000470565b5050506001600160a01b0381166200008757604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b6200009281620000cc565b5060ff81166080819052620000c2903390620000b090600a62000651565b620000bc908562000669565b6200011e565b5050505062000699565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0382166200014a5760405163ec442f0560e01b8152600060048201526024016200007e565b62000158600083836200015c565b5050565b6001600160a01b0383166200018b5780600260008282546200017f919062000683565b90915550620001ff9050565b6001600160a01b03831660009081526020819052604090205481811015620001e05760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016200007e565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166200021d576002805482900390556200023c565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516200028291815260200190565b60405180910390a3505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620002b757600080fd5b81516001600160401b0380821115620002d457620002d46200028f565b604051601f8301601f19908116603f01168101908282118183101715620002ff57620002ff6200028f565b816040528381526020925086838588010111156200031c57600080fd5b600091505b8382101562000340578582018301518183018401529082019062000321565b600093810190920192909252949350505050565b600080600080608085870312156200036b57600080fd5b84516001600160401b03808211156200038357600080fd5b6200039188838901620002a5565b95506020870151915080821115620003a857600080fd5b50620003b787828801620002a5565b93505060408501519150606085015160ff81168114620003d657600080fd5b939692955090935050565b600181811c90821680620003f657607f821691505b6020821081036200041757634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200046b57600081815260208120601f850160051c81016020861015620004465750805b601f850160051c820191505b81811015620004675782815560010162000452565b5050505b505050565b81516001600160401b038111156200048c576200048c6200028f565b620004a4816200049d8454620003e1565b846200041d565b602080601f831160018114620004dc5760008415620004c35750858301515b600019600386901b1c1916600185901b17855562000467565b600085815260208120601f198616915b828110156200050d57888601518255948401946001909101908401620004ec565b50858210156200052c5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b600181815b80851115620005935781600019048211156200057757620005776200053c565b808516156200058557918102915b93841c939080029062000557565b509250929050565b600082620005ac575060016200064b565b81620005bb575060006200064b565b8160018114620005d45760028114620005df57620005ff565b60019150506200064b565b60ff841115620005f357620005f36200053c565b50506001821b6200064b565b5060208310610133831016604e8410600b841016171562000624575081810a6200064b565b62000630838362000552565b80600019048211156200064757620006476200053c565b0290505b92915050565b60006200066260ff8416836200059b565b9392505050565b80820281158282048414176200064b576200064b6200053c565b808201808211156200064b576200064b6200053c565b608051610a2d620006bc6000396000818161014101526103140152610a2d6000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c806370a082311161008c57806395d89b411161006657806395d89b41146101cc578063a9059cbb146101d4578063dd62ed3e146101e7578063f2fde38b1461022057600080fd5b806370a0823114610180578063715018a6146101a95780638da5cb5b146101b157600080fd5b806306fdde03146100d4578063095ea7b3146100f257806318160ddd1461011557806323b872dd14610127578063313ce5671461013a57806340c10f191461016b575b600080fd5b6100dc610233565b6040516100e99190610765565b60405180910390f35b6101056101003660046107cf565b6102c5565b60405190151581526020016100e9565b6002545b6040519081526020016100e9565b6101056101353660046107f9565b6102df565b60405160ff7f00000000000000000000000000000000000000000000000000000000000000001681526020016100e9565b61017e6101793660046107cf565b610303565b005b61011961018e366004610835565b6001600160a01b031660009081526020819052604090205490565b61017e61034d565b6005546040516001600160a01b0390911681526020016100e9565b6100dc610361565b6101056101e23660046107cf565b610370565b6101196101f5366004610857565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b61017e61022e366004610835565b61037e565b6060600380546102429061088a565b80601f016020809104026020016040519081016040528092919081815260200182805461026e9061088a565b80156102bb5780601f10610290576101008083540402835291602001916102bb565b820191906000526020600020905b81548152906001019060200180831161029e57829003601f168201915b5050505050905090565b6000336102d38185856103c1565b60019150505b92915050565b6000336102ed8582856103d3565b6102f8858585610452565b506001949350505050565b61030b6104b1565b6103498261033a7f0000000000000000000000000000000000000000000000000000000000000000600a6109be565b61034490846109cd565b6104de565b5050565b6103556104b1565b61035f6000610514565b565b6060600480546102429061088a565b6000336102d3818585610452565b6103866104b1565b6001600160a01b0381166103b557604051631e4fbdf760e01b8152600060048201526024015b60405180910390fd5b6103be81610514565b50565b6103ce8383836001610566565b505050565b6001600160a01b0383811660009081526001602090815260408083209386168352929052205460001981101561044c578181101561043d57604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064016103ac565b61044c84848484036000610566565b50505050565b6001600160a01b03831661047c57604051634b637e8f60e11b8152600060048201526024016103ac565b6001600160a01b0382166104a65760405163ec442f0560e01b8152600060048201526024016103ac565b6103ce83838361063b565b6005546001600160a01b0316331461035f5760405163118cdaa760e01b81523360048201526024016103ac565b6001600160a01b0382166105085760405163ec442f0560e01b8152600060048201526024016103ac565b6103496000838361063b565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001600160a01b0384166105905760405163e602df0560e01b8152600060048201526024016103ac565b6001600160a01b0383166105ba57604051634a1406b160e11b8152600060048201526024016103ac565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561044c57826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161062d91815260200190565b60405180910390a350505050565b6001600160a01b03831661066657806002600082825461065b91906109e4565b909155506106d89050565b6001600160a01b038316600090815260208190526040902054818110156106b95760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016103ac565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b0382166106f457600280548290039055610713565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161075891815260200190565b60405180910390a3505050565b600060208083528351808285015260005b8181101561079257858101830151858201604001528201610776565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146107ca57600080fd5b919050565b600080604083850312156107e257600080fd5b6107eb836107b3565b946020939093013593505050565b60008060006060848603121561080e57600080fd5b610817846107b3565b9250610825602085016107b3565b9150604084013590509250925092565b60006020828403121561084757600080fd5b610850826107b3565b9392505050565b6000806040838503121561086a57600080fd5b610873836107b3565b9150610881602084016107b3565b90509250929050565b600181811c9082168061089e57607f821691505b6020821081036108be57634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b600181815b808511156109155781600019048211156108fb576108fb6108c4565b8085161561090857918102915b93841c93908002906108df565b509250929050565b60008261092c575060016102d9565b81610939575060006102d9565b816001811461094f576002811461095957610975565b60019150506102d9565b60ff84111561096a5761096a6108c4565b50506001821b6102d9565b5060208310610133831016604e8410600b8410161715610998575081810a6102d9565b6109a283836108da565b80600019048211156109b6576109b66108c4565b029392505050565b600061085060ff84168361091d565b80820281158282048414176102d9576102d96108c4565b808201808211156102d9576102d96108c456fea2646970667358221220735a5c2dd62151d9bd196dc3502290125a9455d018a9a36fbf6813cdf3e48a8f64736f6c63430008140033"