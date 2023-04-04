import { useExecuteSwap } from './composables';
export class UnversalSDK {
    chainId;
    signer;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        if (!this.signer.provider)
            throw new Error('invalid signer or provider');
    }
    async executeSwap(maker, fundAddress, params, options) {
        return await useExecuteSwap(maker, fundAddress, params, options, this.chainId, this.signer);
    }
}
