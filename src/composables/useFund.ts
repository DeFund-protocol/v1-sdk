import { BigNumber, Overrides, Signer, constants } from 'ethers';
import {
  FundManagerABI,
  FundManagerAddress,
  FundViewerABI,
  FundViewerAddress
} from '../constants';
import { useContract, useEncodeFuncData } from './useContract';
import { getAddressFromSigner, sendTransaction } from './useWeb3';
import { SwapParams } from './uniswap/useSwap';
import { Uniswap } from './uniswap';
import {
  ConvertParams,
  executeAssetsConvert,
  executeAssetsConvertWithSlippage
} from './uniswap/useAssetsConvert';
import { LpParams } from './uniswap/useLiquidityPool';

export class Fund {
  readonly chainId: number;
  readonly signer: Signer;
  readonly fundAddress: string;
  readonly fundManagerAddress: string;
  readonly fundViewerAddress: string;

  constructor(chainId: number, signer: Signer, fundAddress: string) {
    this.chainId = chainId;
    this.signer = signer;
    this.fundAddress = fundAddress;
    this.fundManagerAddress = FundManagerAddress[chainId];
    this.fundViewerAddress = FundViewerAddress[chainId];
  }

  async getFunndInfo(withLP: boolean, lpAddress?: string) {
    if (!lpAddress) {
      lpAddress = await this.signer.getAddress();
    }

    return await useContract(
      this.fundViewerAddress,
      FundViewerABI,
      this.signer
    ).getFundData(this.fundAddress, lpAddress, withLP);
  }

  async getFundAssets() {
    const assets = await this.getFunndInfo(true);

    return {
      tokenBalances: assets.tokenBalances,
      lpTokens: assets.lpTokens
    };
  }

  async executeSwap(
    maker: string,
    fundAddress: string,
    params: SwapParams,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    return await new Uniswap(this.chainId, this.signer).executeSwap(
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
    return await new Uniswap(this.chainId, this.signer).executeLP(
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
    return await new Uniswap(this.chainId, this.signer).executeAssetsConvert(
      maker,
      fundAddress,
      params,
      refundGas,
      overrides
    );
  }

  /*
   * helper methods
   */
  async executeOrder(
    target: string,
    calldata: string,
    ethAmount?: BigNumber,
    maker?: string,
    refundGas?: boolean,
    overrides?: Overrides
  ) {
    ethAmount ||= constants.Zero;
    maker ||= await getAddressFromSigner(this.signer);
    refundGas ||= false;

    const executeParams = [
      this.fundAddress,
      target,
      calldata,
      ethAmount,
      maker,
      refundGas
    ];

    return await sendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'executeOrder',
      executeParams,
      overrides,
      this.signer
    );
  }

  executeOrderCallData(
    target: string,
    calldata: string,
    ethAmount?: BigNumber,
    maker?: string,
    refundGas?: boolean
  ): string {
    const executeParams = [
      this.fundAddress,
      target,
      calldata,
      ethAmount,
      maker,
      refundGas
    ];

    return useEncodeFuncData(FundManagerABI, 'executeOrder', executeParams);
  }

  async executeMulticall(executeParams: any[], overrides?: Overrides) {
    return await sendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'multicall',
      [executeParams],
      overrides,
      this.signer
    );
  }

  executeMulticallCalldata() {}
}
