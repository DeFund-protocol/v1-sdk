import { Signer } from 'ethers';
declare const SendTransaction: (contractAddress: string, contractABI: any, functionFragment: string, params: any[], overrides: any, signer: Signer) => Promise<any>;
export { SendTransaction };
