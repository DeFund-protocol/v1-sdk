import { BigNumber, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { FeeAmount } from '@uniswap/v3-sdk';
import { WethAddress } from '../constants/token';

const isAddress = (value: any): boolean => {
  try {
    return getAddress(value) !== null;
  } catch {
    return false;
  }
};

const isEqualAddress = (address1: string, address2: string) => {
  return (
    isAddress(address1) &&
    isAddress(address2) &&
    getAddress(address1) === getAddress(address2)
  );
};

const formatDetailData = (data: any) => {
  if (!data) return;
  if (typeof data === 'string' || typeof data === 'number') return data;
  if (data instanceof BigNumber) return data.toString();
  if (data instanceof Array && data.length === 0) return data;

  const keys = Object.keys(data);
  if (keys.length === 0) return data;

  const params: any = {};

  for (let i = 0; i < Object.keys(data).length; i++) {
    if (!isNaN(parseInt(keys[i]))) continue;

    switch (true) {
      case data[keys[i]] instanceof BigNumber:
        params[keys[i]] = data[keys[i]].toString();
        break;
      case data[keys[i]] instanceof Array:
        const isRealHash = Object.keys(data[keys[i]]).find((key: any) => {
          return isNaN(parseInt(key));
        });

        if (isRealHash) {
          params[keys[i]] = formatDetailData(data[keys[i]]);
        } else {
          const arrayData = [];
          for (let j = 0; j < data[keys[i]].length; j++) {
            arrayData.push(formatDetailData(data[keys[i]][j]));
          }
          params[keys[i]] = arrayData;
        }

        break;
      default:
        params[keys[i]] = data[keys[i]];
    }
  }

  return params;
};

const FEE_SIZE = 3;

function encodePath(path: string[], fees: FeeAmount[]): string {
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
}

// Merge ETH balance to WETH & remove ETH from list
function mergedTokenBalances(chainId: number, tokenBalances: any[]) {
  const ethBalance = tokenBalances.find((item: any) =>
    isEqualAddress(item.token, ethers.constants.AddressZero)
  );
  const wethBalance = Object.assign(
    {},
    tokenBalances.find((item: any) =>
      isEqualAddress(item.token, WethAddress[chainId])
    )
  );
  if (ethBalance && wethBalance) {
    wethBalance.balance = wethBalance.balance.add(ethBalance.balance);
    wethBalance.value = wethBalance.value.add(ethBalance.value);
  }
  const otherTokens = tokenBalances.filter(
    (item: any) =>
      !isEqualAddress(item.token, ethers.constants.AddressZero) &&
      !isEqualAddress(item.token, WethAddress[chainId])
  );
  if (wethBalance) {
    return [...otherTokens, wethBalance];
  }
  return otherTokens;
}

export {
  isAddress,
  isEqualAddress,
  formatDetailData,
  encodePath,
  mergedTokenBalances
};
