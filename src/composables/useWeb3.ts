import { Signer } from 'ethers';
import { useContract } from './useContract';

const SendTransaction = async (
  contractAddress: string,
  contractABI: any,
  functionFragment: string,
  params: any[],
  overrides: any = {},
  signer: Signer,
) => {
  try {
    const contract = useContract(contractAddress, contractABI, signer);

    if (!overrides.gasLimit) {
      const estimateGas = await contract.estimateGas[functionFragment](
        ...params,
        overrides,
      );
      overrides.gasLimit = estimateGas.mul(110).div(100);
    }

    return [await contract[functionFragment](...params, overrides), null];
  } catch (e: any) {
    if (e.body) {
      const body = JSON.parse(e.body);
      return [null, body.error.message, body.error.code];
    } else {
      return [null, e?.message || e?.reason || e?.error, e?.code];
    }
  }
};

export {
  SendTransaction,
};
