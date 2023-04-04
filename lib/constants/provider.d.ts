import { providers } from 'ethers';
declare const infuraProvider: providers.InfuraProvider;
declare const alchemyProvider: providers.AlchemyProvider;
export { infuraProvider, alchemyProvider, };
export declare class Provider {
    readonly ChainId: number;
    readonly apiKey: string;
    constructor(ChainId: number, apiKey: string);
}
