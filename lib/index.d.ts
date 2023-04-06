import { Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
export declare class UnversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, overrides?: Overrides): Promise<any>;
}
