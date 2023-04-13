import { Overrides, Signer } from 'ethers';
import {
  NonfungiblePositionManagerAddress,
  SwapRouter02Address
} from '../../constants';
import { SwapParams, executeSwap } from './useSwap';
import { LpParams, executeLP } from './useLiquidityPool';
import {
  ConvertParams,
  executeAssetsConvert,
  executeAssetsConvertWithSlippage
} from './useAssetsConvert';

export { SwapParams, LpParams, ConvertParams };

export class Uniswap {
  readonly chainId: number;
  readonly signer: Signer;
  readonly swapRouter02Address: string;
  readonly positionManagerAddress: string;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;
    this.swapRouter02Address = SwapRouter02Address[chainId];
    this.positionManagerAddress = NonfungiblePositionManagerAddress[chainId];
  }

  async executeSwap(
    maker: string,
    fundAddress: string,
    params: SwapParams,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    params.expiration = this.executeExpiration(params);

    return await executeSwap(
      this.chainId,
      this.signer,
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
    params.expiration = this.executeExpiration(params);

    return await executeLP(
      this.chainId,
      this.signer,
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
    params.expiration = this.executeExpiration(params);

    if (params.slippage) {
      return await executeAssetsConvertWithSlippage(
        this.chainId,
        this.signer,
        maker,
        fundAddress,
        params,
        refundGas,
        overrides
      );
    } else {
      return await executeAssetsConvert(
        this.chainId,
        this.signer,
        maker,
        fundAddress,
        params,
        refundGas,
        overrides
      );
    }
  }

  executeExpiration(params: SwapParams | ConvertParams | LpParams) {
    if (params.expiration) return params.expiration;
    return Math.round(new Date().getTime() / 1000 + 10 * 60);
  }
}
