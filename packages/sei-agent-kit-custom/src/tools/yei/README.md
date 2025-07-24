# Yei Finance Tools (SEI)

This module provides tools to interact with the Yei Finance protocol (Aave V3 fork) on the SEI network using TypeScript and viem.

## Features

- Supply (deposit) tokens
- Withdraw tokens
- Borrow assets
- Repay loans
- Claim rewards
- Query user health factor
- Full support for USDC, USDT, WSEI, ISEI and more

## Installation

```bash
npm install sei-agent-kit
```

## Usage

```typescript
import {
  supplyYei,
  withdrawYei,
  borrowYei,
  repayYei,
  claimYeiRewards,
  getYeiHealthFactor
} from 'sei-agent-kit/src/tools/yei';
import { SeiAgentKit } from 'sei-agent-kit/src/agent';

const agent = new SeiAgentKit('YOUR_PRIVATE_KEY', {});
```

### Supply (Deposit)
```typescript
await supplyYei(agent, { asset: 'USDC', amount: '100' });
```

### Withdraw
```typescript
await withdrawYei(agent, { asset: 'USDC', amount: '50' });
```

### Borrow
```typescript
await borrowYei(agent, { asset: 'USDC', amount: '10', interestRateMode: 2 }); // 2 = VARIABLE
```

### Repay
```typescript
await repayYei(agent, { asset: 'USDC', amount: '5', interestRateMode: 2 });
```

### Claim Rewards
```typescript
await claimYeiRewards(agent, {
  assets: [
    '0xc1a6F27a4CcbABB1C2b1F8E98478e52d3D3cB935', // USDC aToken
    '0x809FF4801aA5bDb33045d1fEC810D082490D63a4'  // WSEI aToken
  ]
});
```

### Get User Health Factor
```typescript
const health = await getYeiHealthFactor(agent, '0xYourAddress');
console.log(health.healthFactor.toString());
```

## Supported Tokens

| Token | Address                                    | Decimals | aToken                                    | Variable Debt Token                        | Stable Debt Token                          |
|-------|--------------------------------------------|----------|--------------------------------------------|--------------------------------------------|--------------------------------------------|
| USDC  | 0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1 | 6        | 0xc1a6F27a4CcbABB1C2b1F8E98478e52d3D3cB935 | 0x5Bfc2d187e8c7F51BE6d547B43A1b3160D72a142 | 0xe8348837A3be3212E50F030DFf935Ae0A0eA4B54 |
| USDT  | 0xB75D0B03c06A926e488e2659DF1A861F860bD3d1 | 6        | 0x945C042a18A90Dd7adb88922387D12EfE32F4171 | 0x25eA70DC3332b9960E1284D57ED2f6A90d4a8373 | 0x04Ba7e1387dcBE7e1fC43Dc8dE5dE8A73a77b1ee |
| WSEI  | 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7 | 18       | 0x809FF4801aA5bDb33045d1fEC810D082490D63a4 | 0x648e683aaE7C18132564F8B48C625aE5038A9607 | 0x4dE99D1f91A1d731966fa250b432fF17C9C234d9 |
| ISEI  | 0x5cf6826140c1c56ff49c808a1a75407cd1df9423 | 6        | 0x160345fc359604fc6e70e3c5facbde5f7a9342d8 | 0x43edd7f3831b08fe70b7555ddd373c8bf65a9050 | 0x43edd7f3831b08fe70b7555ddd373c8bf65a9050 |

## Main Contracts

- Pool Proxy: `0x4a4d9abD36F923cBA0Af62A39C01dEC2944fb638`
- Pool Data Provider: `0x60c82A40C57736a9c692C42e87A8849Fb407F0d6`
- Pool Addresses Provider: `0x5C57266688A4aD1d3aB61209ebcb967B84227642`
- Incentives Proxy: `0x60485C5E5E3D535B16CC1bd2C9243C7877374259`

## Error Handling

All functions throw descriptive errors. Use try/catch to handle them:

```typescript
try {
  await supplyYei(agent, { asset: 'USDC', amount: '100' });
} catch (error) {
  console.error('Error:', (error as Error).message);
}
```

## Interest Rate Modes

- 1 = STABLE
- 2 = VARIABLE

## References

- [Yei Finance Contracts](https://github.com/Yei-Finance/yei-contracts)
- [Aave V3 Documentation](https://docs.aave.com/)
- [SEI Network](https://sei.io/) 