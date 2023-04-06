import { Provider } from '@ethersproject/abstract-provider';
import { Contract, Signer, utils } from 'ethers';

const useContract = (addr: string, abi: any, provider: Signer | Provider) => {
  return new Contract(addr, abi, provider);
};

const useInterface = (abi: any) => {
  return new utils.Interface(abi);
};

const useEncodeFuncData = (abi: any, funcName: string, funcData: any) => {
  return useInterface(abi).encodeFunctionData(funcName, funcData);
};

export { useContract, useEncodeFuncData };
