import { TokenList } from '@defund-protocol/token-list';
export const useToken = (chainId, addressOrSymbol) => {
    return new TokenList(chainId).token(addressOrSymbol);
};
