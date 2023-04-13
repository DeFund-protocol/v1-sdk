import { default as ERC20ABI } from '../abis/ERC20.json';
import { default as FundManagerABI } from '../abis/FundManager.json';
import { default as FundViewerABI } from '../abis/FundViewer.json';
import { default as PathFinderABI } from '../abis/PathFinder.json';
import { default as SwapRouter02ABI } from '../abis/uniswap/SwapRouter02.json';
import { default as NonfungiblePositionManagerABI } from '../abis/uniswap/NonfungiblePositionManager.json';
import { default as Weth9ABI } from '../abis/Weth9.json';
import { abi as IUniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
export { FundManagerABI, FundViewerABI, PathFinderABI, SwapRouter02ABI, NonfungiblePositionManagerABI, IUniswapV3FactoryABI, IUniswapV3PoolABI, ERC20ABI, Weth9ABI };
export declare enum SupportedChainId {
    MAINNET = 1,
    GOERLI = 5,
    MATIC = 137,
    MUMBAI = 80001
}
export type AddressMap = {
    [ChainId: number]: string;
};
export declare const FundManagerAddress: AddressMap;
export declare const FundViewerAddress: AddressMap;
export declare const PathFinderAddress: AddressMap;
export declare const SwapRouter02Address: AddressMap;
export declare const NonfungiblePositionManagerAddress: AddressMap;
