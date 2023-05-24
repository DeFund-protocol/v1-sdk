import { BigNumber, Overrides, Signer, constants } from 'ethers';
import { SwapParams } from './composables';
import { ApproveParams, tokenNeedApprove } from './composables/uniswap/useApproveToken';
import { ConvertParams } from './composables/uniswap/useAssetsConvert';
import { LpParams } from './composables/uniswap/useLiquidityPool';
import { useContract } from './composables/useContract';
import { Fund } from './composables/useFund';
import { sendTransaction } from './composables/useWeb3';
import { ERC20ABI, FundViewerABI, FundViewerAddress } from './constants/contract';

export enum Role {
  MANAGER = 1,
  OPERATOR = 2,
  INVESTOR = 3,
  INVITED = 4
}

export class UniversalSDK {
  readonly chainId: number;
  readonly signer: Signer;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;

    if (!this.signer.provider) throw new Error('invalid signer or provider');
  }

  async getFundList(maker: string, role: Role) {
    const viewer = useContract(FundViewerAddress[this.chainId], FundViewerABI, this.signer);
    return await viewer.getFundsData(maker, role, false);
  }

  async executeSwap(
    maker: string,
    fundAddress: string,
    params: SwapParams,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeSwap(
      maker,
      fundAddress,
      params,
      refundGas,
      overrides
    );
  }

  async executeLP(
    maker: string,
    fundAddress: string,
    params: LpParams,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeLP(
      maker,
      fundAddress,
      params,
      refundGas,
      overrides
    );
  }

  async executeAssetsConvert(
    maker: string,
    fundAddress: string,
    params: ConvertParams,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeAssetsConvert(
      maker,
      fundAddress,
      params,
      refundGas,
      overrides
    );
  }

  async executeApproveToken(
    maker: string,
    fundAddress: string,
    params: ApproveParams,
    overrides?: Overrides
  ) {

    const needApprove = tokenNeedApprove(this.signer, params.token, fundAddress, fundAddress, params.amount || constants.Zero);
    if (!needApprove) return;

    const approveParams = [fundAddress, params.amount || constants.MaxInt256]
    return await sendTransaction(
      params.token,
      ERC20ABI,
      'approve',
      approveParams,
      overrides,
      this.signer
    );
  }

  async executeBuyFund(
    maker: string,
    fundAddress: string,
    amount: BigNumber,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeBuyFund(
      amount,
      maker,
      overrides
    );
  }

  async executeSellFund(
    maker: string,
    fundAddress: string,
    percentage: number,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeSellFund(
      percentage,
      maker,
      overrides
    );
  }

  async getFundInfo(
    fundAddress: string,
    lpAddress?: string,
    withAssets = true
  ) {
    return await this.fund(fundAddress).getFunndInfo(withAssets, lpAddress);
  }

  async getFundAssets(fundAddress: string) {
    return await this.fund(fundAddress).getFundAssets();
  }

  async getFundInvestors(fundAddress: string, page = 0, pageSize = 100) {
    return await this.fund(fundAddress).getFundInvistors(page, pageSize);
  }

  fund(fundAddress: string) {
    return new Fund(this.chainId, this.signer, fundAddress);
  }
}
