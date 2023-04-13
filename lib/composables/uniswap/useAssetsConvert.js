import { BigNumber, constants } from 'ethers';
import { FundManagerABI, FundManagerAddress } from '../../constants';
import { Fund } from '../useFund';
import { isEqualAddress } from '../useUtils';
import { sendTransaction } from '../useWeb3';
import { exactInputPath, fallbackPath } from './usePathFinder';
import { executeSwap } from './useSwap';
const executeAssetsConvert = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const fundManagerAddress = FundManagerAddress[chainId];
    const convertParams = await getConvertParams(chainId, signer, fundAddress, params);
    const executeParams = [fundAddress, convertParams, refundGas];
    return await sendTransaction(fundManagerAddress, FundManagerABI, 'sellAssets', executeParams, overrides, signer);
};
const executeAssetsConvertWithSlippage = async (chainId, signer, maker, fundAddress, params, refundGas, overrides) => {
    const assets = await new Fund(chainId, signer, fundAddress).getFundAssets();
    const tokenIn = assets.tokenBalances.find((item) => isEqualAddress(item.token, params.tokenIn));
    if (!tokenIn)
        throw new Error('Invalid tokenIn');
    const amountIn = tokenIn.balance
        .mul(BigNumber.from(params.ratio))
        .div(BigNumber.from(1e4));
    const swapParams = {
        opType: 'exactInput',
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: amountIn,
        slippage: params.slippage,
        useNative: params.useNative,
        expiration: params.expiration
    };
    return await executeSwap(chainId, signer, maker, fundAddress, swapParams, refundGas, overrides);
};
/*
 * helper methods
 */
const getConvertParams = async (chainId, signer, fundAddress, params) => {
    let convertParams = {
        sellType: 1,
        fee: 3000,
        minPriority: BigNumber.from(0),
        lastRatio: BigNumber.from(0),
        underlying: params.tokenOut
    };
    const fundData = await new Fund(chainId, signer, fundAddress).getFunndInfo(true);
    const assets = [
        ...fundData.tokenBalances.filter((item) => !isEqualAddress(item.token, fundData.underlyingToken)),
        ...fundData.lpTokens.map((item) => ({
            ...item,
            value: item.amountValue0.add(item.amountValue1)
        }))
    ].sort((a, b) => b.priority.sub(a.priority));
    const tokenIn = fundData.tokenBalances.find((item) => isEqualAddress(item.token, params.tokenIn));
    if (tokenIn) {
        convertParams['selectPriority'] = [tokenIn.priority];
        convertParams['selectRatio'] = [params.ratio];
        const paths = [];
        for (let i = 0; i < fundData.allowedTokens.length; i++) {
            if (isEqualAddress(fundData.allowedTokens[i], tokenIn.token)) {
                const trade = await exactInputPath(params.tokenIn, params.tokenOut, tokenIn.balance
                    .mul(BigNumber.from(params.ratio))
                    .div(BigNumber.from(1e4)), chainId, signer);
                paths.push(trade.path);
            }
            else {
                paths.push('0x');
            }
        }
        convertParams['paths'] = paths;
        return convertParams;
    }
    const needValue = fundData.totalValue
        .mul(BigNumber.from(params.ratio))
        .div(BigNumber.from(1e4));
    const selectPriority = [];
    const selectRatio = [];
    let selectedValue = constants.Zero;
    for (let i = 0; i < assets.length; i++) {
        selectPriority.push(assets[i].priority);
        if (selectedValue.gt(needValue)) {
            const leftValue = needValue.sub(selectedValue);
            const ratio = leftValue.mul(1000).div(assets[i].value);
            selectRatio.push(ratio);
            break;
        }
        else {
            selectRatio.push(1e4);
            selectedValue = selectedValue.add(assets[i].value);
        }
    }
    convertParams['selectPriority'] = selectPriority;
    convertParams['selectRatio'] = selectRatio;
    const balances = {};
    for (const asset of assets) {
        if (asset.token && asset.balance.eq(constants.Zero))
            continue;
        if (asset.tokenId &&
            asset.amount0.add(asset.fee0).eq(constants.Zero) &&
            asset.amount1.add(asset.fee1).eq(constants.Zero))
            continue;
        if (asset.token) {
            const amount = asset.balance
                .mul(params.lastRatio)
                .div(BigNumber.from(1e4));
            balances[asset.token] = balances[asset.token]
                ? balances[asset.token].add(amount)
                : amount;
        }
        else {
            const amount0 = asset.amount0
                .mul(params.lastRatio)
                .div(BigNumber.from(1e4));
            const amount1 = asset.amount1
                .mul(params.lastRatio)
                .div(BigNumber.from(1e4));
            balances[asset.token0] = (balances[asset.token0] ? balances[asset.token0].add(amount0) : amount0).add(asset.fee0);
            balances[asset.token1] = (balances[asset.token1] ? balances[asset.token1].add(amount1) : amount1).add(asset.fee1);
        }
    }
    const paths = [];
    for (const token of fundData.allowedTokens) {
        const balance = balances[token] || constants.Zero;
        if (balance.eq(constants.Zero) ||
            isEqualAddress(token, fundData.underlyingToken)) {
            paths.push('0x');
            continue;
        }
        const trade = await exactInputPath(token, fundData.underlyingToken, balance, chainId, signer);
        if (trade.path === '0x') {
            paths.push(fallbackPath(token, fundData.underlyingToken, chainId));
        }
        else {
            paths.push(trade.path);
        }
    }
    convertParams['paths'] = paths;
    return convertParams;
};
export { executeAssetsConvert, executeAssetsConvertWithSlippage };
