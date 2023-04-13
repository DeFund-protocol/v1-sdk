import { BigNumber, Overrides, Signer } from 'ethers';
export type SwapParams = {
    opType: string;
    tokenIn: string;
    tokenOut: string;
    amountIn?: BigNumber;
    amountOut?: BigNumber;
    slippage: number;
    useNative: boolean;
    expiration?: number;
};
declare const executeSwap: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
declare const swapMulticallCalldata: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean) => Promise<string>;
export { executeSwap, swapMulticallCalldata };
