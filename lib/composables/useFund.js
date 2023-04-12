import { FundViewerABI, FundViewerAddress } from "../constants";
import { useContract } from "./useContract";
export class Fund {
    chainId;
    signer;
    fundViewerAddress;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        this.fundViewerAddress = FundViewerAddress[chainId];
    }
    async getFunndInfo(fundAddress, withLP, lpAddress) {
        if (!lpAddress) {
            lpAddress = await this.signer.getAddress();
        }
        return await useContract(this.fundViewerAddress, FundViewerABI, this.signer).getFundData(fundAddress, lpAddress, withLP);
    }
    async getFundAssets(fundAddress) {
        const assets = await this.getFunndInfo(fundAddress, true);
        return { tokenBalances: assets.tokenBalances, lpTokens: assets.lpTokens };
    }
}
