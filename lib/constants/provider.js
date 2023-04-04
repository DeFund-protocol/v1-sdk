import * as dotenv from 'dotenv';
import { providers } from 'ethers';
dotenv.config();
const ChainId = parseInt(process.env.CHAIN_ID || '1');
const InfuraKey = process.env.INFURA_KEY;
const AlchemyKey = process.env.ALCHEMY_KEY;
const infuraProvider = new providers.InfuraProvider(ChainId, InfuraKey);
const alchemyProvider = new providers.AlchemyProvider(ChainId, AlchemyKey);
export { infuraProvider, alchemyProvider, };
export class Provider {
    ChainId;
    apiKey;
    constructor(ChainId, apiKey) {
        this.ChainId = ChainId;
        this.apiKey = apiKey;
    }
}
