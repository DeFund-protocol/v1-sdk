import { BigNumber, Overrides, Signer, constants } from 'ethers';
import {
  ERC20ABI,
  FundManagerABI,
  FundManagerAddress,
  SwapRouter02ABI,
  SwapRouterAddress
} from '../../constants/contract';
import { NativeETHAddress, WethAddress } from '../../constants/token';
import { useContract, useEncodeFuncData } from '../useContract';
import { isEqualAddress } from '../useUtils';
import { SendTransaction } from '../useWeb3';
import { exactInputPath, exactOutputPath } from './usePathFinder';

export type SwapParams = {
  opType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn?: BigNumber;
  amountOut?: BigNumber;
  slippage: number;
  useNative: boolean;
  expiration?: number;
};

export class UniswapSwap {
  readonly chainId: number;
  readonly signer: Signer;
  readonly wethAddress: string;
  readonly swapRouterAddress: string;
  readonly fundManagerAddress: string;

  constructor(chainId: number, signer: Signer) {
    this.chainId = chainId;
    this.signer = signer;
    this.wethAddress = WethAddress[chainId];
    this.swapRouterAddress = SwapRouterAddress[chainId];
    this.fundManagerAddress = FundManagerAddress[chainId];
  }

  async executeSwap(
    maker: string,
    fundAddress: string,
    params: SwapParams,
    overrides?: Overrides,
    refundGas = false
  ) {
    const ethAmount = this.calcEthAmount(params);

    let calldata: string;
    switch (params.opType) {
      case 'approveToken':
        return await this.approveToken(maker, fundAddress, params, overrides);
      case 'exactInput':
        calldata = await this.exactInputCalldata(params, fundAddress);
        break;
      case 'exactOutput':
        calldata = await this.exactOutPutCalldata(params, fundAddress);
        break;
      default:
        throw new Error(`Invalid opType: ${params.opType}`);
    }

    // execute
    const executeParams = [
      fundAddress,
      this.swapRouterAddress,
      calldata,
      ethAmount,
      maker,
      refundGas
    ];

    return await SendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'executeOrder',
      executeParams,
      overrides,
      this.signer
    );
  }

  async exactInputCalldata(params: SwapParams, recipient: string) {
    if (!params.amountIn) throw new Error('Invalid amountIn');

    const trade = await exactInputPath(
      params.tokenIn,
      params.tokenOut,
      params.amountIn,
      this.chainId,
      this.signer
    );

    const swapParams = {
      recipient: this.calcRecipient(params, recipient),
      path: trade.path,
      amountIn: params.amountIn,
      amountOutMinimum: this.calcAmountOutMinimum(
        trade.expectedAmount,
        params.slippage
      )
    };

    const calldata = this.encodeCalldata(SwapRouter02ABI, 'exactInput', [
      swapParams
    ]);
    if (!params.useNative) return calldata;
    if (!isEqualAddress(params.tokenOut, this.wethAddress)) return calldata;

    const unwrap = this.encodeCalldata(
      SwapRouter02ABI,
      'unwrapWETH9(uint256,address)',
      [params.amountOut, recipient]
    );

    return this.encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
      this.swapExpiration(params),
      [calldata, unwrap]
    ]);
  }

  async exactOutPutCalldata(params: SwapParams, recipient: string) {
    if (!params.amountOut) throw new Error('Invalid amountOut');

    const trade = await exactOutputPath(
      params.tokenIn,
      params.tokenOut,
      params.amountOut,
      this.chainId,
      this.signer
    );

    const swapParams = {
      recipient: this.calcRecipient(params, recipient),
      path: trade.path,
      amountOut: params.amountOut,
      amountInMaximum: this.calcAmountInMaximum(
        trade.expectedAmount,
        params.slippage
      )
    };

    const output = this.encodeCalldata(SwapRouter02ABI, 'exactOutput', [
      swapParams
    ]);

    if (!params.useNative) return output;

    switch (true) {
      case isEqualAddress(params.tokenIn, this.wethAddress):
        const refund = this.encodeCalldata(SwapRouter02ABI, 'refundETH()', []);
        return this.encodeCalldata(
          SwapRouter02ABI,
          'multicall(uint256,bytes[])',
          [this.swapExpiration(params), [output, refund]]
        );
      case isEqualAddress(params.tokenOut, this.wethAddress):
        const unwrap = this.encodeCalldata(
          SwapRouter02ABI,
          'unwrapWETH9(uint256,address)',
          [params.amountOut, recipient]
        );

        return this.encodeCalldata(
          SwapRouter02ABI,
          'multicall(uint256,bytes[])',
          [this.swapExpiration(params), [output, unwrap]]
        );
      default:
        return output;
    }
  }

  async approveToken(
    maker: string,
    fundAddress: string,
    params: any,
    overrides?: Overrides,
    refundGas = false
  ) {
    const contract = useContract(params.token, ERC20ABI, this.signer);
    const allowance = await contract.allowance(
      fundAddress,
      this.swapRouterAddress
    );

    if (allowance.gte(constants.MaxUint256)) return [{}, null, null];

    const calldata = this.approveTokenCalldata();

    // execute
    const executeParams = [
      fundAddress,
      params.token,
      calldata,
      0,
      maker,
      refundGas
    ];

    return await SendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'executeOrder',
      executeParams,
      overrides,
      this.signer
    );
  }

  approveTokenCalldata() {
    return this.encodeCalldata(ERC20ABI, 'approve', [
      this.swapRouterAddress,
      constants.MaxUint256
    ]);
  }

  swapExpiration(params: SwapParams) {
    params?.expiration || Math.round(new Date().getTime() / 1000 + 10 * 60);
  }

  calcEthAmount(params: SwapParams) {
    if (!params.useNative) return constants.Zero;
    if (!isEqualAddress(params.tokenIn, this.wethAddress))
      return constants.Zero;
    return params.amountIn;
  }

  calcRecipient(params: SwapParams, recipient: string) {
    if (!params.useNative) return recipient;
    if (!isEqualAddress(params.tokenOut, this.wethAddress)) return recipient;

    return NativeETHAddress;
  }

  calcAmountInMaximum(expectedAmount: BigNumber, slippage: number) {
    return expectedAmount
      .mul(BigNumber.from(1e4).add(BigNumber.from(slippage * 100)))
      .div(BigNumber.from(1e4));
  }

  calcAmountOutMinimum(expectedAmount: BigNumber, slippage: number) {
    return expectedAmount
      .mul(BigNumber.from(1e4))
      .div(BigNumber.from(1e4).add(BigNumber.from(slippage * 100)));
  }

  encodeCalldata(abi: any, method: string, params: any) {
    return useEncodeFuncData(abi, method, params);
  }
}
