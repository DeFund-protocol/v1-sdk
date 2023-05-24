import { FeeAmount } from '@uniswap/v3-sdk';
import ethers, { BigNumber, constants } from 'ethers';
import { ERC20ABI, FundManagerABI, FundManagerAddress, FundProxyABI, FundProxyAddress, FundViewerABI, FundViewerAddress } from '../constants';
import { WethAddress } from '../constants/token';
import { Uniswap } from './uniswap';
import { tokenNeedApprove } from './uniswap/useApproveToken';
import { exactInputPath } from './uniswap/usePathFinder';
import { useContract, useEncodeFuncData } from './useContract';
import { useToken } from './useToken';
import { encodePath, formatDetailData, isEqualAddress, mergedTokenBalances } from './useUtils';
import { getAddressFromSigner, sendTransaction } from './useWeb3';
export class Fund {
    chainId;
    signer;
    fundAddress;
    fundManagerAddress;
    fundProxyAddress;
    fundViewerAddress;
    mergePercentage = 102;
    constructor(chainId, signer, fundAddress) {
        this.chainId = chainId;
        this.signer = signer;
        this.fundAddress = fundAddress;
        this.fundManagerAddress = FundManagerAddress[chainId];
        this.fundProxyAddress = FundProxyAddress[chainId];
        this.fundViewerAddress = FundViewerAddress[chainId];
    }
    async getFunndInfo(withLP, lpAddress) {
        if (!lpAddress) {
            lpAddress = await this.signer.getAddress();
        }
        return await useContract(this.fundViewerAddress, FundViewerABI, this.signer).getFundData(this.fundAddress, lpAddress, withLP);
    }
    async getFundAssets() {
        const assets = await this.getFunndInfo(true);
        const tokenBalances = [];
        for (let i = 0; i < assets.tokenBalances.length; i++) {
            tokenBalances.push(formatDetailData(assets.tokenBalances[i]));
        }
        const lpTokens = [];
        for (let i = 0; i < assets.lpTokens.length; i++) {
            lpTokens.push(formatDetailData(assets.lpTokens[i]));
        }
        return { tokenBalances, lpTokens };
    }
    async getFundInvistors(page = 0, pageSize = 100) {
        const viewer = useContract(this.fundViewerAddress, FundViewerABI, this.signer);
        const results = await viewer.getFundLpDetailInfos(this.fundAddress, pageSize * page, pageSize);
        return results.filter((item) => item.lpAddr !== constants.AddressZero);
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeSwap(maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeLP(maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        return await new Uniswap(this.chainId, this.signer).executeAssetsConvert(maker, fundAddress, params, refundGas, overrides);
    }
    /*
     * helper methods
     */
    async executeOrder(target, calldata, ethAmount, maker, refundGas, overrides) {
        ethAmount ||= constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        refundGas ||= false;
        const executeParams = [
            this.fundAddress,
            target,
            calldata,
            ethAmount,
            maker,
            refundGas
        ];
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'executeOrder', executeParams, overrides, this.signer);
    }
    executeOrderCallData(target, calldata, ethAmount, maker, refundGas) {
        const executeParams = [
            this.fundAddress,
            target,
            calldata,
            ethAmount,
            maker,
            refundGas
        ];
        return useEncodeFuncData(FundManagerABI, 'executeOrder', executeParams);
    }
    async executeMulticall(executeParams, overrides) {
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'multicall', [executeParams], overrides, this.signer);
    }
    executeMulticallCalldata() { }
    async executeApproveToken(params, maker, fundAddress, overrides) {
        maker ||= await getAddressFromSigner(this.signer);
        const needApprove = tokenNeedApprove(this.signer, params.token, fundAddress, this.fundProxyAddress, params.amount || constants.MaxInt256);
        if (!needApprove)
            return;
        const approveParams = [this.fundProxyAddress, params.amount || constants.MaxInt256];
        return await sendTransaction(params.token, ERC20ABI, 'approve', approveParams, overrides, this.signer);
    }
    async executeBuyFund(amount, maker, overrides) {
        amount ||= constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        const fundInfo = await this.getFunndInfo(true);
        if (WethAddress[this.chainId] === fundInfo.underlyingToken) {
            overrides ||= {};
            overrides.value = amount;
        }
        const executeParams = [this.fundAddress, amount];
        return await sendTransaction(this.fundProxyAddress, FundProxyABI, 'buy', executeParams, overrides, this.signer);
    }
    calculateAmountMargin(value) {
        return value.mul(this.mergePercentage).div(100);
    }
    fallbackPath(token0, token1) {
        const weth = WethAddress[this.chainId];
        if (isEqualAddress(token0, weth) || isEqualAddress(weth, token1)) {
            return encodePath([token0, token1], [FeeAmount.MEDIUM]);
        }
        else {
            return encodePath([token0, weth, token1], [FeeAmount.MEDIUM, FeeAmount.MEDIUM]);
        }
    }
    async getSellParams(sellRatio) {
        const fund = await this.getFunndInfo(true);
        const targetAmount = this.calculateAmountMargin(fund.totalValue
            .mul(fund.callerDetail.totalUnit)
            .div(fund.totalUnit)
            .mul(sellRatio)
            .div(100));
        const underlyingToken = useToken(this.chainId, fund.underlyingToken);
        const decimals = underlyingToken.decimals;
        console.debug('=> target amount', ethers.utils.formatUnits(targetAmount, decimals), `(${this.mergePercentage}%)`);
        const tokenBalances = mergedTokenBalances(this.chainId, fund.tokenBalances);
        const underlyingTokenBalance = tokenBalances.find((item) => isEqualAddress(item.token, fund.underlyingToken));
        if (underlyingTokenBalance.balance.gte(targetAmount)) {
            return {
                sellType: ethers.constants.Zero,
                minPriority: ethers.constants.MaxUint256,
                lastRatio: targetAmount.mul(10000).div(underlyingTokenBalance.balance),
                selectPriority: [],
                selectRatio: [],
                underlying: fund.underlyingToken,
                paths: [],
                fee: 0
            };
        }
        const params = {
            sellType: ethers.constants.Zero,
            minPriority: ethers.constants.Zero,
            lastRatio: BigNumber.from(10000),
            selectPriority: [],
            selectRatio: [],
            underlying: fund.underlyingToken,
            paths: [],
            fee: 0
        };
        const assets = [
            ...tokenBalances.filter((item) => !isEqualAddress(item.token, fund.underlyingToken)),
            ...fund.lpTokens.map((item) => ({
                ...item,
                value: item.amountValue0.add(item.amountValue1)
            }))
        ].sort((a, b) => b.priority.sub(a.priority));
        const groupedAssets = [];
        assets.forEach((item) => {
            const lastGroup = groupedAssets.length > 0
                ? groupedAssets[groupedAssets.length - 1]
                : undefined;
            if (lastGroup && lastGroup.length > 0) {
                const lastItem = lastGroup[0];
                if (lastItem.priority.eq(item.priority)) {
                    groupedAssets[groupedAssets.length - 1] = [...lastGroup, item];
                }
                else {
                    groupedAssets.push([item]);
                }
            }
            else {
                groupedAssets.push([item]);
            }
        });
        let totalAssetAmount = ethers.constants.Zero;
        const assetSellAmount = targetAmount.sub(underlyingTokenBalance.balance);
        const balances = {};
        for (const group of groupedAssets) {
            const value = group.reduce((acc, cur) => {
                return acc.add(cur.value);
            }, ethers.constants.Zero);
            if (totalAssetAmount.add(value).gte(assetSellAmount)) {
                const lastAmount = assetSellAmount.sub(totalAssetAmount);
                params.lastRatio = lastAmount.mul(10000).div(value);
                params.minPriority = group[0].priority;
            }
            else {
                totalAssetAmount = totalAssetAmount.add(value);
            }
            for (const asset of group) {
                if (asset.token && asset.balance.eq(ethers.constants.Zero))
                    continue;
                if (asset.tokenId &&
                    asset.amount0.add(asset.fee0).eq(ethers.constants.Zero) &&
                    asset.amount1.add(asset.fee1).eq(ethers.constants.Zero))
                    continue;
                if (asset.token) {
                    const amount = asset.balance.mul(params.lastRatio).div(10000);
                    balances[asset.token] = balances[asset.token]
                        ? balances[asset.token].add(amount)
                        : amount;
                }
                else {
                    const amount0 = asset.amount0.mul(params.lastRatio).div(10000);
                    const amount1 = asset.amount1.mul(params.lastRatio).div(10000);
                    balances[asset.token0] = (balances[asset.token0]
                        ? balances[asset.token0].add(amount0)
                        : amount0).add(asset.fee0);
                    balances[asset.token1] = (balances[asset.token1]
                        ? balances[asset.token1].add(amount1)
                        : amount1).add(asset.fee1);
                }
            }
            if (params.minPriority.gt(ethers.constants.Zero))
                break;
        }
        const paths = [];
        for (const token of fund.allowedTokens) {
            const balance = balances[token] || ethers.constants.Zero;
            if (balance.eq(ethers.constants.Zero) ||
                isEqualAddress(token, fund.underlyingToken)) {
                paths.push('0x');
                continue;
            }
            const trade = await exactInputPath(token, fund.underlyingToken, balance, this.chainId, this.signer);
            if (trade.path === '0x') {
                paths.push(this.fallbackPath(token, fund.underlyingToken));
            }
            else {
                paths.push(trade.path);
            }
        }
        params.paths = paths;
        return params;
    }
    async executeSellFund(percentage, maker, overrides) {
        maker ||= await getAddressFromSigner(this.signer);
        const params = await this.getSellParams(percentage);
        try {
            return await sendTransaction(this.fundProxyAddress, FundProxyABI, 'sell', [this.fundAddress, maker, Math.round(percentage * 100), params], overrides, this.signer);
        }
        catch (e) {
            if (e.message.includes('FM31')) {
                // sell to litte
                this.mergePercentage += 1;
                return await this.executeSellFund(percentage, maker, overrides);
            }
            else if (e.message.includes('FM32')) {
                // sell to much
                this.mergePercentage -= 1;
                return await this.executeSellFund(percentage, maker, overrides);
            }
            else {
                throw e;
            }
        }
    }
}
