import { BigNumber, constants } from "ethers";
import { FundManagerABI, FundManagerAddress, FundViewerABI, FundViewerAddress } from "../constants";
import { WethAddress } from "../constants/token";
import { exactInputPath, fallbackPath } from "./uniswap/usePathFinder";
import { useContract } from "./useContract";
import { isEqualAddress } from "./useUtils";
import { SendTransaction } from "./useWeb3";
export class FundAssetConvert {
    chainId;
    signer;
    wethAddress;
    fundManagerAddress;
    fundViewerAddress;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        this.wethAddress = WethAddress[chainId];
        this.fundManagerAddress = FundManagerAddress[chainId];
        this.fundViewerAddress = FundViewerAddress[chainId];
    }
    async executeAssetsConvert(maker, fundAddress, params, overrides) {
        const convertParams = await this.getConvertParams(fundAddress, params);
        return await SendTransaction(this.fundManagerAddress, FundManagerABI, 'sellAssets', convertParams, overrides, this.signer);
    }
    async getConvertParams(fundAddress, params) {
        let convertParams = {
            fee: 3000,
            minPriority: 0
        };
        const lpAddress = params.lpAddress || constants.AddressZero;
        const fundData = await useContract(this.fundViewerAddress, FundViewerABI, this.signer).getFundData(fundAddress, lpAddress, true);
        if (!params.tokenIn || isEqualAddress(params.tokenIn, constants.AddressZero)) {
            convertParams['sellType'] = 0;
            convertParams['lastRatio'] = 10000;
        }
        else {
            convertParams['sellType'] = 1;
            convertParams['lastRatio'] = 0;
        }
        const assets = [
            ...fundData.tokenBalances.filter((item) => !isEqualAddress(item.token, fundData.underlyingToken)),
            ...fundData.lpTokens.map((item) => ({ ...item, value: item.amountValue0.add(item.amountValue1) })),
        ].sort((a, b) => b.priority.sub(a.priority));
        const targetToken = fundData.tokenBalances.find((item) => isEqualAddress(item.token, params.tokenOut));
        const groupedAssets = [];
        assets.forEach((item) => {
            const lastGroup = groupedAssets.length > 0 ? groupedAssets[groupedAssets.length - 1] : undefined;
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
        let totalAssetAmount = constants.Zero;
        let assetSellAmount = constants.Zero;
        if (convertParams['sellType'] === '0') {
            assetSellAmount = BigNumber.from(fundData.totalValue).mul(BigNumber.from(params.ration)).div(BigNumber.from(100));
        }
        else {
            assetSellAmount = targetToken.mul(BigNumber.from(params.ratio)).div(BigNumber.from(100));
        }
        const balances = {};
        for (const group of groupedAssets) {
            const value = group.reduce((acc, cur) => {
                return acc.add(cur.value);
            }, constants.Zero);
            if (totalAssetAmount.add(value).gte(assetSellAmount)) {
                const lastAmount = assetSellAmount.sub(totalAssetAmount);
                if (params.ratio !== 100)
                    params.lastRatio = lastAmount.mul(10000).div(value);
                params.minPriority = group[0].priority;
            }
            else {
                totalAssetAmount = totalAssetAmount.add(value);
            }
            for (const asset of group) {
                if (asset.token && asset.balance.eq(constants.Zero))
                    continue;
                if (asset.tokenId && asset.amount0.add(asset.fee0).eq(constants.Zero) && asset.amount1.add(asset.fee1).eq(constants.Zero))
                    continue;
                if (asset.token) {
                    const amount = asset.balance.mul(params.lastRatio).div(10000);
                    balances[asset.token] = balances[asset.token] ? balances[asset.token].add(amount) : amount;
                }
                else {
                    const amount0 = asset.amount0.mul(params.lastRatio).div(10000);
                    const amount1 = asset.amount1.mul(params.lastRatio).div(10000);
                    balances[asset.token0] = (balances[asset.token0] ? balances[asset.token0].add(amount0) : amount0).add(asset.fee0);
                    balances[asset.token1] = (balances[asset.token1] ? balances[asset.token1].add(amount1) : amount1).add(asset.fee1);
                }
            }
            if (params.minPriority.gt(constants.Zero))
                break;
        }
        const paths = [];
        for (const token of fundData.allowedTokens) {
            const balance = balances[token] || constants.Zero;
            if (balance.eq(constants.Zero) || isEqualAddress(token, fundData.underlyingToken)) {
                paths.push('0x');
                continue;
            }
            const trade = await exactInputPath(token, fundData.underlyingToken, balance, this.chainId, this.signer);
            if (trade.path === '0x') {
                paths.push(fallbackPath(token, fundData.underlyingToken, this.chainId));
            }
            else {
                paths.push(trade.path);
            }
        }
        convertParams['paths'] = paths;
        return convertParams;
    }
}
