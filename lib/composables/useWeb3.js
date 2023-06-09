import { useContract } from './useContract';
const sendTransaction = async (contractAddress, contractABI, functionFragment, params, overrides = {}, signer) => {
    try {
        const contract = useContract(contractAddress, contractABI, signer);
        if (!overrides.gasLimit) {
            const estimateGas = await contract.estimateGas[functionFragment](...params, overrides);
            overrides.gasLimit = estimateGas.mul(110).div(100);
        }
        return await contract[functionFragment](...params, overrides);
    }
    catch (e) {
        throw e;
    }
};
const getAddressFromSigner = async (signer) => {
    return await signer.getAddress();
};
export { sendTransaction, getAddressFromSigner };
