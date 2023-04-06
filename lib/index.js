import { UniswapSwap } from './composables';
export class UnversalSDK {
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
}
