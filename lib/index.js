import { Fund } from './composables/useFund';
export class UniversalSDK {
    chainId;
    signer;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        if (!this.signer.provider)
            throw new Error('invalid signer or provider');
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeSwap(maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeLP(maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeAssetsConvert(maker, fundAddress, params, refundGas, overrides);
    }
    async executeApproveToken(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeApproveToken(params, maker, refundGas, overrides);
    }
    async getFundInfo(fundAddress, lpAddress, withAssets = true) {
        return await this.fund(fundAddress).getFunndInfo(withAssets, lpAddress);
    }
    async getFundAssets(fundAddress) {
        return await this.fund(fundAddress).getFundAssets();
    }
    fund(fundAddress) {
        return new Fund(this.chainId, this.signer, fundAddress);
    }
}
