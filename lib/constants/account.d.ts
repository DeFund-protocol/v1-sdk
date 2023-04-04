import { Provider } from '@ethersproject/abstract-provider';
import { Wallet } from 'ethers';
declare const SignerAccount: (privateKey: string, provider: Provider) => Wallet;
export { SignerAccount };
