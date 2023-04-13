import { BigNumber, Overrides, Signer } from 'ethers';
export type ApproveParams = {
    opType: string;
    token: string;
    amount?: BigNumber;
};
declare const approveToken: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: ApproveParams, refundGas?: boolean, overrides?: Overrides) => Promise<any>;
declare const approveTokenMulticallCalldata: (chainId: number, signer: Signer, maker: string, fundAddress: string, params: ApproveParams, refundGas?: boolean) => Promise<string>;
declare const tokenNeedApprove: (signer: Signer, tokenAddress: string, fundAddress: string, spender: string, amount: BigNumber) => Promise<boolean>;
export { approveToken, approveTokenMulticallCalldata, tokenNeedApprove };
