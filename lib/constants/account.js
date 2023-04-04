import { Wallet } from 'ethers';
const SignerAccount = (privateKey, provider) => {
    return new Wallet(privateKey, provider);
};
export { SignerAccount };
