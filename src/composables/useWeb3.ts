import { Signer } from 'ethers';
import { useContract } from './useContract';

const sendTransaction = async (
  contractAddress: string,
  contractABI: any,
  functionFragment: string,
  params: any[],
  overrides: any = {},
  signer: Signer
) => {
  try {
    const contract = useContract(contractAddress, contractABI, signer);

    if (!overrides.gasLimit) {
      const estimateGas = await contract.estimateGas[functionFragment](
        ...params,
        overrides
      );
      overrides.gasLimit = estimateGas.mul(110).div(100);
    }

    return await contract[functionFragment](...params, overrides);
  } catch (e: any) {
    throw e;
  }
};

const getAddressFromSigner = async (signer: Signer): Promise<string> => {
  return await signer.getAddress();
};

export { sendTransaction, getAddressFromSigner };
