# v1-sdk
 DeFund Protocol v1 SDK

## Installation
```shell
npm install DeFund-protocol/v1-sdk
```

## How to use

### Base

SDK initialization requires the following parameters

| Param   | type   | description                 |
| ------- | ------ | --------------------------- |
| chainId | number | 1 for mainnet, 5 for goerli |
| signer  | Signer |                             |

```typescript
import { UniversalSDK } from '@defund-protocol/v1-sdk';
import { Wallet, providers } from 'ethers';

const chainId = 1;
const provider = new providers.JsonRpcProvider('your json rpc url');
const signer = new Wallet('your signer privateKey', provider)
const sdk = new UniversalSDK(chainId, signer);
```

### Swap

#### Swap Params
| Param       | Type       | Description         |
| ----------- | ---------- | ------------------- |
| maker       | Address    | your signer address |
| fundAddress | Address    | your fund address   |
| swapDetails  | SwapDetails |                     |
| overrides   | Overrides  |                     |

#### Swap Details
|Param|Type|Description|
|----|----|----|
|opType|string|`exactInput`, `exactOutput`|
|tokenIn|Address||
|tokenOut|Address||
|amountIn|BigNumber|amountIn for exactInput, amountInMaximum for exactOutput|
|amountOut|BigNumber|amountOutMinimum for exactInput, amountOut for exactOutput|
|useNative|Boolean|set to true if you want to swap to or from ETH instead of WETH|
|expiration|number||

#### Overrides
You can find out more about the overrides parameter from the [ethers document](https://docs.ethers.org/v5/api/contract/contract/#Contract--write)

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const swapDetails = {
    "opType": "exactInput",
    "tokenIn": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH Address on mainnet
    "tokenOut": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC Address on mainnet
    "amountIn": BigNumber.from('100000000000000000'), // 0.1 ETH
    "amountOut": BigNumber.from('1000000'), // 1 USDC
    "useNative": true, // use ETH
    "expiration": Math.round(new Date() /1000 + 10 * 60), // expires in 10 minutes
}

const overrides = {};

const tx = await sdk.executeSwap(maker, fundAddress, swapDetails, overrides);
```

### Examples
Examples can be found at: [Examples](https://github.com/DeFund-protocol/defund-examples)