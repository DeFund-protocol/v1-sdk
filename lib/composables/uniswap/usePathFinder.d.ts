import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, Signer } from 'ethers';
declare const exactInputPath: (tokenIn: string, tokenOut: string, amount: BigNumber, chainId: number, provider: Signer | Provider) => Promise<any>;
declare const exactOutputPath: (tokenIn: string, tokenOut: string, amount: BigNumber, chainId: number, provider: Signer | Provider) => Promise<any>;
declare const fallbackPath: (token0: string, token1: string, chainId: number) => string;
export { exactInputPath, exactOutputPath, fallbackPath };
