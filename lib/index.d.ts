import { Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
import { ConvertParams } from './composables/useAssetsConvert';
export declare class UniversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, overrides?: Overrides): Promise<any>;
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, overrides?: Overrides): Promise<any>;
    getFundInfo(fundAddress: string, lpAddress?: string, withLP?: boolean): Promise<any>;
    getFundAssets(fundAddress: string): Promise<{
        tokenBalances: any;
        lpTokens: any;
    }>;
}
