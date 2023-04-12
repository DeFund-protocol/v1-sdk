import { Signer } from "ethers";
export declare class Fund {
    readonly chainId: number;
    readonly signer: Signer;
    readonly fundViewerAddress: string;
    constructor(chainId: number, signer: Signer);
    getFunndInfo(fundAddress: string, withLP: boolean, lpAddress?: string): Promise<any>;
    getFundAssets(fundAddress: string): Promise<{
        tokenBalances: any;
        lpTokens: any;
    }>;
}
