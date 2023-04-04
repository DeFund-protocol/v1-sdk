import { Signer } from 'ethers';
import { SwapOptions, SwapParams, useExecuteSwap } from './composables';

export class UnversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    
    constructor(chainId: number, signer: Signer) {
        this.chainId = chainId;
        this.signer = signer;

        if (!this.signer.provider) throw new Error('invalid signer or provider')
    }

    async executeSwap(maker: string, fundAddress: string, params: SwapParams, options: SwapOptions) {
        return await useExecuteSwap(maker, fundAddress, params, options, this.chainId, this.signer);
    }
}