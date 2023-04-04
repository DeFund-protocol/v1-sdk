import { BigNumber, Signer } from 'ethers';
export type SwapParams = {
    opType: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: BigNumber;
    amountOut: BigNumber;
    useNative: boolean;
    expiration: number;
};
export type SwapOptions = {
    gasPrice?: number;
    gasLimit?: BigNumber;
};
declare const useExecuteSwap: (maker: string, fundAddress: string, params: SwapParams, options: SwapOptions, chainId: number, signer: Signer) => Promise<any[]>;
export { useExecuteSwap };
