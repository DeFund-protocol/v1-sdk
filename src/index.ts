import { Overrides, Signer } from 'ethers';
import { SwapParams, UniswapSwap } from './composables';
import {
  ConvertParams,
  FundAssetConvert
} from './composables/useAssetsConvert';
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
    overrides?: Overrides
  ) {
    return await new UniswapSwap(this.chainId, this.signer).executeSwap(
      maker,
      fundAddress,
      params,
      overrides
    );
  }

  async executeAssetsConvert(
    maker: string,
    fundAddress: string,
    params: ConvertParams,
    overrides?: Overrides
  ) {
    if (params.slippage) {
      return await new FundAssetConvert(
        this.chainId,
        this.signer
      ).executeAssetsConvertWithSlippage(maker, fundAddress, params, overrides);
    } else {
      return await new FundAssetConvert(
        this.chainId,
        this.signer
      ).executeAssetsConvert(maker, fundAddress, params, overrides);
    }
  }

  async getFundInfo(fundAddress: string, lpAddress?: string, withLP = true) {
    return await new Fund(this.chainId, this.signer).getFunndInfo(fundAddress,withLP, lpAddress)
  }

  async getFundAssets(fundAddress: string) {
    return await new Fund(this.chainId, this.signer).getFundAssets(fundAddress)
  }
}
