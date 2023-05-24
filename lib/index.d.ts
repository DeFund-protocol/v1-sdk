import { BigNumber, Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
import { ApproveParams } from './composables/uniswap/useApproveToken';
import { ConvertParams } from './composables/uniswap/useAssetsConvert';
import { LpParams } from './composables/uniswap/useLiquidityPool';
import { Fund } from './composables/useFund';
export declare enum Role {
    MANAGER = 1,
    OPERATOR = 2,
    INVESTOR = 3,
    INVITED = 4
}
export declare class UniversalSDK {
    readonly chainId: number;
    readonly signer: Signer;
    constructor(chainId: number, signer: Signer);
    getFundList(maker: string, role: Role): Promise<any>;
    executeSwap(maker: string, fundAddress: string, params: SwapParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeLP(maker: string, fundAddress: string, params: LpParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeAssetsConvert(maker: string, fundAddress: string, params: ConvertParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeApproveToken(maker: string, fundAddress: string, params: ApproveParams, refundGas?: boolean, overrides?: Overrides): Promise<any>;
    executeBuyFund(maker: string, fundAddress: string, amount: BigNumber, overrides?: Overrides): Promise<any>;
    executeSellFund(maker: string, fundAddress: string, percentage: number, overrides?: Overrides): Promise<import("ethers").ContractTransaction>;
    getFundInfo(fundAddress: string, lpAddress?: string, withAssets?: boolean): Promise<any>;
    getFundAssets(fundAddress: string): Promise<{
        tokenBalances: any[];
        lpTokens: any[];
    }>;
    getFundInvestors(fundAddress: string, page?: number, pageSize?: number): Promise<any>;
    fund(fundAddress: string): Fund;
}
