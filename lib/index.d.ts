import { Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
import { LpParams } from './composables/uniswap/useLiquidityPool';
import { ConvertParams } from './composables/uniswap/useAssetsConvert';
import { Fund } from './composables/useFund';
export declare class UniversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeLP(maker: string, fundAddress: string, params: LpParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    getFundInfo(fundAddress: string, lpAddress?: string, withAssets?: boolean): Promise<any>;
    getFundAssets(fundAddress: string): Promise<{
        tokenBalances: any[];
        lpTokens: any[];
    }>;
    fund(fundAddress: string): Fund;
}
