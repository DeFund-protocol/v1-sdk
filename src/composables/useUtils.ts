import { getAddress } from 'ethers/lib/utils';

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

export {
  isAddress,
  isEqualAddress,
};
