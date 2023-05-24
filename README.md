# v1-sdk

DeFund Protocol v1 SDK

## Installation

```shell
npm install @defund-protocol/v1-sdk
```

## How to use

### Base

SDK initialization requires the following parameters

| Param   | type   | description                                                  |
| ------- | ------ | ------------------------------------------------------------ |
| chainId | number | 1 for mainnet, 5 for goerli, 137 for matic, 80001 for mumbai |
| signer  | Signer |                                                              |

```typescript
import { UniversalSDK } from '@defund-protocol/v1-sdk';
import { Wallet, providers } from 'ethers';

const chainId = 1;
const provider = new providers.JsonRpcProvider('your json rpc url');
const signer = new Wallet('your signer privateKey', provider);
const sdk = new UniversalSDK(chainId, signer);
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

| Param      | Type      | Description                                                                             |
| ---------- | --------- | --------------------------------------------------------------------------------------- |
| opType     | string    | `exactInput`, `exactOutput`                                                             |
| tokenIn    | Address   |                                                                                         |
| tokenOut   | Address   |                                                                                         |
| amountIn   | BigNumber | amountIn for exactInput, amountInMaximum for exactOutput                                |
| amountOut  | BigNumber | amountOutMinimum for exactInput, amountOut for exactOutput                              |
| useNative  | Boolean   | set to true if you want to swap to or from native Token instead of warpped native Token |
| expiration | number    | optional, default expires in 10 minutes                                                 |

#### Overrides

You can find out more about the overrides parameter from the [ethers document](https://docs.ethers.org/v5/api/contract/contract/#Contract--write)

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const swapDetails = {
  opType: 'exactInput',
  tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH Address on mainnet
  tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC Address on mainnet
  amountIn: BigNumber.from('100000000000000000'), // 0.1 ETH
  amountOut: BigNumber.from('1000000'), // 1 USDC
  useNative: true, // use native token, use ETH in this demo
  expiration: Math.round(new Date().getTime() / 1000 + 30 * 60) // 30 minutes
};

const overrides = {};

const tx = await sdk.executeSwap(maker, fundAddress, swapDetails, overrides);
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

| Param      | Type    | Description                                                                             |
| ---------- | ------- | --------------------------------------------------------------------------------------- |
| ratio      | number  | ratio of tokenIn                                                                        |
| tokenIn    | Address |                                                                                         |
| tokenOut   | Address |                                                                                         |
| slippage   | number  | 1 for 1%, minimum is 0.01 for 0.01%                                                     |
| useNative  | Boolean | set to true if you want to swap to or from native Token instead of warpped native Token |
| expiration | number  | optional, default expires in 10 minutes                                                 |

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const convertDetails = {
  opType: 'assetsConvert',
  tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH Address on mainnet
  tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC Address on mainnet
  ratio: 1000, // 10%
  useNative: true
};

const overrides = {};

const tx = await sdk.executeAssetsConvert(
  maker,
  fundAddress,
  convertDetails,
  overrides
);
```

### ApproveToken

#### Approve Token Params

| Param          | Type           | Description         |
| -------------- | -------------- | ------------------- |
| maker          | Address        | your signer address |
| fundAddress    | Address        | your fund address   |
| approveDetails | ApproveDetails |                     |
| overrides      | Overrides      |                     |

#### Approve Details

| Param  | Type      | Description                          |
| ------ | --------- | ------------------------------------ |
| opType | string    | locked to `fund` for now             |
| token  | Address   | your token address                   |
| amount | BigNumber | Optional, default value is MaxInt256 |

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const approveDetails = {
  opType: 'fund',
  token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH Address on mainnet
};

const overrides = {};

const tx = await sdk.executeApproveToken(
  maker,
  fundAddress,
  approveDetails,
  overrides
);
```

### GetFundAssets

You can use this method to get the asset information of the fund

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';

const assets = await sdk.getFundAssets(fundAddress);
```

### GetFundInfo

You can use this method to get all the on-chain information of the fund

#### Params

| Param       | Type    | Description                                                                                          |
| ----------- | ------- | ---------------------------------------------------------------------------------------------------- |
| fundAddress | Address |                                                                                                      |
| lpAddress   | Address | Optional, If you want to get share information about a specific lp, pass this parameter              |
| withAssets  | Boolean | The default is true, return all information, if you don't need asset information, you can pass false |

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';

const lpAddress = 'this address of specific lp';
const witAssets = false;

const assets = await sdk.getFundAssets(fundAddress, lpAddress, withAssets);
```

### Approve Token

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';

const tx = await sdk.executeApproveToken(maker, fundAddress, {token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'});
```

If approve is not required, tx returns null, otherwise returns the transaction.

### Buy Fund

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const amount = BigNumber.from("10000000000000000") // 0.01 ETH

const tx = await sdk.executeBuyFund(
  maker,
  fundAddress,
  amount,
);
```

### Sell Fund

```typescript
const maker = signer.address;
const fundAddress = 'your fund address';
const amount = BigNumber.from("10000000000000000") // 0.01 ETH

const tx = await sdk.executeSellFund(
  maker,
  fundAddress,
  10, // 10 percent
);
```

### Get Your Funds list

#### Role
| Role     | Value | Description           |
| -------- | ----- | --------------------- |
| Manager  | 1     | funds you manage      |
| Operator | 2     | funds you can operate |
| Investor | 3     | funds you invest in   |

```typescript
  const managerList = await sdk.getFundList(signer.address, 1);
  const operatorList = await sdk.getFundList(signer.address, 2);
  const investorList = await sdk.getFundList(signer.address, 3);
```

### Get Fund's Lps

```typescript
const fundAddress = 'your fund address';
const lps = await sdk.getFundInvestors(fundAddress);
```

### Examples

Examples can be found at: [Examples](https://github.com/DeFund-protocol/defund-examples)
