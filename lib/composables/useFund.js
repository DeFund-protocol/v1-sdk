import { constants } from 'ethers';
import { FundManagerABI, FundManagerAddress, FundProxyABI, FundProxyAddress, FundViewerABI, FundViewerAddress } from '../constants';
import { WethAddress } from '../constants/token';
import { Uniswap } from './uniswap';
import { useContract, useEncodeFuncData } from './useContract';
import { formatDetailData } from './useUtils';
import { getAddressFromSigner, sendTransaction } from './useWeb3';
export class Fund {
    chainId;
    signer;
    fundAddress;
    fundManagerAddress;
    fundProxyAddress;
    fundViewerAddress;
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
    async executeBuyFund(amount, maker, overrides) {
        amount ||= constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        const fundInfo = await this.getFunndInfo(true);
        if (WethAddress[this.chainId] === fundInfo.underlyingToken) {
            overrides ||= {};
            overrides.value = amount;
        }
        const executeParams = [this.fundAddress, amount];
        return await sendTransaction(this.fundManagerAddress, FundManagerABI, 'buy', executeParams, overrides, this.signer);
    }
    async executeSellFund(amount, maker, overrides) {
        amount ||= constants.Zero;
        maker ||= await getAddressFromSigner(this.signer);
        const fundInfo = await this.getFunndInfo(true);
        if (WethAddress[this.chainId] === fundInfo.underlyingToken) {
            overrides ||= {};
            overrides.value = amount;
        }
        const executeParams = [this.fundAddress, amount];
        return await sendTransaction(this.fundProxyAddress, FundProxyABI, 'sell', executeParams, overrides, this.signer);
    }
}
