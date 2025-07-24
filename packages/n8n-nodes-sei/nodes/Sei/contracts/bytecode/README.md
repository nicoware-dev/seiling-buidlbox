# Contract Bytecode

This directory contains compiled bytecode for standard smart contracts used by the Sei n8n nodes.

## Files

- `ERC20.bytecode.txt` - Compiled bytecode for a basic ERC-20 token contract
- `ERC721.bytecode.txt` - Compiled bytecode for a basic ERC-721 NFT contract

## Usage

These bytecode files are automatically loaded by the Deploy Contract node when deploying standard contract types. The bytecode is paired with the corresponding ABI files in the `../abis/` directory.

## Compilation Details

- **Solidity Version**: 0.8.19
- **Optimization**: Enabled (200 runs)
- **Target**: EVM compatible chains (Sei, Ethereum, etc.)

## Adding New Contracts

To add a new contract type:

1. Add the ABI to `../abis/ContractName.abi.json`
2. Add the bytecode to `ContractName.bytecode.txt`
3. Update the contract loader utility to support the new contract
4. Update the Deploy Contract node to include the new option

## Security Note

These are basic implementations for demonstration purposes. For production use, consider using audited contracts from OpenZeppelin or other trusted sources. 