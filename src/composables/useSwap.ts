import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, Signer, constants } from 'ethers';
import {
  ERC20ABI,
  FundManagerABI,
  FundManagerAddress,
  SwapRouter02ABI,
  SwapRouterAddress,
} from '../constants/contract';
import { NativeETHAddress, WethAddress } from '../constants/token';
import { useContract, useEncodeFuncData } from './useContract';
import { exactInputPath, exactOutputPath } from './usePathFinder';
import { isEqualAddress } from './useUtils';
import { SendTransaction } from './useWeb3';

export type SwapParams = {
  opType: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: BigNumber;
  amountOut: BigNumber;
  useNative: boolean;
  expiration: number;
}

export type SwapOptions = {
  gasPrice?: number;
  gasLimit?: BigNumber;
}

const approveToken = async (
  maker: string,
  fundAddress: string,
  params: any,
  options: any,
  chainId: number,
  signer: Signer,
) => {
  const contract = useContract(params.token, ERC20ABI, signer);
  const allowance = await contract.allowance(fundAddress, SwapRouterAddress);

  if (allowance.gte(constants.MaxUint256)) return [{}, null, null];

  const calldata = approveTokenCalldata();

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
    FundManagerAddress[chainId],
    FundManagerABI,
    'executeOrder',
    executeParams,
    options,
    signer
  );
};

const approveTokenCalldata = () => {
  return encodeCalldata(ERC20ABI, 'approve', [
    SwapRouterAddress,
    constants.MaxUint256,
  ]);
};

const useExecuteSwap = async (
  maker: string,
  fundAddress: string,
  params: SwapParams,
  options: SwapOptions,
  chainId: number,
  signer: Signer
) => {
  const ethAmount = calcEthAmount(params, chainId);

  let calldata: string;
  switch (params.opType) {
    case 'approveToken':
      return await approveToken(maker, fundAddress, params, options, chainId, signer);
    case 'exactInput':
      calldata = await exactInputCalldata(params, fundAddress, chainId, signer);
      break;
    case 'exactOutput':
      calldata = await exactOutPutCalldata(params, fundAddress,chainId, signer);
      break;
    default:
      throw new Error(`Invalid opType: ${params.opType}`)
  }

  // execute
  const executeParams = [
    fundAddress,
    SwapRouterAddress,
    calldata,
    ethAmount,
    maker,
    true,
  ];

  return await SendTransaction(
    FundManagerAddress[chainId],
    FundManagerABI,
    'executeOrder',
    executeParams,
    options,
    signer
  );
};

const calcEthAmount = (params: SwapParams, chainId: number) => {
  if (!params.useNative) return constants.Zero;
  if (!isEqualAddress(params.tokenIn, WethAddress(chainId))) return constants.Zero;
  return params.amountIn;
};

const calcRecipient = (params: SwapParams, recipient: string, chainId: number) => {
  if (!params.useNative) return recipient;
  if (!isEqualAddress(params.tokenOut, WethAddress(chainId))) return recipient;

  return NativeETHAddress;
};

const exactInputCalldata = async (params: SwapParams, recipient: string, chainId: number, provider: Signer|Provider) => {
  const path = await exactInputPath(
    params.tokenIn,
    params.tokenOut,
    params.amountIn,
    chainId,
    provider
  );

  const swapParams = {
    recipient: calcRecipient(params, recipient, chainId),
    path: path.path,
    amountIn: params.amountIn,
    amountOutMinimum: params.amountOut,
  };

  const calldata = encodeCalldata(SwapRouter02ABI, 'exactInput', [swapParams]);
  if (!params.useNative) return calldata;
  if (!isEqualAddress(params.tokenOut, WethAddress(chainId))) return calldata;

  const unwrap = encodeCalldata(
    SwapRouter02ABI,
    'unwrapWETH9(uint256,address)',
    [params.amountOut, recipient],
  );
  return encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
    params.expiration,
    [calldata, unwrap],
  ]);
};

const exactOutPutCalldata = async (params: SwapParams, recipient: string,chainId: number, provider: Signer|Provider) => {
  const path = await exactOutputPath(
    params.tokenIn,
    params.tokenOut,
    params.amountOut,
    chainId,
    provider
  );

  const swapParams = {
    recipient: calcRecipient(params, recipient, chainId),
    path: path.path,
    amountOut: params.amountOut,
    amountInMaximum: params.amountIn,
  };

  const output = encodeCalldata(SwapRouter02ABI, 'exactOutput', [swapParams]);

  if (!params.useNative) return output;

  switch (true) {
    case isEqualAddress(params.tokenIn, WethAddress(chainId)):
      const refund = encodeCalldata(SwapRouter02ABI, 'refundETH()', []);
      return encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
        params.expiration,
        [output, refund],
      ]);
    case isEqualAddress(params.tokenOut, WethAddress(chainId)):
      const unwrap = encodeCalldata(
        SwapRouter02ABI,
        'unwrapWETH9(uint256,address)',
        [params.amountOut, recipient],
      );

      return encodeCalldata(SwapRouter02ABI, 'multicall(uint256,bytes[])', [
        params.expiration,
        [output, unwrap],
      ]);
    default:
      return output;
  }
};

const encodeCalldata = (abi: any, method: string, params: any) => {
  return useEncodeFuncData(abi, method, params);
};

export { useExecuteSwap };
