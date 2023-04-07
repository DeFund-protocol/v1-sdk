import { Provider } from '@ethersproject/abstract-provider';
import { Contract, Signer } from 'ethers';
declare const useContract: (addr: string, abi: any, provider: Signer | Provider) => Contract;
declare const useEncodeFuncData: (abi: any, funcName: string, funcData: any) => string;
export { useContract, useEncodeFuncData };
