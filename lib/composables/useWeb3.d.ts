import { Signer } from 'ethers';
declare const sendTransaction: (contractAddress: string, contractABI: any, functionFragment: string, params: any[], overrides: any, signer: Signer) => Promise<any>;
declare const getAddressFromSigner: (signer: Signer) => Promise<string>;
export { sendTransaction, getAddressFromSigner };
