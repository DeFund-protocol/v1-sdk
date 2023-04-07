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
import { Wallet, providers } from 'ethers';

const chainId = 5;
const provider = new providers.JsonRpcProvider('your json rpc url');
const signer = new Wallet('your signer privateKey', provider)
const sdk = new UnversalSDK(chainId, signer);
```

### Swap

#### Swap Params
| Param       | Type        | Description         |
| ----------- | ----------- | ------------------- |
| maker       | Address     | your signer address |
| fundAddress | Address     | your fund address   |
| swapDetails | SwapDetails |                     |
| overrides   | Overrides   |                     |

#### Swap Details
| Param      | Type      | Description                                                                          |
| ---------- | --------- | ------------------------------------------------------------------------------------ |
| opType     | string    | `exactInput`, `exactOutput`                                                          |
| tokenIn    | Address   |                                                                                      |
| tokenOut   | Address   |                                                                                      |
| amountIn   | BigNumber | amountIn for exactInput, amountInMaximum for exactOutput                             |
| amountOut  | Bignumber | amountOutMinimum for exactInput, amountOut for exactOutput                           |
| useNative  | Boolean   | if one of tokenIn or tokenOut is Weth and need use ETH balance, set true, else false |
| expiration | number    |                                                                                      |

#### Overrides
| Param    | Type   | Description           |
| -------- | ------ | --------------------- |
| GasPrice | number | max gas price in gwei |
| GasLimit | number |                       |

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const swapDetails = {
    "opType": "exactInput",
    "tokenIn": "",
    "tokenOut": "",
    "amountIn": BigNumber.from(1),
    "amountOut": BigNumber.from(1),
    "useNative": true,
    "expiration": 1698074828,
}

const overrides = {};

const tx =await sdk.executeSwap(maker, fundAddress, swapDetails, overrides);
```

### AssetsConvert

#### Convert Params
| Param          | Type           | Description         |
| -------------- | -------------- | ------------------- |
| maker          | Address        | your signer address |
| fundAddress    | Address        | your fund address   |
| convertDetails | ConvertDetails |                     |
| overrides      | Overrides      |                     |

#### Convert Details
| Param    | Type    | Description      |
| -------- | ------- | ---------------- |
| ratio    | number  | ratio of tokenIn |
| tokenIn  | Address |                  |
| tokenOut | Address |                  |

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const convertDetails = {
    "opType": "assetsConvert",
    "tokenIn": "",
    "tokenOut": "",
    "ratio": 1000,
}

const overrides = {};

const tx =await sdk.executeAssetsConvert(maker, fundAddress, convertDetails, overrides);
```

### Examples
Examples can be found at: [Examples](https://github.com/DeFund-protocol/defund-examples)