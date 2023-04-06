import { Provider } from '@ethersproject/abstract-provider';
import { FeeAmount } from '@uniswap/v3-sdk';
import { BigNumber, Signer } from 'ethers';
import { PathFinderABI, PathFinderAddress } from '../../constants/contract';
import { WethAddress } from '../../constants/token';
import { useContract } from '../useContract';
import { isEqualAddress } from '../useUtils';

const pathFinderContract = (chainId: number, provider: Signer | Provider) => {
  return useContract(PathFinderAddress[chainId], PathFinderABI, provider);
};

const exactInputPath = async (
  tokenIn: string,
  tokenOut: string,
  amount: BigNumber,
  chainId: number,
  provider: Signer | Provider
) => {
  return await pathFinderContract(chainId, provider).callStatic.exactInputPath(
    tokenIn,
    tokenOut,
    amount
  );
};

const exactOutputPath = async (
  tokenIn: string,
  tokenOut: string,
  amount: BigNumber,
  chainId: number,
  provider: Signer | Provider
) => {
  return await pathFinderContract(chainId, provider).callStatic.exactOutputPath(
    tokenIn,
    tokenOut,
    amount
  );
};

const fallbackPath = (token0: string, token1: string, chainId: number) => {
  const weth = WethAddress[chainId];
  if (isEqualAddress(token0, weth) || isEqualAddress(weth, token1)) {
    return encodePath([token0, token1], [FeeAmount.MEDIUM]);
  } else {
    return encodePath(
      [token0, weth, token1],
      [FeeAmount.MEDIUM, FeeAmount.MEDIUM]
    );
  }
};

const FEE_SIZE = 3;

const encodePath = (path: string[], fees: FeeAmount[]): string => {
  if (path.length != fees.length + 1) {
    throw new Error('path/fee lengths do not match');
  }

  let encoded = '0x';
  for (let i = 0; i < fees.length; i++) {
    // 20 byte encoding of the address
    encoded += path[i].slice(2);
    // 3 byte encoding of the fee
    encoded += fees[i].toString(16).padStart(2 * FEE_SIZE, '0');
  }
  // encode the final token
  encoded += path[path.length - 1].slice(2);

  return encoded.toLowerCase();
};
export { exactInputPath, exactOutputPath, fallbackPath };
