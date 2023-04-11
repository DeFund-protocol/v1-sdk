import { default as ERC20ABI } from '../abis/ERC20.json';
import { default as FundManagerABI } from '../abis/FundManager.json';
import { default as FundViewerABI } from '../abis/FundViewer.json';
import { default as PathFinderABI } from '../abis/PathFinder.json';
import { default as SwapRouter02ABI } from '../abis/SwapRouter02.json';
import { default as Weth9ABI } from '../abis/Weth9.json';
export { FundManagerABI, FundViewerABI, SwapRouter02ABI, PathFinderABI, Weth9ABI, ERC20ABI };
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
export declare const SwapRouterAddress: AddressMap;
