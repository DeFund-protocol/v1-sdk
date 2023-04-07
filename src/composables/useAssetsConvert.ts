import { BigNumber, Overrides, Signer, constants } from 'ethers';
import {
  FundManagerABI,
  FundManagerAddress,
  FundViewerABI,
  FundViewerAddress
} from '../constants';
import { WethAddress } from '../constants/token';
import { exactInputPath, fallbackPath } from './uniswap/usePathFinder';
import { SwapParams, UniswapSwap } from './uniswap/useSwap';
import { useContract } from './useContract';
import { isEqualAddress } from './useUtils';
import { SendTransaction } from './useWeb3';

export type ConvertParams = {
  ratio: number;
  slippage: number;
  tokenIn: string;
  tokenOut: string;
  useNative: boolean;
  expiration?: number;
};

export class FundAssetConvert {
  readonly chainId: number;
  readonly signer: Signer;
  readonly wethAddress: string;
  readonly fundManagerAddress: string;
  readonly fundViewerAddress: string;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;
    this.wethAddress = WethAddress[chainId];
    this.fundManagerAddress = FundManagerAddress[chainId];
    this.fundViewerAddress = FundViewerAddress[chainId];
  }

  async executeAssetsConvert(
    maker: string,
    fundAddress: string,
    params: ConvertParams,
    overrides?: Overrides,
    refundGas = false
  ) {
    const convertParams = await this.getConvertParams(fundAddress, params);
    const executeParams = [fundAddress, convertParams, refundGas];

    return await SendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'sellAssets',
      executeParams,
      overrides,
      this.signer
    );
  }

  async executeAssetsConvertWithSlislippage(
    maker: string,
    fundAddress: string,
    params: ConvertParams,
    overrides?: Overrides,
    refundGas = false
  ) {
    const lpAddress = maker || constants.AddressZero;
    const fundData = await useContract(
      this.fundViewerAddress,
      FundViewerABI,
      this.signer
    ).getFundData(fundAddress, lpAddress, true);
    const tokenIn = fundData.tokenBalances.find((item: any) =>
      isEqualAddress(item.token, params.tokenIn)
    );
    if (!tokenIn) throw new Error('Invalid tokenIn');

    const amountIn = tokenIn.balance
      .mul(BigNumber.from(params.ratio))
      .div(BigNumber.from(1e4));

    const swapParams: SwapParams = {
      opType: 'exactInput',
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: amountIn,
      slippage: params.slippage,
      useNative: params.useNative,
      expiration: params.expiration
    };

    return await new UniswapSwap(this.chainId, this.signer).executeSwap(
      maker,
      fundAddress,
      swapParams,
      overrides,
      refundGas
    );
  }

  async getConvertParams(fundAddress: string, params: any) {
    let convertParams: any = {
      sellType: 1,
      fee: 3000,
      minPriority: BigNumber.from(0),
      lastRatio: BigNumber.from(0),
      underlying: params.tokenOut
    };

    const lpAddress = params.lpAddress || constants.AddressZero;
    const fundData = await useContract(
      this.fundViewerAddress,
      FundViewerABI,
      this.signer
    ).getFundData(fundAddress, lpAddress, true);

    const assets = [
      ...fundData.tokenBalances.filter(
        (item: any) => !isEqualAddress(item.token, fundData.underlyingToken)
      ),
      ...fundData.lpTokens.map((item: any) => ({
        ...item,
        value: item.amountValue0.add(item.amountValue1)
      }))
    ].sort((a: any, b: any) => b.priority.sub(a.priority));
    const tokenIn = fundData.tokenBalances.find((item: any) =>
      isEqualAddress(item.token, params.tokenIn)
    );

    if (tokenIn) {
      convertParams['selectPriority'] = [tokenIn.priority];
      convertParams['selectRatio'] = [params.ratio];

      const paths = [];
      for (let i = 0; i < fundData.allowedTokens.length; i++) {
        if (isEqualAddress(fundData.allowedTokens[i], tokenIn.token)) {
          const trade = await exactInputPath(
            params.tokenIn,
            params.tokenOut,
            tokenIn.balance
              .mul(BigNumber.from(params.ratio))
              .div(BigNumber.from(1e4)),
            this.chainId,
            this.signer
          );
          paths.push(trade.path);
        } else {
          paths.push('0x');
        }
      }
      convertParams['paths'] = paths;

      return convertParams;
    }

    const needValue = fundData.totalValue
      .mul(BigNumber.from(params.ratio))
      .div(BigNumber.from(1e4));
    const selectPriority = [];
    const selectRatio = [];
    let selectedValue = constants.Zero;
    for (let i = 0; i < assets.length; i++) {
      selectPriority.push(assets[i].priority);
      if (selectedValue.gt(needValue)) {
        const leftValue = needValue.sub(selectedValue);
        const ratio = leftValue.mul(1000).div(assets[i].value);
        selectRatio.push(ratio);
        break;
      } else {
        selectRatio.push(1e4);
        selectedValue = selectedValue.add(assets[i].value);
      }
    }

    convertParams['selectPriority'] = selectPriority;
    convertParams['selectRatio'] = selectRatio;

    const balances = {} as any;

    for (const asset of assets) {
      if (asset.token && asset.balance.eq(constants.Zero)) continue;
      if (
        asset.tokenId &&
        asset.amount0.add(asset.fee0).eq(constants.Zero) &&
        asset.amount1.add(asset.fee1).eq(constants.Zero)
      )
        continue;

      if (asset.token) {
        const amount = asset.balance
          .mul(params.lastRatio)
          .div(BigNumber.from(1e4));
        balances[asset.token] = balances[asset.token]
          ? balances[asset.token].add(amount)
          : amount;
      } else {
        const amount0 = asset.amount0
          .mul(params.lastRatio)
          .div(BigNumber.from(1e4));
        const amount1 = asset.amount1
          .mul(params.lastRatio)
          .div(BigNumber.from(1e4));
        balances[asset.token0] = (
          balances[asset.token0] ? balances[asset.token0].add(amount0) : amount0
        ).add(asset.fee0);
        balances[asset.token1] = (
          balances[asset.token1] ? balances[asset.token1].add(amount1) : amount1
        ).add(asset.fee1);
      }
    }

    const paths = [];
    for (const token of fundData.allowedTokens) {
      const balance = balances[token] || constants.Zero;
      if (
        balance.eq(constants.Zero) ||
        isEqualAddress(token, fundData.underlyingToken)
      ) {
        paths.push('0x');
        continue;
      }
      const trade = await exactInputPath(
        token,
        fundData.underlyingToken,
        balance,
        this.chainId,
        this.signer
      );
      if (trade.path === '0x') {
        paths.push(fallbackPath(token, fundData.underlyingToken, this.chainId));
      } else {
        paths.push(trade.path);
      }
    }
    convertParams['paths'] = paths;
    return convertParams;
  }
}
