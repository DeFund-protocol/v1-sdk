import { BigNumber, constants } from 'ethers';
import { SwapRouter02ABI, SwapRouter02Address } from '../../constants/contract';
import { NativeETHAddress, WethAddress } from '../../constants/token';
import { useEncodeFuncData } from '../useContract';
import { Fund } from '../useFund';
import { isEqualAddress } from '../useUtils';
import { exactInputPath, exactOutputPath } from './usePathFinder';
const executeSwap = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const wethAddress = WethAddress[chainId];
    const ethAmount = calcEthAmount(params, wethAddress);
    const swapRouter02Address = SwapRouter02Address[chainId];
    try {
        const calldata = await swapCalldata(chainId, signer, fundAddress, params, wethAddress);
        return await new Fund(chainId, signer, fundAddress).executeOrder(swapRouter02Address, calldata, ethAmount, maker, refundGas, overrides);
    }
    catch (e) {
        throw e;
    }
};
const swapCalldata = async (chainId, signer, fundAddress, params, wethAddress) => {
    switch (params.opType) {
        case 'exactInput':
            return await exactInputCalldata(chainId, signer, params, fundAddress, wethAddress);
        case 'exactOutput':
            return await exactOutPutCalldata(chainId, signer, params, fundAddress, wethAddress);
        default:
            throw new Error(`Invalid opType: ${params.opType}`);
    }
};
const exactInputCalldata = async (chainId, signer, params, fundAddress, wethAddress) => {
    if (!params.amountIn)
        throw new Error('Invalid amountIn');
    const trade = await exactInputPath(params.tokenIn, params.tokenOut, params.amountIn, chainId, signer);
    const swapParams = {
        recipient: calcRecipient(params, fundAddress, wethAddress),
        path: trade.path,
        amountIn: params.amountIn,
        amountOutMinimum: calcAmountOutMinimum(trade.expectedAmount, params.slippage)
    };
    const calldata = useEncodeFuncData(SwapRouter02ABI, 'exactInput', [
        swapParams
    ]);
    if (!params.useNative)
        return calldata;
    if (!isEqualAddress(params.tokenOut, wethAddress))
        return calldata;
    const unwrap = useEncodeFuncData(SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, fundAddress]);
    return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
        params.expiration,
        [calldata, unwrap]
    ]);
};
const exactOutPutCalldata = async (chainId, signer, params, fundAddress, wethAddress) => {
    if (!params.amountOut)
        throw new Error('Invalid amountOut');
    const trade = await exactOutputPath(params.tokenIn, params.tokenOut, params.amountOut, chainId, signer);
    const swapParams = {
        recipient: calcRecipient(params, fundAddress, wethAddress),
        path: trade.path,
        amountOut: params.amountOut,
        amountInMaximum: calcAmountInMaximum(trade.expectedAmount, params.slippage)
    };
    const output = useEncodeFuncData(SwapRouter02ABI, 'exactOutput', [
        swapParams
    ]);
    if (!params.useNative)
        return output;
    switch (true) {
        case isEqualAddress(params.tokenIn, wethAddress):
            const refund = useEncodeFuncData(SwapRouter02ABI, 'refundETH()', []);
            return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                params.expiration,
                [output, refund]
            ]);
        case isEqualAddress(params.tokenOut, wethAddress):
            const unwrap = useEncodeFuncData(SwapRouter02ABI, 'unwrapWETH9(uint256,address)', [params.amountOut, fundAddress]);
            return useEncodeFuncData(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
                params.expiration,
                [output, unwrap]
            ]);
        default:
            return output;
    }
};
const swapMulticallCalldata = async (chainId, signer, maker, fundAddress, params, refundGas = false) => {
    const wethAddress = WethAddress[chainId];
    const ethAmount = calcEthAmount(params, wethAddress);
    const swapRouter02Address = SwapRouter02Address[chainId];
    try {
        const calldata = await swapCalldata(chainId, signer, fundAddress, params, wethAddress);
        return new Fund(chainId, signer, fundAddress).executeOrderCallData(swapRouter02Address, calldata, ethAmount, maker, refundGas);
    }
    catch (e) {
        throw e;
    }
};
/*
 * helper methods
 */
const calcEthAmount = (params, wethAddress) => {
    if (!params.useNative)
        return constants.Zero;
    if (!isEqualAddress(params.tokenIn, wethAddress))
        return constants.Zero;
    return params.amountIn;
};
const calcRecipient = (params, recipient, wethAddress) => {
    if (!params.useNative)
        return recipient;
    if (!isEqualAddress(params.tokenOut, wethAddress))
        return recipient;
    return NativeETHAddress;
};
const calcAmountInMaximum = (expectedAmount, slippage) => {
    return expectedAmount
        .mul(BigNumber.from(1e4).add(BigNumber.from(slippage * 100)))
        .div(BigNumber.from(1e4));
};
const calcAmountOutMinimum = (expectedAmount, slippage) => {
    return expectedAmount
        .mul(BigNumber.from(1e4))
        .div(BigNumber.from(1e4).add(BigNumber.from(slippage * 100)));
};
export { executeSwap, swapMulticallCalldata };
