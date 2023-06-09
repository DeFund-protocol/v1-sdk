import { BigNumber, Overrides, Signer } from 'ethers';
import { ConvertParams } from './uniswap/useAssetsConvert';
import { LpParams } from './uniswap/useLiquidityPool';
import { SwapParams } from './uniswap/useSwap';
export declare class Fund {
    readonly chainId: number;
    readonly signer: Signer;
    readonly fundAddress: string;
    readonly fundManagerAddress: string;
    readonly fundViewerAddress: string;
    constructor(chainId: number, signer: Signer, fundAddress: string);
    getFunndInfo(withLP: boolean, lpAddress?: string): Promise<any>;
    getFundAssets(): Promise<{
        tokenBalances: any[];
        lpTokens: any[];
    }>;
    executeSwap(maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeLP(maker: string, fundAddress: string, params: LpParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeOrder(target: string, calldata: string, ethAmount?: BigNumber, maker?: string, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeOrderCallData(target: string, calldata: string, ethAmount?: BigNumber, maker?: string, refundGas?: boolean): string;
    executeMulticall(executeParams: any[], overrides?: Overrides): Promise<any>;
    executeMulticallCalldata(): void;
}
