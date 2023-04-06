import { Overrides, Signer } from 'ethers';
import { SwapParams, UniswapSwap } from './composables';

export class UniversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    
    constructor(chainId: number, signer: Signer) {
        this.chainId = chainId;
        this.signer = signer;

        if (!this.signer.provider) throw new Error('invalid signer or provider')
    }

    async executeSwap(maker: string, fundAddress: string, params: SwapParams, overrides?: Overrides) {
        return await new UniswapSwap(this.chainId, this.signer).executeSwap(maker, fundAddress, params, overrides);
    }
}