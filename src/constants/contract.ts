import { default as ERC20ABI } from '../abis/ERC20.json' assert { type: 'json' };
import { default as FundManagerABI } from '../abis/FundManager.json' assert { type: 'json' };
import { default as FundViewerABI } from '../abis/FundViewer.json' assert { type: 'json' };
import { default as PathFinderABI } from '../abis/PathFinder.json' assert { type: 'json' };
import { default as SwapRouter02ABI } from '../abis/uniswap/SwapRouter02.json' assert { type: 'json' };
import { default as NonfungiblePositionManagerABI } from '../abis/uniswap/NonfungiblePositionManager.json' assert { type: 'json' };
import { default as Weth9ABI } from '../abis/Weth9.json' assert { type: 'json' };
import { default as IUniswapV3Factory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import { default as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';

const IUniswapV3FactoryABI = IUniswapV3Factory.abi;
const IUniswapV3PoolABI = IUniswapV3Pool.abi;
export {
  FundManagerABI,
  FundViewerABI,
  PathFinderABI,
  SwapRouter02ABI,
  NonfungiblePositionManagerABI,
  IUniswapV3FactoryABI,
  IUniswapV3PoolABI,
  ERC20ABI,
  Weth9ABI
};

export enum SupportedChainId {
  MAINNET = 1,
  GOERLI = 5,
  MATIC = 137,
  MUMBAI = 80001
}

export type AddressMap = { [ChainId: number]: string };

export const FundManagerAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x22fCce8f007D61AA933e29f6dDf756d73B6F39F1',
  [SupportedChainId.GOERLI]: '0xD64A92E7df4f7fdA24861f8C080b25E33649AF46',
  [SupportedChainId.MATIC]: '0xd974695B1ed124871cD85723fC5c9bD0201e5b71',
  [SupportedChainId.MUMBAI]: '0x856bE143e343DAf4BB40b48750938032B88079F6'
};

export const FundViewerAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x29BC2c2D717E0e712D7E64f6eC9C6586A41943a7',
  [SupportedChainId.GOERLI]: '0x0eE48757AC762Cd93eb7AC00bCe4eFa05DD21Eb3',
  [SupportedChainId.MATIC]: '0xafa23B0Ab912a2035BA9Abe6AC1Ab321809efE5D',
  [SupportedChainId.MUMBAI]: '0x6F3EaEc068a0f92Db9bcc7664B3F2776b3f463Ad'
};

export const PathFinderAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0xef1C2f9532BdBBbaE8Ed22ABAB24Ac98F9513e67',
  [SupportedChainId.GOERLI]: '0x5681C896d42C57981Fb7990a0315fA2226aaC149',
  [SupportedChainId.MATIC]: '0x0f0d265C69E5eEe7e903dAB60b6a4753Ae8f2C63',
  [SupportedChainId.MUMBAI]: '0xb20d7e3EFF4985bEdC2c37294BcEa6D3F28daC8f'
};

export const SwapRouter02Address: AddressMap = {
  [SupportedChainId.MAINNET]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  [SupportedChainId.GOERLI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  [SupportedChainId.MATIC]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
  [SupportedChainId.MUMBAI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
};

export const NonfungiblePositionManagerAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [SupportedChainId.GOERLI]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [SupportedChainId.MATIC]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  [SupportedChainId.MUMBAI]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
};
