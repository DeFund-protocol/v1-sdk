import { constants } from 'ethers';
import { tokenNeedApprove } from './composables/uniswap/useApproveToken';
import { useContract } from './composables/useContract';
import { Fund } from './composables/useFund';
import { sendTransaction } from './composables/useWeb3';
import { ERC20ABI, FundViewerABI, FundViewerAddress } from './constants/contract';
export var Role;
(function (Role) {
    Role[Role["MANAGER"] = 1] = "MANAGER";
    Role[Role["OPERATOR"] = 2] = "OPERATOR";
    Role[Role["INVESTOR"] = 3] = "INVESTOR";
    Role[Role["INVITED"] = 4] = "INVITED";
})(Role || (Role = {}));
export class UniversalSDK {
    chainId;
    signer;
    constructor(chainId, signer) {
        this.chainId = chainId;
        this.signer = signer;
        if (!this.signer.provider)
            throw new Error('invalid signer or provider');
    }
    async getFundList(maker, role) {
        const viewer = useContract(FundViewerAddress[this.chainId], FundViewerABI, this.signer);
        return await viewer.getFundsData(maker, role, false);
    }
    async executeSwap(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeSwap(maker, fundAddress, params, refundGas, overrides);
    }
    async executeLP(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeLP(maker, fundAddress, params, refundGas, overrides);
    }
    async executeAssetsConvert(maker, fundAddress, params, refundGas, overrides) {
        return await this.fund(fundAddress).executeAssetsConvert(maker, fundAddress, params, refundGas, overrides);
    }
    async executeApproveToken(maker, fundAddress, params, overrides) {
        const needApprove = tokenNeedApprove(this.signer, params.token, fundAddress, fundAddress, params.amount || constants.Zero);
        if (!needApprove)
            return;
        const approveParams = [fundAddress, params.amount || constants.MaxInt256];
        return await sendTransaction(params.token, ERC20ABI, 'approve', approveParams, overrides, this.signer);
    }
    async executeBuyFund(maker, fundAddress, amount, overrides) {
        return await this.fund(fundAddress).executeBuyFund(amount, maker, overrides);
    }
    async executeSellFund(maker, fundAddress, percentage, overrides) {
        return await this.fund(fundAddress).executeSellFund(percentage, maker, overrides);
    }
    async getFundInfo(fundAddress, lpAddress, withAssets = true) {
        return await this.fund(fundAddress).getFunndInfo(withAssets, lpAddress);
    }
    async getFundAssets(fundAddress) {
        return await this.fund(fundAddress).getFundAssets();
    }
    async getFundInvestors(fundAddress, page = 0, pageSize = 100) {
        return await this.fund(fundAddress).getFundInvistors(page, pageSize);
    }
    fund(fundAddress) {
        return new Fund(this.chainId, this.signer, fundAddress);
    }
}
