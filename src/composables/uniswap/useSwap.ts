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
  amountIn: BigNumber;
  amountOut: BigNumber;
  useNative: boolean;
  expiration: number;
}

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
    overrides?: Overrides
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
        throw new Error(`Invalid opType: ${params.opType}`)
    }

    // execute
    const executeParams = [
      fundAddress,
      this.swapRouterAddress,
      calldata,
      ethAmount,
      maker,
      true,
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
    const path = await exactInputPath(
      params.tokenIn,
      params.tokenOut,
      params.amountIn,
      this.chainId,
      this.signer,
    );

    const swapParams = {
      recipient: this.calcRecipient(params, recipient),
      path: path.path,
      amountIn: params.amountIn,
      amountOutMinimum: params.amountOut,
    };

    const calldata = this.encodeCalldata(SwapRouter02ABI, 'exactInput', [swapParams]);
    if (!params.useNative) return calldata;
    if (!isEqualAddress(params.tokenOut, this.wethAddress)) return calldata;

    const unwrap = this.encodeCalldata(
      SwapRouter02ABI,
      'unwrapWETH9(uint256,address)',
      [params.amountOut, recipient],
    );

    return this.encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
      params.expiration,
      [calldata, unwrap],
    ]);
  }

  async exactOutPutCalldata(params: SwapParams, recipient: string) {
    const path = await exactOutputPath(
      params.tokenIn,
      params.tokenOut,
      params.amountOut,
      this.chainId,
      this.signer
    );

    const swapParams = {
      recipient: this.calcRecipient(params, recipient),
      path: path.path,
      amountOut: params.amountOut,
      amountInMaximum: params.amountIn,
    };

    const output = this.encodeCalldata(SwapRouter02ABI, 'exactOutput', [swapParams]);

    if (!params.useNative) return output;

    switch (true) {
      case isEqualAddress(params.tokenIn, this.wethAddress):
        const refund = this.encodeCalldata(SwapRouter02ABI, 'refundETH()', []);
        return this.encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
          params.expiration,
          [output, refund],
        ]);
      case isEqualAddress(params.tokenOut, this.wethAddress):
        const unwrap = this.encodeCalldata(
          SwapRouter02ABI,
          'unwrapWETH9(uint256,address)',
          [params.amountOut, recipient],
        );

        return this.encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
          params.expiration,
          [output, unwrap],
        ]);
      default:
        return output;
    }
  }

  async approveToken(
    maker: string,
    fundAddress: string,
    params: any,
    overrides?: Overrides,
  ) {
    const contract = useContract(params.token, ERC20ABI, this.signer);
    const allowance = await contract.allowance(fundAddress, this.swapRouterAddress);

    if (allowance.gte(constants.MaxUint256)) return [{}, null, null];

    const calldata = this.approveTokenCalldata();

    // execute
    const executeParams = [
      fundAddress,
      params.token,
      calldata,
      0,
      maker,
      true, // refund gas from fund
    ];

    return await SendTransaction(
      this.fundManagerAddress,
      FundManagerABI,
      'executeOrder',
      executeParams,
      overrides,
      this.signer
    );
  };

  approveTokenCalldata() {
    return this.encodeCalldata(ERC20ABI, 'approve', [
      this.swapRouterAddress,
      constants.MaxUint256,
    ]);
  };

  calcEthAmount(params: SwapParams) {
    if (!params.useNative) return constants.Zero;
    if (!isEqualAddress(params.tokenIn, this.wethAddress)) return constants.Zero;
    return params.amountIn;
  };

  calcRecipient(params: SwapParams, recipient: string) {
    if (!params.useNative) return recipient;
    if (!isEqualAddress(params.tokenOut, this.wethAddress)) return recipient;

    return NativeETHAddress;
  };

  encodeCalldata(abi: any, method: string, params: any) {
    return useEncodeFuncData(abi, method, params);
  };
}