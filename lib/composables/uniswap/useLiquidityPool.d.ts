import { BigNumber, Overrides, Signer } from 'ethers';
import { SwapParams } from './useSwap';
export type baseLiquidityParams = {
    opType: string;
    tokenA: string;
    tokenB: string;
    fee: number;
    expiration?: number;
};
export type addLiquidityParams = baseLiquidityParams & {
    amountA: BigNumber;
    amountB: BigNumber;
    slippage: number;
    useNative: boolean;
    lowerPrice?: number;
    upperPrice?: number;
    lowerTick?: number;
    upperTick?: number;
    tokenId?: number;
    expiration?: number;
};
export type removeLiquidityParams = baseLiquidityParams & {
    tokenId: number;
    percent?: number;
    useNative: boolean;
};
export type collectFeeParams = baseLiquidityParams & {
    tokenId: number;
};
export type rebalanceParams = {
    opType: string;
    removeData: removeLiquidityParams;
    swapData?: SwapParams;
    addData: addLiquidityParams;
    expiration?: number;
};
export type LpParams = addLiquidityParams | removeLiquidityParams | collectFeeParams | rebalanceParams;
declare const executeLP: (chainId: number, signer: Signer, maker: string, recipient: string, params: LpParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
export { executeLP };
