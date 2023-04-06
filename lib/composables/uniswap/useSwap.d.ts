import { BigNumber, Overrides, Signer } from 'ethers';
export type SwapParams = {
    opType: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: BigNumber;
    amountOut: BigNumber;
    useNative: boolean;
    expiration: number;
};
export declare class UniswapSwap {
    readonly chainId: number;
    readonly signer: Signer;
    readonly wethAddress: string;
    readonly swapRouterAddress: string;
    readonly fundManagerAddress: string;
    constructor(chainId: number, signer: Signer);
    executeSwap(maker: string, fundAddress: string, params: SwapParams, overrides?: Overrides): Promise<any>;
    exactInputCalldata(params: SwapParams, recipient: string): Promise<string>;
    exactOutPutCalldata(params: SwapParams, recipient: string): Promise<string>;
    approveToken(maker: string, fundAddress: string, params: any, overrides?: Overrides): Promise<any>;
    approveTokenCalldata(): string;
    calcEthAmount(params: SwapParams): BigNumber;
    calcRecipient(params: SwapParams, recipient: string): string;
    encodeCalldata(abi: any, method: string, params: any): string;
}
