import { Overrides, Signer } from 'ethers';
import { SwapParams } from './useSwap';
import { LpParams } from './useLiquidityPool';
import { ConvertParams } from './useAssetsConvert';
export { SwapParams, LpParams, ConvertParams };
export declare class Uniswap {
    readonly chainId: number;
    readonly signer: Signer;
    readonly swapRouter02Address: string;
    readonly positionManagerAddress: string;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeLP(maker: string, fundAddress: string, params: LpParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeExpiration(params: SwapParams | ConvertParams | LpParams): number;
}
