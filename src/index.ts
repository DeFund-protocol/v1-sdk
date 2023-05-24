import { Overrides, Signer } from 'ethers';
import { SwapParams } from './composables';
import { ApproveParams } from './composables/uniswap/useApproveToken';
import { ConvertParams } from './composables/uniswap/useAssetsConvert';
import { LpParams } from './composables/uniswap/useLiquidityPool';
import { Fund } from './composables/useFund';

export class UniversalSDK {
  readonly chainId: number;
  readonly signer: Signer;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;

    if (!this.signer.provider) throw new Error('invalid signer or provider');
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
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    return await this.fund(fundAddress).executeApproveToken(
      params,
      maker,
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
