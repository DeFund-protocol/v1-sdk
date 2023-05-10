import ERC20ABI from '../abis/ERC20.json';
import FundManagerABI from '../abis/FundManager.json';
import FundProxyABI from '../abis/FundProxy.json';
import FundViewerABI from '../abis/FundViewer.json';
import PathFinderABI from '../abis/PathFinder.json';
import Weth9ABI from '../abis/Weth9.json';
import NonfungiblePositionManagerABI from '../abis/uniswap/NonfungiblePositionManager.json';
import SwapRouter02ABI from '../abis/uniswap/SwapRouter02.json';
declare const IUniswapV3FactoryABI: ({
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    outputs?: undefined;
    stateMutability?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
declare const IUniswapV3PoolABI: ({
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    outputs?: undefined;
    stateMutability?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export { FundManagerABI, FundProxyABI, FundViewerABI, PathFinderABI, SwapRouter02ABI, NonfungiblePositionManagerABI, IUniswapV3FactoryABI, IUniswapV3PoolABI, ERC20ABI, Weth9ABI };
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
export declare const FundProxyAddress: AddressMap;
export declare const FundViewerAddress: AddressMap;
export declare const PathFinderAddress: AddressMap;
export declare const SwapRouter02Address: AddressMap;
export declare const NonfungiblePositionManagerAddress: AddressMap;
