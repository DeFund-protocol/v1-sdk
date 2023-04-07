import { Overrides, Signer } from 'ethers';
export type ConvertParams = {
    ratio: number;
    toToken: string;
};
export declare class FundAssetConvert {
    readonly chainId: number;
    readonly signer: Signer;
    readonly wethAddress: string;
    readonly fundManagerAddress: string;
    readonly fundViewerAddress: string;
    constructor(chainId: number, signer: Signer);
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, overrides?: Overrides, refundGas?: boolean): Promise<any>;
    getConvertParams(fundAddress: string, params: any): Promise<any>;
}
