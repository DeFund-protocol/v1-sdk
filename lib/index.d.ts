import { Signer } from 'ethers';
import { SwapOptions, SwapParams } from './composables';
export declare class UnversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, options: SwapOptions): Promise<any[]>;
}
