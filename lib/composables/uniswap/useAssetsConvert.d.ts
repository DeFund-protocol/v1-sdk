import { Overrides, Signer } from 'ethers';
export type ConvertParams = {
    ratio: number;
    slippage: number;
    tokenIn: string;
    tokenOut: string;
    useNative: boolean;
    expiration?: number;
};
declare const executeAssetsConvert: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
declare const executeAssetsConvertWithSlippage: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
export { executeAssetsConvert, executeAssetsConvertWithSlippage };
