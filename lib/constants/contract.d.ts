import * as ERC20ABI from '../abis/ERC20.json';
import * as FundManagerABI from '../abis/FundManager.json';
import * as PathFinderABI from '../abis/PathFinder.json';
import * as SwapRouter02ABI from '../abis/SwapRouter02.json';
import * as Weth9ABI from '../abis/Weth9.json';
export { FundManagerABI, SwapRouter02ABI, PathFinderABI, Weth9ABI, ERC20ABI, };
export declare enum SupportedChainId {
    MAINNET = 1,
    GOERLI = 5
}
export type AddressMap = {
    [ChainId: number]: string;
};
export declare const FundManagerAddress: AddressMap;
export declare const PathFinderAddress: AddressMap;
export declare const SwapRouterAddress: AddressMap;
