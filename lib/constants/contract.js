import * as ERC20ABI from '../abis/ERC20.json';
import * as FundManagerABI from '../abis/FundManager.json';
import * as PathFinderABI from '../abis/PathFinder.json';
import * as SwapRouter02ABI from '../abis/SwapRouter02.json';
import * as Weth9ABI from '../abis/Weth9.json';
export { FundManagerABI, SwapRouter02ABI, PathFinderABI, Weth9ABI, ERC20ABI, };
export var SupportedChainId;
(function (SupportedChainId) {
    SupportedChainId[SupportedChainId["MAINNET"] = 1] = "MAINNET";
    SupportedChainId[SupportedChainId["GOERLI"] = 5] = "GOERLI";
})(SupportedChainId || (SupportedChainId = {}));
export const FundManagerAddress = {
    [SupportedChainId.MAINNET]: '0x22fCce8f007D61AA933e29f6dDf756d73B6F39F1',
    [SupportedChainId.GOERLI]: '0xD64A92E7df4f7fdA24861f8C080b25E33649AF46',
};
export const PathFinderAddress = {
    [SupportedChainId.MAINNET]: '0xef1C2f9532BdBBbaE8Ed22ABAB24Ac98F9513e67',
    [SupportedChainId.GOERLI]: '0x5681C896d42C57981Fb7990a0315fA2226aaC149',
};
export const SwapRouterAddress = {
    [SupportedChainId.MAINNET]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    [SupportedChainId.GOERLI]: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
};
