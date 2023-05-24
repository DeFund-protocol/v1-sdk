import { Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
import { LpParams } from './composables/uniswap/useLiquidityPool';
import { ConvertParams } from './composables/uniswap/useAssetsConvert';
import { Fund } from './composables/useFund';
import { useContract } from './composables/useContract',
import { FundViewerABI, FundViewerAddress } from './constants/contract'

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
    const viewr = useContract(FundViewerAddress[this.chainId], FundViewerABI, this.signer);
    return await viewr.getFundsData(maker, role, false);
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

  fund(fundAddress: string) {
    return new Fund(this.chainId, this.signer, fundAddress);
  }
}
