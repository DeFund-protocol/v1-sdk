import { Contract, utils } from 'ethers';
const useContract = (addr, abi, provider) => {
    return new Contract(addr, abi, provider);
};
const useInterface = (abi) => {
    return new utils.Interface(abi);
};
const useEncodeFuncData = (abi, funcName, funcData) => {
    return useInterface(abi).encodeFunctionData(funcName, funcData);
};
export { useContract, useEncodeFuncData, };
