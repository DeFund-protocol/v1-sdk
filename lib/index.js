import { UniswapSwap } from './composables';
import { FundAssetConvert } from './composables/useAssetsConvert';
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
    async executeSwap(maker, fundAddress, params, overrides) {
        return await new UniswapSwap(this.chainId, this.signer).executeSwap(maker, fundAddress, params, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, overrides) {
        if (params.slippage) {
            return await new FundAssetConvert(this.chainId, this.signer).executeAssetsConvertWithSlippage(maker, fundAddress, params, overrides);
        }
        else {
            return await new FundAssetConvert(this.chainId, this.signer).executeAssetsConvert(maker, fundAddress, params, overrides);
        }
    }
    async getFundInfo(fundAddress, lpAddress, withLP = true) {
        return await new Fund(this.chainId, this.signer).getFunndInfo(fundAddress, withLP, lpAddress);
    }
    async getFundAssets(fundAddress) {
        return await new Fund(this.chainId, this.signer).getFundAssets(fundAddress);
    }
}
