import { BigNumber, Overrides, Signer } from 'ethers';
export interface LpParams {
    opType: string;
    tokenA: string;
    tokenB: string;
    fee: number;
    amountA?: BigNumber;
    amountB?: BigNumber;
    useNative?: boolean;
    lowerPrice?: string;
    upperPrice?: string;
    lowerTick?: string;
    upperTick?: string;
    tokenId?: number;
    percent?: number;
    expiration?: number;
}
declare const executeLP: (chainId: number, signer: Signer, maker: string, recipient: string, params: LpParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
export { executeLP };
