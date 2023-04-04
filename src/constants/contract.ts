import { default as ERC20ABI } from '../abis/ERC20.json' assert { type: 'json' };
import { default as FundManagerABI } from '../abis/FundManager.json' assert { type: 'json' };
import { default as PathFinderABI } from '../abis/PathFinder.json' assert { type: 'json' };
import { default as SwapRouter02ABI } from '../abis/SwapRouter02.json' assert { type: 'json' };
import { default as Weth9ABI } from '../abis/Weth9.json' assert { type: 'json' };

export {
  FundManagerABI,
  SwapRouter02ABI,
  PathFinderABI,
  Weth9ABI,
  ERC20ABI,
};

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
}

export type AddressMap = { [ChainId: number]: string }

export const FundManagerAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x22fCce8f007D61AA933e29f6dDf756d73B6F39F1',
  [SupportedChainId.GOERLI]: '0xD64A92E7df4f7fdA24861f8C080b25E33649AF46',
}

export const PathFinderAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0xef1C2f9532BdBBbaE8Ed22ABAB24Ac98F9513e67',
  [SupportedChainId.GOERLI]: '0x5681C896d42C57981Fb7990a0315fA2226aaC149',
}

export const SwapRouterAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  [SupportedChainId.GOERLI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
}