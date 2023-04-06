import { Provider } from '@ethersproject/abstract-provider';
import { Wallet } from 'ethers';

const SignerAccount = (privateKey: string, provider: Provider) => {
  return new Wallet(privateKey, provider);
};

export { SignerAccount };
