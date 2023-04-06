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
import { UnversalSDK } from '@defund-protocol/v1-sdk';

const chainId = 5;
const provider = new providers.JsonRpcProvider('your json rpc url');
const signer = new Wallet('your signer privateKey', provider)
const sdk = new UnversalSDK(chainId, signer);
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
|amountOut|Bignumber|amountOutMinimum for exactInput, amountOut for exactOutput|
|useNative|Boolean|if one of tokenIn or tokenOut is Weth and need use ETH balance, set true, else false|
|expiration|number||

```typescript
const fundAddress = 'your fund address';
const params = {
    "opType": "exactInput",
    "tokenIn": "",
    "tokenOut": "",
    "amountIn": BigNumber.from(1),
    "amountOut": BigNumber.from(1),
    "useNative": true,
    "expiration": 1698074828,
}
const tx =await sdk.executeSwap(signer.address, fundAddress, params, options);
```