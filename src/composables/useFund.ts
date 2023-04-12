import { Signer } from "ethers";
import { FundViewerABI, FundViewerAddress } from "../constants";
import { useContract } from "./useContract";

export class Fund {
    readonly chainId: number;
    readonly signer: Signer;
    readonly fundViewerAddress: string;

    constructor(chainId: number, signer: Signer) {
        this.chainId = chainId;
        this.signer = signer;
        this.fundViewerAddress = FundViewerAddress[chainId];
    }

    async getFunndInfo(fundAddress: string, withLP: boolean, lpAddress?: string) {
        if(!lpAddress) {
            lpAddress = await this.signer.getAddress()
        }

        return await useContract(this.fundViewerAddress, FundViewerABI, this.signer).getFundData(fundAddress, lpAddress, withLP)
    }

    async getFundAssets(fundAddress: string) {
        const assets = await this.getFunndInfo(fundAddress, true);

        return {tokenBalances: assets.tokenBalances, lpTokens: assets.lpTokens}
    }
}